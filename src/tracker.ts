import dgram, { Socket } from 'dgram';
import { randomBytes } from "crypto";
import { genId } from "./util";
import { torrentParser } from "./torrent-parser";
import { Torrent, GetPeersCallback } from './types';

export const getPeers = (torrent: Torrent, callback: GetPeersCallback) => {
  const socket = dgram.createSocket("udp4");
  const url = "udp://tracker.opentrackr.org:1337/announce";
  // const url = Buffer.from(torrent.announce).toString("utf8"); 

  udpSend(socket, buildConnReq(), url);

  socket.on("message", (response) => {
    if (respType(response) === "connect") {
      console.log("GOT 'CONNECT'")
      const connResp = parseConnResp(response);
      const announceResp = buildAnnounceReq(connResp.connectionId, torrent);

      udpSend(socket, announceResp, url);
    } else if (respType(response) === "announce") {
      console.log("GOT 'ANNOUNCE'")
      const announceResp = parseAnnounceResp(response);
      callback(announceResp.peers);
    }
  });
}

const udpSend = (socket: Socket, message: Buffer, rawUrl: string, callback = () => {}) => {
  const url = new URL(rawUrl);
  socket.send(message, 0, message.length, Number(url.port), url.hostname, callback);
}

const respType = (resp: Buffer) => resp.readUInt32BE(0) === 0 ? "connect" : "announce";

const buildConnReq = () => {
  const buf = Buffer.alloc(16);

  buf.writeBigUInt64BE(0x41727101980n, 0);
  buf.writeUInt32BE(0, 8);
  
  randomBytes(4).copy(buf, 12);
  
  return buf;
}


const parseConnResp = (resp: Buffer) => {
  return {
    action: resp.readUInt32BE(0),
    transactionId: resp.readUInt32BE(4),
    connectionId: resp.subarray(8, 16)
  }
}


const buildAnnounceReq = (connId: Buffer, torrent: Torrent, port: number = 6881) => {
  const buf = Buffer.allocUnsafe(98);

  connId.copy(buf, 0);
  buf.writeUInt32BE(1, 8);
  randomBytes(4).copy(buf, 12);
  torrentParser.infoHash(torrent).copy(buf, 16);
  genId().copy(buf, 36);

  buf.writeBigUInt64BE(0n, 56);
  buf.writeBigUInt64BE(torrentParser.size(torrent), 64);
  buf.writeBigUInt64BE(0n, 72);
  
  buf.writeUInt32BE(0, 80); 
  buf.writeUInt32BE(0, 84);
  randomBytes(4).copy(buf, 88);
  buf.writeInt32BE(-1, 92);
  buf.writeUInt16BE(port, 96);

  return buf;
}


const parseAnnounceResp = (resp: Buffer) => {
  function group(iterable: Buffer, groupSize: number): Buffer[] {
    const groups: Buffer[] = [];
    for (let i = 0; i < iterable.length; i += groupSize) {
      groups.push(iterable.subarray(i, i + groupSize));
    }
    return groups;
  }

  const peers = group(resp.subarray(20), 6).map((address: Buffer) => ({
    ip: address.subarray(0, 4).join('.'),
    port: address.readUInt16BE(4)
  }));

  return {
    action: resp.readUInt32BE(0),
    transactionId: resp.readUInt32BE(4),
    interval: resp.readUInt32BE(8),
    leechers: resp.readUInt32BE(12),
    seeders: resp.readUInt32BE(16),
    peers
  };
}

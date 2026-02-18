import dgram, { Socket } from 'dgram';
import { randomBytes } from "crypto";
import { genId } from "./util";
import { torrentParser } from "./torrent-parser";
import { Torrent } from './types';

// export const getPeers = (torrent: any, callback) => {
//   const socket = dgram.createSocket("udp4");
//   const url = torrent.announce.toString("utf-8") as string;

//   // 1. send connect request
//   udpSend(socket, buildConnReq(), url);

//   socket.on("message", (response) => {
//     if (respType(response) === "connect") {
//       const connResp = parseConnResp(response);
//       const announceResp = buildAnnounceReq(connResp.connectionId);

//       udpSend(socket, announceResp, url);
//     } else if (respType(response) === "announce") {
//       const announceResp = parseAnnounceResp(response);
//       callback(announceResp.peers);
//     }
//   });
// }

function udpSend(socket: Socket, message: Buffer, rawUrl: string, callback = () => {}) {
  const url = new URL(rawUrl);
  socket.send(message, 0, message.length, Number(url.port), url.host, callback)
}

function respType(resp) {
  // ...
}

function buildConnReq(): Buffer {
  const buf = Buffer.alloc(16);

  buf.writeBigUInt64BE(0x41727101980n, 0);
  buf.writeUInt32BE(0, 8);
  
  randomBytes(4).copy(buf, 12);
  
  return buf;
}


function parseConnResp(resp: Buffer) {
  return {
    action: resp.readUInt32BE(0),
    transactionId: resp.readUInt32BE(4),
    connectionId: resp.subarray(8, 16)
  }
}


function buildAnnounceReq(connId: Buffer, torrent: Torrent, port: number = 6881) {
  const buf = Buffer.allocUnsafe(98);

  connId.copy(buf, 0);
  buf.writeUInt32BE(1, 8);
  randomBytes(4).copy(buf, 12);
  torrentParser.infoHash(torrent).copy(buf, 16);
  genId().copy(buf, 36);

  // 56-63: downloaded = 0
  buf.writeBigUInt64BE(0n, 56);
  // 64-71: left = total size
  buf.writeBigUInt64BE(torrentParser.size(torrent), 64);
  // 72-79: uploaded = 0
  buf.writeBigUInt64BE(0n, 72);
  
  buf.writeUInt32BE(0, 80);  // event (0=none)
  buf.writeUInt32BE(0, 84);  // IP (0=default)
  randomBytes(4).copy(buf, 88);  // key
  buf.writeInt32BE(-1, 92);  // num_want
  buf.writeUInt16BE(port, 96);  // port

  return buf;
}


function parseAnnounceResp(resp: Buffer) {
  function group(iterable: Buffer, groupSize: number): Buffer[] {
    const groups: Buffer[] = [];
    for (let i = 0; i < iterable.length; i += groupSize) {
      groups.push(iterable.subarray(i, i + groupSize));  // subarray()!
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

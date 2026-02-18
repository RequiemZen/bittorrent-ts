import { torrentParser } from "./torrent-parser";
import { Torrent } from "./types";
import { genId } from "./util";

export const buildHandshake = (torrent: Torrent) => {
  const buf = Buffer.alloc(68);

  buf.writeUint8(19, 0);
  buf.write("BitTorrent protocol", 1);
  buf.writeUInt32BE(0, 20);
  buf.writeUInt32BE(0, 24);

  torrentParser.infoHash(torrent).copy(buf, 28);
  genId().copy(buf, 48);

  return buf;
}

export const buildKeepAlive = () => Buffer.alloc(4);

export const buildChoke = () => {
  const buf = Buffer.alloc(5);

  buf.writeUInt32BE(1, 0);
  buf.writeUInt8(0, 4);

  return buf;
};

export const buildUnchoke = () => {
  const buf = Buffer.alloc(5);

  buf.writeUInt32BE(1, 0);
  buf.writeUInt8(1, 4);

  return buf;
};

export const buildInterested = () => {
  const buf = Buffer.alloc(5);

  buf.writeUInt32BE(1, 0);
  buf.writeUInt8(2, 4);

  return buf;
};

export const buildUninterested = () => {
  const buf = Buffer.alloc(5);

  buf.writeUInt32BE(1, 0);
  buf.writeUInt8(3, 4);

  return buf;
};

export const buildHave = (payload: number) => {
  const buf = Buffer.alloc(9);

  buf.writeUInt32BE(5, 0);
  buf.writeUInt8(4, 4);
  buf.writeUInt32BE(payload, 5);

  return buf;
};

export const buildBitfield = (bitfield: Buffer) => {
  const buf = Buffer.alloc(bitfield.length + 1 + 4);

  buf.writeUInt32BE(bitfield.length + 1, 0);
  buf.writeUInt8(5, 4);
  bitfield.copy(buf, 5);

  return buf;
};

export const buildRequest = (payload: any) => {
  const buf = Buffer.alloc(17);

  buf.writeUInt32BE(13, 0);
  buf.writeUInt8(6, 4);
  buf.writeUInt32BE(payload.index, 5);
  buf.writeUInt32BE(payload.begin, 9);
  buf.writeUInt32BE(payload.length, 13);
  
  return buf;
};

export const buildPiece = (payload: any) => {
  const buf = Buffer.alloc(payload.block.length + 13);

  buf.writeUInt32BE(payload.block.length + 9, 0);
  buf.writeUInt8(7, 4);
  buf.writeUInt32BE(payload.index, 5);
  buf.writeUInt32BE(payload.begin, 9);
  payload.block.copy(buf, 13);
  
  return buf;
};

export const buildCancel = (payload: any) => {
  const buf = Buffer.alloc(17);

  buf.writeUInt32BE(13, 0);
  buf.writeUInt8(8, 4);
  buf.writeUInt32BE(payload.index, 5);
  buf.writeUInt32BE(payload.begin, 9);
  buf.writeUInt32BE(payload.length, 13);

  return buf;
};

export const buildPort = (payload: any) => {
  const buf = Buffer.alloc(7);

  buf.writeUInt32BE(3, 0);
  buf.writeUInt8(9, 4);
  buf.writeUInt16BE(payload, 5);

  return buf;
};
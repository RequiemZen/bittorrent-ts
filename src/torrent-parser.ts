import fs from "fs";
import bencode from "bencode";
import { createHash } from "crypto";
import { Torrent } from "./types";

export const torrentParser = {
  open: (filepath: string): Torrent => bencode.decode(fs.readFileSync(filepath)),
  size: (torrent: Torrent): bigint => 
    torrent.info.files 
      ? torrent.info.files.reduce((sum, f) => sum + BigInt(f.length), 0n)
      : BigInt(torrent.info.length!),
  infoHash: (torrent: Torrent): Buffer => {
    const info = bencode.encode(torrent.info);
    return createHash("sha1").update(info).digest()
  },
}

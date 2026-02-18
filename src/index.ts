import fs from "fs";
import bencode from "bencode";
import { getPeers } from "./tracker"
import { torrentParser } from "./torrent-parser";

let torrent = torrentParser.open("puppy.torrent");

getPeers(torrent, (peers) => {
  console.log(`list of peers: ${peers}`);
})
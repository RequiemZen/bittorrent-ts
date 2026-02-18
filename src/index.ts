import fs from "fs";
import bencode from "bencode";
// import { getPeers } from "./tracker"
import { torrentParser } from "./torrent-parser";
import path from "path";

const torrent = torrentParser.open("puppy.torrent");
console.log(torrentParser.size(torrent));

// getPeers(torrent, peers => {
//   console.log(`list of peers: ${peers}`);
// })
import { getPeers } from "./src/tracker"
import { torrentParser } from "./src/torrent-parser";

// let torrent = torrentParser.open(process.argv[2]);
let torrent = torrentParser.open("fedora.torrent");

getPeers(torrent, (peers) => {
  console.log("list of peers:", peers);
})
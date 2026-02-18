import net from "net";
import { getPeers } from "./tracker";
import { Peer, Torrent } from "./types";
import { Socket } from "net";

export default (torrent: Torrent) => {
  getPeers(torrent, (peers) => peers.forEach(download));
};

const download = (peer: Peer) => {
  const socket = new net.Socket();
  socket.on('error', console.log);
  socket.connect(peer.port, peer.ip, () => {

  });
  socket.on("data", (data) => {

  });
  onWholeMsg(socket, data => {
    // handle response here
  });
}

const onWholeMsg = (socket: Socket, callback: (msg: Buffer) => void) => {
  let savedBuf = Buffer.alloc(0);
  let handshake = true;

  socket.on("data", (recvBuf: Buffer)  => {
    const msgLen = (): number => 
      handshake 
        ? savedBuf.readUint8(0) + 49 
        : savedBuf.readUint32BE(0) + 5;

    savedBuf = Buffer.concat([savedBuf, recvBuf]);

    while (savedBuf.length >= 4 && savedBuf.length > msgLen()) {
      callback(savedBuf.subarray(0, msgLen()));
      savedBuf = savedBuf.subarray(msgLen());
      handshake = false;
    }
  })
}
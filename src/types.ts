interface TorrentFile {
  length: number;
  path: Uint8Array[];
}

interface TorrentInfo {
  // common required
  name: Uint8Array;
  'piece length': number;
  pieces: Uint8Array;

  // single-file OR multi-file (one of these must exist)
  length?: number;
  files?: TorrentFile[];
}

export interface Torrent {
  // required
  info: TorrentInfo; 
  announce: Uint8Array; 

  // optional top-level fields
  'announce-list'?: Uint8Array[][];
  'creation date'?: number;
  'created by'?: Uint8Array;
  comment?: Uint8Array;
  encoding?: Uint8Array;
  'url-list'?: Uint8Array[];
}

export interface Peer {
  ip: string;
  port: number;
}

export type GetPeersCallback = (peers: Peer[]) => void;
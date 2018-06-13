import Peer from "peerjs";

import { WEBRTC_SERVER, WEBRTC_API_KEY, WEBRTC_PORT } from '../constants/config';

export const createPeer = (peerId) => {
    const peer = new Peer(peerId, {
        key: WEBRTC_API_KEY,
        debug: 3,
        host: WEBRTC_SERVER,
        port: WEBRTC_PORT,
      });

    return peer;
};

export const connectPlayer = (peer, peerId) => {
    const conn = peer.connect(peerId);

    return conn;
};

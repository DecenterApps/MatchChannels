import Peer from "peerjs";

import { WEBRTC_SERVER, WEBRTC_API_KEY, WEBRTC_PORT } from '../constants/config';

import short from 'short-uuid';

export const createPeer = () => {
    const peerId = short.uuid();

    const peer = new Peer(peerId, {
        key: WEBRTC_API_KEY,
        debug: 3,
        host: WEBRTC_SERVER,
        port: WEBRTC_PORT,
      });

    return {
        peer,
        peerId
    };
};

export const connect = (peer, peerId) => {
    const conn = peer.connect('abc');

    return conn;
};

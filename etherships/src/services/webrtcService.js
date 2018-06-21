import Peer from "peerjs";

import { WEBRTC_SERVER, WEBRTC_API_KEY, WEBRTC_PORT } from '../constants/config';

import short from 'short-uuid';
import { browserHistory } from 'react-router'


export const createPeer = (peerId) => {

    try {
        const peer = new Peer(peerId, {
            key: WEBRTC_API_KEY,
            debug: 3,
            host: WEBRTC_SERVER,
            port: WEBRTC_PORT,
          });

          peer.on('error', (err) => {
            console.log('error', err);

            if (err.message.indexOf('Lost connection') !== -1) {
                localStorage.setItem('peer', peerId);
            } else {
                localStorage.setItem('peer', short.uuid());
            }

            browserHistory.push('/');
          });
    
        return peer;
    } catch(err) {
        console.log(err);

        return null;
    }
};

export const connectPlayer = (peer, peerId) => {
    try {
        const conn = peer.connect(peerId);
        return conn;

    } catch(err) {
        console.log(err);

        return null;
    }
};

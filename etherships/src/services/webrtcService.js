import Peer from "peerjs";

import { WEBRTC_SERVER, WEBRTC_API_KEY, WEBRTC_PORT } from '../constants/config';

import short from 'short-uuid';
import { browserHistory } from 'react-router'

let peer;
let conn;

export const createPeer = (peerId) => {
  try {
    peer = new Peer(peerId, {
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

    peer.on('connection', (_conn) => { conn = _conn });

    return peer;
  } catch (err) {
    console.log(err);
    return null;
  }
};

export const connectToPlayer = (peerId) => {
    try {
        conn = peer.connect(peerId);
        return conn;
    } catch(err) {
        console.log(err);
        return null;
    }
};

export const setConnection = (_conn) => conn = _conn;

export const send = (data) => {
  if (!conn) {
    console.error('Message not sent - connection missing!', data);
    return false;
  }
  console.log('Sending message', data);
  conn.send(data);
};
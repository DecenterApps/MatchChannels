import Peer from "peerjs";

import { WEBRTC_SERVER, WEBRTC_API_KEY, WEBRTC_PORT } from '../constants/config';

import short from 'short-uuid';

let peer;
let conn;

export const createPeer = (peerId) => {
  try {
    peer = new Peer(peerId, {
      key: WEBRTC_API_KEY,
      debug: 3,
      host: WEBRTC_SERVER,
      port: WEBRTC_PORT,
      secure: true,
      config: {
        'iceServers': [
          {url:'stun:stun01.sipphone.com'},
          {url:'stun:stun.ekiga.net'},
          {url:'stun:stun.fwdnet.net'},
          {url:'stun:stun.ideasip.com'},
          {url:'stun:stun.iptel.org'},
          {url:'stun:stun.rixtelecom.se'},
          {url:'stun:stun.schlund.de'},
          {url:'stun:stun.l.google.com:19302'},
          {url:'stun:stun1.l.google.com:19302'},
          {url:'stun:stun2.l.google.com:19302'},
          {url:'stun:stun3.l.google.com:19302'},
          {url:'stun:stun4.l.google.com:19302'},
          {url:'stun:stunserver.org'},
          {url:'stun:stun.softjoys.com'},
          {url:'stun:stun.voiparound.com'},
          {url:'stun:stun.voipbuster.com'},
          {url:'stun:stun.voipstunt.com'},
          {url:'stun:stun.voxgratia.org'},
          {url:'stun:stun.xten.com'},
          {
            url: 'turn:numb.viagenie.ca',
            credential: 'muazkh',
            username: 'webrtc@live.com'
          },
          {
            url: 'turn:192.158.29.39:3478?transport=udp',
            credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
            username: '28224511:1379330808'
          },
          {
            url: 'turn:192.158.29.39:3478?transport=tcp',
            credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
            username: '28224511:1379330808'
          }
        ]
    }
    });

    peer.on('error', (err) => {
      console.log('error', err);

      if(err.message.indexOf('is taken') !== -1) {
        localStorage.setItem('peer', short.uuid());
        window.location.reload();
      } else if(err.message.indexOf('Could not connect to peer ') !== -1) {
         localStorage.removeItem('user');
         localStorage.removeItem('board');
      }
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

export const setWebRTCConnection = (_conn) => conn = _conn;

export const send = (data) => {
  if (!conn) {
    console.error('Message not sent - connection missing!', data);
    return false;
  }

  conn.send(data);
};
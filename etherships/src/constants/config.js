
export const BOARD_LENGTH = 8;
export const WEBRTC_SERVER = 'gametest.decenter.com';
export const WEBRTC_API_KEY = 'peerjs';
export const WEBRTC_PORT = 4443;

export const ETHERSHIP_ADDRESS = '0x06c1ce66d747823ac01ec064840d8391170ec6a7';

export const NUM_BLOCKS_FOR_CHANNEL = 60;

export const DEFAULT_PRICE = 1000000000000000; // 0.001 eth

export const REFRESH_LOBBY_TIME = 10000; //10s

export const TIMEOUT_WAIT_PERIOD = 60;

// In the board 0,1,2,3 represent the state of the ships
export const EMPTY_FIELD = 0;
export const PLAYERS_SHIP = 1;
export const MISSED_SHIP = 2;
export const SUNK_SHIP = 3;

export const SECONDS_PER_TURN = 30;

export const customModalStyles = {
    content : {
      top                   : '50%',
      left                  : '50%',
      right                 : 'auto',
      bottom                : 'auto',
      marginRight           : '-50%',
      transform             : 'translate(-50%, -50%)',
      background: '#302E38',
      border: 'none',
      borderRadius: '10px',
    },
    overlay: {
        backgroundColor: 'rgba(15, 13, 13, 0.9)',
    }
};
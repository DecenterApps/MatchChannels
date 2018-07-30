
export const BOARD_LENGTH = 8;
export const WEBRTC_SERVER = 'reddapp.decenter.com';
export const WEBRTC_API_KEY = 'asdf';
export const WEBRTC_PORT = 9000;

export const ETHERSHIP_ADDRESS = '0x09fbf94451873ed5c1bbc5d7c9e13dc75624c171';

export const NUM_BLOCKS_FOR_CHANNEL = 50;

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
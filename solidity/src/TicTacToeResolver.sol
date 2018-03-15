pragma solidity 0.4.21;

import "./ResolverInterface.sol";

contract TicTacToeResolver is ResolverInterface {
    
    struct State {
        uint8[9] board; // 2 = O, 1 = X, 0 = not set
        uint8 currMove; // position on the board of the current move
        uint32 sequence; // counter
    }

    function resolve(bytes _previous, bytes _current) external pure returns(bool) {
        // check if the current.move is valid based on _previous state
        // check if the sequences are correct
        
        uint8[2] memory moves;
        uint32[2] memory sequences;
        
        uint8[9] memory prevBoard;
        uint8[9] memory currBoard;
        
        (prevBoard, moves[0], sequences[0]) = _getState(_previous);
        (currBoard, moves[1], sequences[1]) = _getState(_current);
        
        require((sequences[0] + 1) == sequences[1]);
        
        // tried to set an already used field || played as a wrong type of player
        if (prevBoard[moves[1]] != 0 || prevBoard[moves[0]] == currBoard[moves[1]]) {
            return false;
        }
        
        return true;
    }
    
    function isWinner(bytes _currState, uint _w) external pure returns(bool) {
        
        uint8[9] memory b;
        
        (b, , ) = _getState(_currState);
        
        return ((b[6] == _w && b[7] == _w && b[8] == _w) || // across the top
            (b[3] == _w && b[4] == _w && b[5] == _w) || // across the middle
            (b[0] == _w && b[1] == _w && b[2] == _w) || // across the bottom
            (b[6] == _w && b[3] == _w && b[0] == _w) || // down the left side
            (b[7] == _w && b[4] == _w && b[1] == _w) || // down the middle
            (b[8] == _w && b[5] == _w && b[2] == _w) || // down the right side
            (b[6] == _w && b[4] == _w && b[2] == _w) || // diagonal
            (b[8] == _w && b[4] == _w && b[0] == _w)); // diagonal
    }
    
    function _getState(bytes _state) private pure returns(uint8[9], uint8, uint32) {
        uint8 b0;
        uint8 b1;
        uint8 b2;
        uint8 b3;
        uint8 b4;
        uint8 b5;
        uint8 b6;
        uint8 b7;
        uint8 b8;
        
        uint8 move;
        uint8 sequence;

        assembly {
            b0 := mload(add(_state, 8))
            b1 := mload(add(_state, 16))
            b2 := mload(add(_state, 24))
            b3 := mload(add(_state, 32))
            b4 := mload(add(_state, 40))
            b5 := mload(add(_state, 48))
            b6 := mload(add(_state, 56))
            b7 := mload(add(_state, 64))
            b8 := mload(add(_state, 72))
            move := mload(add(_state, 80))
            sequence := mload(add(_state, 112))
        }
        
        return (
            [b0, b1, b2, b3, b4, b5, b6, b7, b8],
            move,
            sequence
        );
        
    }
    
    function _getMove(bytes _state) private pure returns(uint8 move) {
        assembly {
            move := mload(add(_state, 80))
        }
    }
    
}
pragma solidity ^0.4.18;

import "./ResolverInterface.sol";

contract TicTacToeResolver is ResolverInterface {
    
    event Log(uint32 sequence1, uint32 sequence2);

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

    function getSequence(bytes _state) external view returns(uint) {
        uint sequence;
        (,,sequence) = _getState(_state);

        return sequence;
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
    
    function _getState(bytes _state) private pure returns(uint8[9], uint8, uint8) {
        uint8[9] memory table;
        
        byte move;
        byte sequence;

        for (uint i=0; i<9; i++){
            byte t;
            assembly {
                t := mload(add(_state, add(32, i)))
            }
            table[i] = uint8(t) - 48;
        }
        
        assembly {
            move := mload(add(_state, 41))
            sequence := mload(add(_state, 42))
        }
        
        return (table, uint8(move)-48, uint8(sequence)-48);
    }
    
    function _getMove(bytes _state) private pure returns(uint8 move) {
        assembly {
            move := mload(add(_state, 80))
        }
    }
    
}
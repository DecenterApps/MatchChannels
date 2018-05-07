pragma solidity ^0.4.23;

interface ResolverInterface {
    function resolve(bytes _previous, bytes _current) external pure returns(bool);
    function isWinner(bytes _currState, uint _w) external pure returns(bool);
}
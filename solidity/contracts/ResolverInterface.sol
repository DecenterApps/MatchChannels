pragma solidity ^0.4.23;

interface ResolverInterface {
    function resolve(bytes _previous, bytes _current) external pure returns(bool);
    function isWinner(bytes _currState, uint _w) external pure returns(bool);
    function getSequence(bytes _state) external view returns(uint);
    function payout(bytes _state, uint _total) external pure returns(uint, uint);
}
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./SimpleDEX.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract DEXFactory is Ownable {
    mapping(address => mapping(address => address)) public getPair;
    address[] public allPairs;

    event PairCreated(address indexed token0, address indexed token1, address pair, uint256 pairCount);

    function createPair(address tokenA, address tokenB) external returns (address pair) {
        require(tokenA != address(0) && tokenB != address(0), "Invalid token address");
        require(tokenA != tokenB, "Tokens must be different");
        require(getPair[tokenA][tokenB] == address(0), "Pair already exists");

        SimpleDEX newPair = new SimpleDEX(tokenA, tokenB);
        pair = address(newPair);

        getPair[tokenA][tokenB] = pair;
        getPair[tokenB][tokenA] = pair;
        allPairs.push(pair);

        emit PairCreated(tokenA, tokenB, pair, allPairs.length);
    }

    function allPairsLength() external view returns (uint256) {
        return allPairs.length;
    }

    function getPairAt(uint256 index) external view returns (address) {
        return allPairs[index];
    }
}

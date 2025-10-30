// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@redstone-finance/evm-connector/contracts/data-services/MainDemoConsumerBase.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PriceFeed is MainDemoConsumerBase, Ownable {
    event PriceUpdated(uint256 ethPriceUsd);

    function validateTimestamp(uint256 receivedTimestampMilliseconds) public view virtual override {
        uint256 blockTimestampMilliseconds = block.timestamp * 1000;
        uint256 maxTimestampDiffMilliseconds = 15 * 60 * 1000; // 15 minutes

        if (blockTimestampMilliseconds > receivedTimestampMilliseconds) {
            require(
                blockTimestampMilliseconds - receivedTimestampMilliseconds <= maxTimestampDiffMilliseconds,
                "Timestamp too old"
            );
        } else {
            require(
                receivedTimestampMilliseconds - blockTimestampMilliseconds <= maxTimestampDiffMilliseconds,
                "Timestamp too far in future"
            );
        }
    }

    function getEthPrice() public view returns (uint256) {
        bytes32[] memory dataFeedIds = new bytes32[](1);
        dataFeedIds[0] = bytes32("ETH");
        uint256[] memory prices = getOracleNumericValuesFromTxMsg(dataFeedIds);
        return prices[0];
    }

    function updatePrice() external onlyOwner {
        uint256 price = getEthPrice();
        emit PriceUpdated(price);
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract WapsewapToken is ERC20, Ownable {
    mapping(address => uint256) public lastFaucetTime;
    uint256 public constant FAUCET_AMOUNT = 100 * 10 ** 18; // 100 WSP
    uint256 public constant FAUCET_COOLDOWN = 24 hours;

    constructor() ERC20("WapsewapToken", "WSP") {
        _mint(msg.sender, 1_000_000 * 10 ** decimals());
    }

    function faucet() external {
        require(block.timestamp >= lastFaucetTime[msg.sender] + FAUCET_COOLDOWN, "Faucet cooldown not met");

        lastFaucetTime[msg.sender] = block.timestamp;
        _mint(msg.sender, FAUCET_AMOUNT);
    }

    function getFaucetInfo(address user) external view returns (uint256 nextFaucetTime, uint256 faucetAmount) {
        nextFaucetTime = lastFaucetTime[user] + FAUCET_COOLDOWN;
        faucetAmount = FAUCET_AMOUNT;
    }
}

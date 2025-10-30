// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SimpleUSDC is ERC20, Ownable {
    constructor() ERC20("SimpleUSDC", "sUSDC") {
        _mint(msg.sender, 1_000_000 * 10 ** 6); // 6 decimals
    }

    function decimals() public view virtual override returns (uint8) {
        return 6;
    }
}

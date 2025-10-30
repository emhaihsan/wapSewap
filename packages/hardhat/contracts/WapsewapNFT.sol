// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract WapsewapNFT is ERC721, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;

    constructor() ERC721("WapsewapNFT", "WSN") {}

    function mint(address to) public onlyOwner returns (uint256) {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _mint(to, tokenId);
        return tokenId;
    }

    function totalSupply() public view returns (uint256) {
        return _tokenIdCounter.current();
    }

    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "ERC721: invalid token ID");
        return string(abi.encodePacked("https://gateway.pinata.cloud/ipfs/", tokenId));
    }
}

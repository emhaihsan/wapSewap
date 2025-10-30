// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract NFTMarketplace is Ownable, IERC721Receiver {
    using SafeMath for uint256;

    IERC721 public nft;
    address payable public immutable feeRecipient;

    uint256 public constant FEE_BPS = 100; // 1% (100/10000)
    uint256 public constant BPS = 10000;

    struct Listing {
        uint256 tokenId;
        address seller;
        uint256 price;
        bool active;
    }

    mapping(uint256 => Listing) public listings;

    event ItemListed(uint256 indexed tokenId, address indexed seller, uint256 price);
    event ItemSold(uint256 indexed tokenId, address indexed seller, address indexed buyer, uint256 price);
    event ItemCanceled(uint256 indexed tokenId, address indexed seller);

    constructor(address _nft, address payable _feeRecipient) {
        nft = IERC721(_nft);
        feeRecipient = _feeRecipient;
    }

    function listItem(uint256 tokenId, uint256 price) external {
        require(nft.ownerOf(tokenId) == msg.sender, "Not owner");
        require(
            nft.getApproved(tokenId) == address(this) || nft.isApprovedForAll(msg.sender, address(this)),
            "Marketplace not approved"
        );
        require(price > 0, "Price must be > 0");

        listings[tokenId] = Listing({tokenId: tokenId, seller: msg.sender, price: price, active: true});

        emit ItemListed(tokenId, msg.sender, price);
    }

    function buyItem(uint256 tokenId) external payable {
        Listing memory listing = listings[tokenId];
        require(listing.active, "Not for sale");
        require(msg.value >= listing.price, "Insufficient payment");

        address seller = listing.seller;
        uint256 price = listing.price;
        uint256 fee = price.mul(FEE_BPS).div(BPS);
        uint256 sellerAmount = price.sub(fee);

        listings[tokenId].active = false;
        delete listings[tokenId];

        nft.safeTransferFrom(seller, msg.sender, tokenId);

        if (fee > 0) {
            feeRecipient.transfer(fee);
        }
        if (sellerAmount > 0) {
            payable(seller).transfer(sellerAmount);
        }

        // Refund overpayment
        uint256 refund = msg.value.sub(price);
        if (refund > 0) {
            payable(msg.sender).transfer(refund);
        }

        emit ItemSold(tokenId, seller, msg.sender, price);
    }

    function cancelListing(uint256 tokenId) external {
        Listing memory listing = listings[tokenId];
        require(listing.active, "Not listed");
        require(listing.seller == msg.sender, "Not seller");

        listings[tokenId].active = false;
        delete listings[tokenId];

        emit ItemCanceled(tokenId, msg.sender);
    }

    function onERC721Received(address, address, uint256, bytes calldata) external pure override returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
    }
}

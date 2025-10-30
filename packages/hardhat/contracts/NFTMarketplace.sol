// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract NFTMarketplace is Ownable, IERC721Receiver {
    using SafeMath for uint256;

    IERC721 public nft;
    IERC20 public paymentToken; // WapsewapToken (WSP)
    address public immutable feeRecipient;

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

    constructor(address _nft, address _paymentToken, address _feeRecipient) {
        nft = IERC721(_nft);
        paymentToken = IERC20(_paymentToken);
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

    function buyItem(uint256 tokenId) external {
        Listing memory listing = listings[tokenId];
        require(listing.active, "Not for sale");
        require(msg.sender != listing.seller, "Cannot buy own NFT");

        address seller = listing.seller;
        uint256 price = listing.price;
        uint256 fee = price.mul(FEE_BPS).div(BPS);
        uint256 sellerAmount = price.sub(fee);

        // Check buyer has enough WSP tokens
        require(paymentToken.balanceOf(msg.sender) >= price, "Insufficient WSP balance");
        require(paymentToken.allowance(msg.sender, address(this)) >= price, "Insufficient WSP allowance");

        listings[tokenId].active = false;
        delete listings[tokenId];

        // Transfer NFT to buyer
        nft.safeTransferFrom(seller, msg.sender, tokenId);

        // Transfer WSP: fee to feeRecipient, rest to seller
        if (fee > 0) {
            require(paymentToken.transferFrom(msg.sender, feeRecipient, fee), "Fee transfer failed");
        }
        if (sellerAmount > 0) {
            require(paymentToken.transferFrom(msg.sender, seller, sellerAmount), "Payment transfer failed");
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

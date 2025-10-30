// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";

contract SimpleDEX is Ownable {
    using SafeERC20 for IERC20;

    IERC20 public token0;
    IERC20 public token1;
    uint256 public reserve0;
    uint256 public reserve1;
    uint256 public totalLiquidity;

    // Fee Distribution
    uint256 public accumulatedFee0;
    uint256 public accumulatedFee1;
    mapping(address => uint256) public claimedFees0;
    mapping(address => uint256) public claimedFees1;

    mapping(address => uint256) public liquidity;

    uint256 public constant FEE_DENOMINATOR = 1000;
    uint256 public constant SWAP_FEE = 3; // 0.3%

    event LiquidityAdded(address indexed provider, uint256 amount0, uint256 amount1, uint256 liquidity);
    event LiquidityRemoved(address indexed provider, uint256 amount0, uint256 amount1, uint256 liquidity);
    event Swapped(address indexed user, address indexed tokenIn, uint256 amountIn, uint256 amountOut);
    event FeesClaimed(address indexed user, uint256 fee0, uint256 fee1);

    constructor(address _token0, address _token1) {
        token0 = IERC20(_token0);
        token1 = IERC20(_token1);
    }

    function addLiquidity(uint256 amount0Desired, uint256 amount1Desired) external {
        uint256 amount0 = amount0Desired;
        uint256 amount1 = amount1Desired;

        if (totalLiquidity == 0) {
            reserve0 = amount0;
            reserve1 = amount1;
            totalLiquidity = amount0;
            liquidity[msg.sender] = amount0;
        } else {
            uint256 amount1Optimal = (amount0 * reserve1) / reserve0;
            if (amount1Optimal <= amount1Desired) {
                amount1 = amount1Optimal;
            } else {
                uint256 amount0Optimal = (amount1Desired * reserve0) / reserve1;
                amount0 = amount0Optimal;
            }
            uint256 addedLiquidity =
                Math.min((amount0 * totalLiquidity) / reserve0, (amount1 * totalLiquidity) / reserve1);
            liquidity[msg.sender] += addedLiquidity;
            totalLiquidity += addedLiquidity;
            reserve0 += amount0;
            reserve1 += amount1;
        }

        if (amount0 > 0) token0.safeTransferFrom(msg.sender, address(this), amount0);
        if (amount1 > 0) token1.safeTransferFrom(msg.sender, address(this), amount1);

        emit LiquidityAdded(msg.sender, amount0, amount1, liquidity[msg.sender]);
    }

    function removeLiquidity(uint256 liquidityAmount) external {
        require(liquidity[msg.sender] >= liquidityAmount, "Insufficient liquidity");

        uint256 amount0 = (liquidityAmount * reserve0) / totalLiquidity;
        uint256 amount1 = (liquidityAmount * reserve1) / totalLiquidity;

        liquidity[msg.sender] -= liquidityAmount;
        totalLiquidity -= liquidityAmount;
        reserve0 -= amount0;
        reserve1 -= amount1;

        if (amount0 > 0) token0.safeTransfer(msg.sender, amount0);
        if (amount1 > 0) token1.safeTransfer(msg.sender, amount1);

        emit LiquidityRemoved(msg.sender, amount0, amount1, liquidityAmount);
    }

    function swap(address tokenIn, uint256 amountIn, uint256 amountOutMin) external {
        require(tokenIn == address(token0) || tokenIn == address(token1), "Invalid token");

        (uint256 reserveIn, uint256 reserveOut) =
            tokenIn == address(token0) ? (reserve0, reserve1) : (reserve1, reserve0);
        require(reserveIn > 0 && reserveOut > 0, "Insufficient liquidity");

        uint256 amountInWithFee = (amountIn * (FEE_DENOMINATOR - SWAP_FEE)) / FEE_DENOMINATOR;
        uint256 feeAmount = amountIn - amountInWithFee;
        uint256 amountOut = (amountInWithFee * reserveOut) / (reserveIn + amountInWithFee);
        require(amountOut >= amountOutMin, "Insufficient output amount");

        if (tokenIn == address(token0)) {
            token0.safeTransferFrom(msg.sender, address(this), amountIn);
            accumulatedFee0 += feeAmount;
            reserve0 += amountInWithFee;
            reserve1 -= amountOut;
            token1.safeTransfer(msg.sender, amountOut);
        } else {
            token1.safeTransferFrom(msg.sender, address(this), amountIn);
            accumulatedFee1 += feeAmount;
            reserve1 += amountInWithFee;
            reserve0 -= amountOut;
            token0.safeTransfer(msg.sender, amountOut);
        }

        emit Swapped(msg.sender, tokenIn, amountIn, amountOut);
    }

    function claimFees() external {
        require(liquidity[msg.sender] > 0, "No liquidity position");

        uint256 userShare = (liquidity[msg.sender] * 10000) / totalLiquidity;
        uint256 fee0 = (accumulatedFee0 * userShare) / 10000 - claimedFees0[msg.sender];
        uint256 fee1 = (accumulatedFee1 * userShare) / 10000 - claimedFees1[msg.sender];

        claimedFees0[msg.sender] += fee0;
        claimedFees1[msg.sender] += fee1;

        if (fee0 > 0) token0.safeTransfer(msg.sender, fee0);
        if (fee1 > 0) token1.safeTransfer(msg.sender, fee1);

        emit FeesClaimed(msg.sender, fee0, fee1);
    }

    function getReserves() external view returns (uint256 _reserve0, uint256 _reserve1) {
        return (reserve0, reserve1);
    }

    function getSwapAmount(address tokenIn, uint256 amountIn) external view returns (uint256 amountOut) {
        (uint256 reserveIn, uint256 reserveOut) =
            tokenIn == address(token0) ? (reserve0, reserve1) : (reserve1, reserve0);
        if (reserveIn == 0 || reserveOut == 0) return 0;
        uint256 amountInWithFee = (amountIn * (FEE_DENOMINATOR - SWAP_FEE)) / FEE_DENOMINATOR;
        amountOut = (amountInWithFee * reserveOut) / (reserveIn + amountInWithFee);
    }

    function getUserLiquidity(address user) external view returns (uint256) {
        return liquidity[user];
    }

    function getAccumulatedFees() external view returns (uint256 _fee0, uint256 _fee1) {
        return (accumulatedFee0, accumulatedFee1);
    }

    function getClaimableFees(address user) external view returns (uint256 fee0, uint256 fee1) {
        if (totalLiquidity == 0) return (0, 0);
        uint256 userShare = (liquidity[user] * 10000) / totalLiquidity;
        fee0 = (accumulatedFee0 * userShare) / 10000 - claimedFees0[user];
        fee1 = (accumulatedFee1 * userShare) / 10000 - claimedFees1[user];
    }
}

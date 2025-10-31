<div align="center">
  <h1>🌿 wapSewap</h1>
  <p><strong>Simple DeFi Platform for Token Swaps, NFT Minting, and Trading on Lisk Sepolia</strong></p>
  <p>Built for <a href="https://www.speedrunlisk.xyz/">Lisk Speedrun 2025</a></p>
</div>

<br />

wapSewap is a comprehensive DeFi platform built on Lisk Sepolia testnet, offering:

- 🔄 **Mini DEX**: Instant token swaps with 0.3% fee
- 🎨 **NFT Gallery**: Mint, buy, and sell unique NFTs with IPFS storage
- 🚰 **Faucet**: Get free testnet tokens to explore the platform

⚙️ Built using NextJS, RainbowKit, Hardhat, Wagmi, Viem, and Typescript.

- ✅ **Simple User Interface**: Clean and intuitive design for seamless DeFi experience
- 🪝 **[Custom hooks](https://docs.scaffoldeth.io/hooks/)**: Collection of React hooks wrapper around [wagmi](https://wagmi.sh/) to simplify interactions with smart contracts with typescript autocompletion.
- 🧱 [**Components**](https://docs.scaffoldeth.io/components/): Collection of common web3 components to quickly build your frontend.
- 🔥 **Token Faucet**: Get free WSP and sUSDC tokens for testing
- 🔐 **Multi-Wallet Support**: Connect with MetaMask, WalletConnect, and more

<div align="center" style="margin-top: 24px;">
  <img alt="wapSewap Demo" src="./packages/nextjs/public/logo.png" width="200">
</div>

## Requirements

Before you begin, you need to install the following tools:

- [Node (>= v18.17)](https://nodejs.org/en/download/)
- Yarn ([v1](https://classic.yarnpkg.com/en/docs/install/) or [v2+](https://yarnpkg.com/getting-started/install))
- [Git](https://git-scm.com/downloads)

## Quickstart

To get started with wapSewap, follow the steps below:

1. Clone this repo & install dependencies

```
git clone https://github.com/emhaihsan/wapSwap.git
cd wapSwap
yarn install
```

2. Run a local network in the first terminal:

```
yarn chain
```

This command starts a local Ethereum network using Hardhat. The network runs on your local machine and can be used for testing and development. You can customize the network configuration in `hardhat.config.ts`.

3. On a second terminal, deploy the test contract:

```
yarn deploy
```

This command deploys a test smart contract to the local network. The contract is located in `packages/hardhat/contracts` and can be modified to suit your needs. The `yarn deploy` command uses the deploy script located in `packages/hardhat/deploy` to deploy the contract to the network. You can also customize the deploy script.

4. On the same terminal, start your NextJS app:

```
yarn start
```

Visit your app on: `http://localhost:3000`. You can interact with wapSewap features:

- **DEX**: Swap WSP and sUSDC tokens
- **NFT Gallery**: Mint, list, and trade NFTs
- **Faucet**: Get free testnet tokens

Run smart contract test with `yarn hardhat:test`

- Edit your smart contracts in `packages/hardhat/contracts`
- Edit your frontend in `packages/nextjs/app`
- Edit your deployment scripts in `packages/hardhat/deploy`

## Deploy Contracts to Lisk Sepolia

To deploy contracts to Lisk Sepolia testnet, follow the steps below:

1. Get Lisk Sepolia ETH from the [Lisk Faucet](https://faucet.lisk.com/)

2. Inside the `packages/hardhat` directory, copy `.env.example` to `.env`.

   ```bash
   cd packages/hardhat && cp .env.example .env
   ```

3. Edit your `.env` to specify the environment variables:

   ```bash
   DEPLOYER_PRIVATE_KEY = "your_private_key_with_lisk_sepolia_ETH";
   LISK_SEPOLIA_RPC_URL = "https://rpc-sepolia.lisk.com";
   ```

4. Deploy to Lisk Sepolia:

   ```bash
   yarn deploy --network liskSepolia
   ```

   This command deploys all smart contracts to Lisk Sepolia testnet. If the deployment is successful, you will see the deployment tx hash on the terminal.

## Environment Variables

For NFT functionality, you need to configure Pinata IPFS:

1. Create a free account at [Pinata](https://app.pinata.cloud/)
2. Get your JWT token from Pinata dashboard
3. Add to `.env.local`:

   ```bash
   NEXT_PUBLIC_PINATA_JWT = "your_pinata_jwt_token";
   NEXT_PUBLIC_ALCHEMY_API_KEY = "your_alchemy_api_key";
   NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID = "your_walletconnect_project_id";
   ```

## Features

### 🔄 Mini DEX

- Swap WSP and sUSDC tokens instantly
- 0.3% trading fee
- Add/remove liquidity
- Real-time pool statistics

### 🎨 NFT Gallery

- Mint NFTs with custom metadata
- List NFTs for sale in WSP tokens
- Buy/sell NFTs from other users
- IPFS integration for decentralized storage
- 1% marketplace fee

### 🚰 Faucet

- Get 100 WSP tokens every 24 hours
- Get 50 sUSDC tokens every 24 hours
- No registration required

## Deployment

### Netlify Deployment

1. Push your code to GitHub
2. Connect your repository to Netlify
3. Set environment variables in Netlify dashboard
4. Build settings:
   - **Build command**: `NEXT_PUBLIC_IGNORE_BUILD_ERROR=true yarn build && yarn next export -o out`
   - **Publish directory**: `packages/nextjs/out`

### Manual Deployment

```bash
cd packages/nextjs
NEXT_PUBLIC_IGNORE_BUILD_ERROR=true yarn build && yarn next export -o out
```

Upload the `out` folder to your hosting provider.

## Built With

- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS & DaisyUI** - Styling
- **RainbowKit** - Wallet connection
- **Wagmi & Viem** - Ethereum interaction
- **Hardhat** - Smart contract development
- **Pinata** - IPFS storage for NFTs

## Contributing

Built for **Lisk Speedrun 2025**. Feel free to fork and contribute!

## License

MIT License

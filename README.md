# 🔐 EthPass: A Blockchain-Based Password Manager

**EthPass** is a full-stack decentralized password manager application that leverages Solidity smart contracts on Ethereum and a Next.js front-end. Built as my capstone project, **EthPass** tackles the challenge of securely storing sensitive login credentials on a publicly visible blockchain using **public key cryptography**.

This project builds upon **Scaffold-ETH 2**, an open-source toolkit designed to streamline the development of decentralized applications (dapps) on Ethereum.

<h4 align="center">
  <a href="https://docs.scaffoldeth.io">Scaffold-ETH Documentation</a> |
  <a href="https://scaffoldeth.io">Scaffold-ETH Website</a>
</h4>

⚙️ **EthPass** uses **Scaffold-ETH 2** as its foundation, which provides powerful tools such as Next.js, RainbowKit, Hardhat, Wagmi, Viem, and Typescript to simplify the development process.

- **Encryption with Public Key Cryptography**: Credentials are encrypted using your public key, with only the private key being able to decrypt the data.
- **Decentralized Storage**: User credentials are stored securely on IPFS (InterPlanetary File System), and IPFS hashes are managed via Ethereum smart contracts.
- **Wallet Integration**: Your crypto wallet handles key management, making the process seamless when you register or log in.

🛠 **Key Scaffold-ETH 2 Features**:
- ✅ **Contract Hot Reload**: Frontend adapts automatically to smart contract changes.
- 🪝 **Custom hooks**: Simplify interactions with smart contracts.
- 🧱 **Web3 components**: Build frontend interfaces quickly.
- 🔥 **Burner Wallet & Local Faucet**: Test your application with ease.
- 🔐 **Wallet Provider Integration**: Seamless connection with Ethereum wallets.

![Debug Contracts tab](https://github.com/scaffold-eth/scaffold-eth-2/assets/55535804/b237af0c-5027-4849-a5c1-2e31495cccb1)

## Requirements

Before running **EthPass**, ensure you have the following installed:

- [Node (>= v18.17)](https://nodejs.org/en/download/)
- Yarn ([v1](https://classic.yarnpkg.com/en/docs/install/) or [v2+](https://yarnpkg.com/getting-started/install))
- [Git](https://git-scm.com/downloads)

## Quickstart

To get started with **EthPass**, follow these steps:

1. Clone the repo & install dependencies:

```
git clone https://github.com/dcriggs/eth-password-manager.git
cd ethpass
yarn install
```

2. Run a local Ethereum network in the first terminal:

```
yarn chain
```

3. On a second terminal, deploy the smart contracts:

```
yarn deploy
```

4. On a third terminal, start the Next.js app:

```
yarn start
```

Visit your app at: `http://localhost:3000`. Interact with the smart contracts using the `Debug Contracts` page.

**Next Steps**:
- Customize your contract `YourContract.sol` in `packages/hardhat/contracts`
- Modify the homepage at `packages/nextjs/app/page.tsx`
- Adjust deployment scripts in `packages/hardhat/deploy`
- Write tests in `packages/hardhat/test`. Run them using `yarn hardhat:test`

## Documentation

For more info on Scaffold-ETH 2, check out the [docs](https://docs.scaffoldeth.io) and [website](https://scaffoldeth.io).

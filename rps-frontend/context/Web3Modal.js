"use client";

import { createWeb3Modal, defaultConfig } from "@web3modal/ethers5/react";
// import { HardhatError } from "hardhat/internal/core/errors";
// process.env.WEB3MODAL_ID;
// 1. Get projectId
const projectId = process.env.NEXT_PUBLIC_WEB3MODAL_ID;

// 2. Set chains
const mainnet = {
  chainId: 1,
  name: "Ethereum",
  currency: "ETH",
  explorerUrl: "https://etherscan.io",
  rpcUrl: "https://cloudflare-eth.com",
};

const hardhat = {
  chainId: 31337,
  name: "Hardhat",
  currency: "ETH",
  rpcUrl: "http://127.0.0.1:8545/",
};

const goerli = {
  chainId: 5,
  name: "Hardhat",
  currency: "ETH",
  explorerUrl: "https://goerli.etherscan.io",
  rpcUrl: "https://eth-goerli.g.alchemy.com/v2/demo",
};

const sepolia = {
  chainId: 11155111,
  name: "Sepolia",
  currency: "ETH",
  explorerUrl: "https://sepolia.etherscan.io",
  rpcUrl: "https://eth-sepolia.g.alchemy.com/v2/demo",
};
// 3. Create modal
const metadata = {
  name: "RPS",
  description: "My Website description",
  url: "localhost", // origin must match your domain & subdomain
  icons: ["https://avatars.mywebsite.com/"],
};

createWeb3Modal({
  ethersConfig: defaultConfig({ metadata }),
  chains: [mainnet, hardhat, goerli, sepolia],
  defaultChain: hardhat,
  projectId,
  enableAnalytics: true, // Optional - defaults to your Cloud configuration
});

export function Web3ModalProvider({ children }) {
  return children;
}

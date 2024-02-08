"use client";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar/navbar";
import {
  useWeb3ModalProvider,
  useWeb3ModalAccount,
} from "@web3modal/ethers5/react";
import { ethers } from "ethers";
import RPS from "../../artifacts/contracts/RPS.sol/RPS.json";
const { rpsAddress, j2Address } = require("../../config");
import { ContractFactory } from "ethers";
import { useState } from "react";

export default function Page() {
  const { address, chainId, isConnected } = useWeb3ModalAccount();
  const { walletProvider } = useWeb3ModalProvider();

  const router = useRouter();

  const [addr, setAddr] = useState(null);
  const [isLoading, setisLoading] = useState(null);

  async function deploy() {
    const lockedAmount = ethers.utils.parseEther("1");

    const hash = ethers.utils.solidityKeccak256(["uint8", "uint256"], [2, 10]);
    if (!isConnected) throw Error("User disconnected");
    setisLoading(true);
    try {
      const ethersProvider = new ethers.providers.Web3Provider(walletProvider);
      const signer = await ethersProvider.getSigner();

      const factory = new ContractFactory(RPS.abi, RPS.bytecode, signer);

      const contract = await factory.deploy(hash, address, {
        value: lockedAmount,
      });

      await contract.deployTransaction.wait(1);

      console.log("Contract deployed to : ", contract.address);
      const bal = await ethersProvider.getBalance(contract.address);
      console.log("Contract balance : ", ethers.utils.formatEther(bal));

      setisLoading(false);
      router.push("/page2");
    } catch (error) {
      console.log("Theres error : ", error);
      alert("OOPS! That Didn't go through. Please try again");
    }
  }

  async function bal() {
    try {
      const ethersProvider = new ethers.providers.Web3Provider(walletProvider);
      const bal = await ethersProvider.getBalance(addr);

      console.log("Contract balance : ", ethers.utils.formatEther(bal));
    } catch (error) {
      console.log("another error : ", error);
    }
  }

  if (!isConnected) {
    return (
      <div>
        <Navbar />
        <main className="flex min-h-screen flex-col items-center justify-between p-24">
          <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex"></div>
          <w3m-button /> <w3m-network-switch />
          {/* // */}
          <div className="relative flex place-items-center before:absolute before:h-[300px] before:w-full sm:before:w-[480px] before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-full sm:after:w-[240px] after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700 before:dark:opacity-10 after:dark:from-sky-900 after:dark:via-[#0141ff] after:dark:opacity-40 before:lg:h-[360px] z-[-1]"></div>
          <div className="mb-32 grid text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-4 lg:text-left"></div>
        </main>
      </div>
    );
  }
  return (
    <div>
      <>
        <Navbar />
        <main className="flex min-h-screen flex-col items-center justify-between p-24">
          <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex"></div>
          <button onClick={deploy}>Deploy</button>
          <button onClick={bal}>Get Balance</button>
          {/* <w3m-button /> */}
          <button
            onClick={deploy}
            className="text-white bg-gradient-to-r from-red-800 via-yellow-600 to-yellow-500 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-purple-300 dark:focus:ring-purple-800 font-medium rounded-lg text-xl px-8 py-3.5 text-center mr-2 mb-2"
          >
            Deploy
            {isLoading && (
              <div
                className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
                role="status"
              >
                <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
                  Loading...
                </span>
              </div>
            )}
          </button>
          {/* // */}
          <div className="relative flex place-items-center before:absolute before:h-[300px] before:w-full sm:before:w-[480px] before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-full sm:after:w-[240px] after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700 before:dark:opacity-10 after:dark:from-sky-900 after:dark:via-[#0141ff] after:dark:opacity-40 before:lg:h-[360px] z-[-1]"></div>
          <div className="mb-32 grid text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-4 lg:text-left"></div>
        </main>
      </>
    </div>
  );
}

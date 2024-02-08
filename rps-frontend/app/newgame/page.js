"use client";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar/navbar";
import {
  useWeb3ModalProvider,
  useWeb3ModalAccount,
} from "@web3modal/ethers5/react";
import { setCookie } from "cookies-next";
import { ethers } from "ethers";
import RPS from "../../utils/RPS.json";
import bcrypt from "bcryptjs";
import { ContractFactory } from "ethers";
import { useState } from "react";
import axios from "axios";
import { BASE_URL } from "@/utils/constant";

export default function Page() {
  const { address, chainId, isConnected } = useWeb3ModalAccount();
  const { walletProvider } = useWeb3ModalProvider();

  const router = useRouter();

  const [isLoading, setisLoading] = useState(null);
  const [playerAddress, setPlayerAddress] = useState(null);
  const [amount, setAmount] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);

  const bcryptSalt = bcrypt.genSaltSync(10);
  let txSalt;
  let move;

  // Calculate uint256 salt
  function salt() {
    const asciiValues = [];

    // Convert each character to its ASCII value and store it in the array
    for (let i = 0; i < bcryptSalt.length; i++) {
      asciiValues.push(bcryptSalt.charCodeAt(i));
    }

    // Initialize an array to store 32-bit segments of the hash
    const segments = [];

    // Combine every 4 ASCII values to form a 32-bit segment
    for (let i = 0; i < asciiValues.length; i += 4) {
      segments.push(
        (asciiValues[i] << 24) |
          (asciiValues[i + 1] << 16) |
          (asciiValues[i + 2] << 8) |
          asciiValues[i + 3]
      );
    }

    // Convert each segment to an unsigned integer and store it in an array
    const uintSegments = segments.map((segment) => segment >>> 0); // ensure unsigned

    // Combine the unsigned integers into a single 32-bit unsigned integer
    let uint32 = 0;
    for (let i = 0; i < uintSegments.length; i++) {
      uint32 |= uintSegments[i];
    }

    // Ensure the final output is within the range of uint32
    uint32 &= 0xffffffff;

    txSalt = uint32;
  }

  function onValueChange(value) {
    setSelectedOption(value);
  }

  function setval() {
    if (selectedOption == "rock") {
      move = 1;
    }
    if (selectedOption == "paper") {
      move = 2;
    }
    if (selectedOption == "scissors") {
      move = 3;
    }
    if (selectedOption == "spock") {
      move = 4;
    }
    if (selectedOption == "lizard") {
      move = 5;
    }

    console.log("Selection : ", move);
  }

  async function deploy() {
    setval();
    salt();
    const lockedAmount = ethers.utils.parseEther(amount);

    console.log("Tx move : ", move);
    console.log("Tx salt : ", txSalt);
    console.log("move type : ", typeof move);
    console.log("salt type : ", typeof salt);

    const hash = ethers.utils.solidityKeccak256(
      ["uint8", "uint256"],
      [move, txSalt]
    );
    if (!isConnected) throw Error("User disconnected");
    setisLoading(true);
    try {
      const ethersProvider = new ethers.providers.Web3Provider(walletProvider);
      const signer = await ethersProvider.getSigner();

      const factory = new ContractFactory(RPS.abi, RPS.bytecode, signer);

      const contract = await factory.deploy(hash, playerAddress.trim(), {
        value: lockedAmount,
      });

      await contract.deployTransaction.wait(1);

      console.log("Contract deployed to : ", contract.address);
      const bal = await ethersProvider.getBalance(contract.address);
      console.log("Contract balance : ", ethers.utils.formatEther(bal));

      axios
        .post(`${BASE_URL}/new-game`, {
          gameAddress: contract.address,
          startedBy: address,
          player2: playerAddress.trim(),
          amount: amount,
        })
        .then((res) => console.log(res.data))
        .catch((err) => console.log(err));

      const cookieData = { move: move, salt: BigInt(txSalt).toString() + "n" };
      setCookie(contract.address, cookieData, { maxAge: 60 * 60 });
      console.log("TxSalt: ", BigInt(txSalt).toString() + "n");

      setisLoading(false);
      router.push("/mygames");
    } catch (error) {
      console.log("Theres error : ", error);
      alert("OOPS! That Didn't go through. Please try again");
    }
  }

  if (!isConnected) {
    return (
      <div>
        <Navbar />
        <div className="flex min-h-screen flex-col items-center justify-between p-24">
          <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex"></div>
          Please Connect your wallet
          <w3m-button /> <w3m-network-switch />
          {/* // */}
          <div className="relative flex place-items-center before:absolute before:h-[300px] before:w-full sm:before:w-[480px] before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-full sm:after:w-[240px] after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700 before:dark:opacity-10 after:dark:from-sky-900 after:dark:via-[#0141ff] after:dark:opacity-40 before:lg:h-[360px] z-[-1]"></div>
          <div className="mb-32 grid text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-4 lg:text-left"></div>
        </div>
      </div>
    );
  }
  return (
    <div>
      <>
        <Navbar />
        <div className="flex min-h-screen flex-col items-center justify-between p-24">
          <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex"></div>
          <div className="px-4 bg-white rounded-b-lg dark:bg-gray-800">
            <textarea
              id="editor"
              className="block w-full px-0 text-3xl text-gray-800 bg-white border-0 dark:bg-gray-800 focus:ring-0 dark:text-white dark:placeholder-gray-400"
              placeholder="Player 2 Address"
              onChange={(e) => setPlayerAddress(e.target.value)}
              required
            ></textarea>
          </div>
          <div className="px-4 bg-white rounded-b-lg dark:bg-gray-800">
            <textarea
              id="editor"
              className="block w-full px-0 text-3xl text-gray-800 bg-white border-0 dark:bg-gray-800 focus:ring-0 dark:text-white dark:placeholder-gray-400"
              placeholder="Stake in ETH"
              onChange={(e) => setAmount(e.target.value)}
              required
            ></textarea>
          </div>
          {/* <w3m-button /> */}
          <h1>Choose your move</h1>
          <div className="flex justify-center">
            <div className="mb-[0.125rem] mr-4 inline-block min-h-[1.5rem] pl-[1.5rem]">
              <input
                className="relative float-left -ml-[1.5rem] mr-1 mt-0.5 h-5 w-5 appearance-none rounded-full border-2 border-solid border-neutral-300 before:pointer-events-none before:absolute before:h-4 before:w-4 before:scale-0 before:rounded-full before:bg-transparent before:opacity-0 before:shadow-[0px_0px_0px_13px_transparent] before:content-[''] after:absolute after:z-[1] after:block after:h-4 after:w-4 after:rounded-full after:content-[''] checked:border-primary checked:before:opacity-[0.25] checked:after:absolute checked:after:left-1/2 checked:after:top-1/2 checked:after:h-[0.625rem] checked:after:w-[0.625rem] checked:after:rounded-full checked:after:border-primary checked:after:bg-sky-500 checked:after:content-[''] checked:after:[transform:translate(-50%,-50%)] hover:cursor-pointer hover:before:opacity-[0.04] hover:before:shadow-[0px_0px_0px_13px_rgba(0,0,0,0.6)] focus:shadow-none focus:outline-none focus:ring-0 focus:before:scale-100 focus:before:opacity-[0.12] focus:before:shadow-[0px_0px_0px_13px_rgba(0,0,0,0.6)] focus:before:transition-[box-shadow_0.2s,transform_0.2s] checked:focus:border-primary checked:focus:before:scale-100 checked:focus:before:shadow-[0px_0px_0px_13px_#3b71ca] checked:focus:before:transition-[box-shadow_0.2s,transform_0.2s] dark:border-neutral-600 dark:checked:border-primary dark:checked:after:border-primary dark:checked:after:bg-primary dark:focus:before:shadow-[0px_0px_0px_13px_rgba(255,255,255,0.4)] dark:checked:focus:border-primary dark:checked:focus:before:shadow-[0px_0px_0px_13px_#3b71ca]"
                type="radio"
                name="inlineRadioOptions"
                id="rock1"
                value="rock"
                checked={selectedOption === "rock"}
                onChange={() => onValueChange("rock")}
              />
              <label
                className="mt-px inline-block pl-[0.15rem] hover:cursor-pointer"
                htmlFor="inlineRadio1"
              >
                Rock
              </label>
            </div>

            <div className="mb-[0.125rem] mr-4 inline-block min-h-[1.5rem] pl-[1.5rem]">
              <input
                className="relative float-left -ml-[1.5rem] mr-1 mt-0.5 h-5 w-5 appearance-none rounded-full border-2 border-solid border-neutral-300 before:pointer-events-none before:absolute before:h-4 before:w-4 before:scale-0 before:rounded-full before:bg-transparent before:opacity-0 before:shadow-[0px_0px_0px_13px_transparent] before:content-[''] after:absolute after:z-[1] after:block after:h-4 after:w-4 after:rounded-full after:content-[''] checked:border-primary checked:before:opacity-[0.16] checked:after:absolute checked:after:left-1/2 checked:after:top-1/2 checked:after:h-[0.625rem] checked:after:w-[0.625rem] checked:after:rounded-full checked:after:border-primary checked:after:bg-sky-500 checked:after:content-[''] checked:after:[transform:translate(-50%,-50%)] hover:cursor-pointer hover:before:opacity-[0.04] hover:before:shadow-[0px_0px_0px_13px_rgba(0,0,0,0.6)] focus:shadow-none focus:outline-none focus:ring-0 focus:before:scale-100 focus:before:opacity-[0.12] focus:before:shadow-[0px_0px_0px_13px_rgba(0,0,0,0.6)] focus:before:transition-[box-shadow_0.2s,transform_0.2s] checked:focus:border-primary checked:focus:before:scale-100 checked:focus:before:shadow-[0px_0px_0px_13px_#3b71ca] checked:focus:before:transition-[box-shadow_0.2s,transform_0.2s] dark:border-neutral-600 dark:checked:border-primary dark:checked:after:border-primary dark:checked:after:bg-primary dark:focus:before:shadow-[0px_0px_0px_13px_rgba(255,255,255,0.4)] dark:checked:focus:border-primary dark:checked:focus:before:shadow-[0px_0px_0px_13px_#3b71ca]"
                type="radio"
                name="inlineRadioOptions"
                id="paper2"
                value="paper"
                checked={selectedOption === "paper"}
                onChange={() => onValueChange("paper")}
              />
              <label
                className="mt-px inline-block pl-[0.15rem] hover:cursor-pointer"
                htmlFor="inlineRadio2"
              >
                Paper
              </label>
            </div>
            <div className="mb-[0.125rem] mr-4 inline-block min-h-[1.5rem] pl-[1.5rem]">
              <input
                className="relative float-left -ml-[1.5rem] mr-1 mt-0.5 h-5 w-5 appearance-none rounded-full border-2 border-solid border-neutral-300 before:pointer-events-none before:absolute before:h-4 before:w-4 before:scale-0 before:rounded-full before:bg-transparent before:opacity-0 before:shadow-[0px_0px_0px_13px_transparent] before:content-[''] after:absolute after:z-[1] after:block after:h-4 after:w-4 after:rounded-full after:content-[''] checked:border-primary checked:before:opacity-[0.16] checked:after:absolute checked:after:left-1/2 checked:after:top-1/2 checked:after:h-[0.625rem] checked:after:w-[0.625rem] checked:after:rounded-full checked:after:border-primary checked:after:bg-sky-500 checked:after:content-[''] checked:after:[transform:translate(-50%,-50%)] hover:cursor-pointer hover:before:opacity-[0.04] hover:before:shadow-[0px_0px_0px_13px_rgba(0,0,0,0.6)] focus:shadow-none focus:outline-none focus:ring-0 focus:before:scale-100 focus:before:opacity-[0.12] focus:before:shadow-[0px_0px_0px_13px_rgba(0,0,0,0.6)] focus:before:transition-[box-shadow_0.2s,transform_0.2s] checked:focus:border-primary checked:focus:before:scale-100 checked:focus:before:shadow-[0px_0px_0px_13px_#3b71ca] checked:focus:before:transition-[box-shadow_0.2s,transform_0.2s] dark:border-neutral-600 dark:checked:border-primary dark:checked:after:border-primary dark:checked:after:bg-primary dark:focus:before:shadow-[0px_0px_0px_13px_rgba(255,255,255,0.4)] dark:checked:focus:border-primary dark:checked:focus:before:shadow-[0px_0px_0px_13px_#3b71ca]"
                type="radio"
                name="inlineRadioOptions"
                id="scissors3"
                value="scissors"
                checked={selectedOption === "scissors"}
                onChange={() => onValueChange("scissors")}
              />
              <label
                className="mt-px inline-block pl-[0.15rem] hover:cursor-pointer"
                htmlFor="inlineRadio3"
              >
                Scissors
              </label>
            </div>
            <div className="mb-[0.125rem] mr-4 inline-block min-h-[1.5rem] pl-[1.5rem]">
              <input
                className="relative float-left -ml-[1.5rem] mr-1 mt-0.5 h-5 w-5 appearance-none rounded-full border-2 border-solid border-neutral-300 before:pointer-events-none before:absolute before:h-4 before:w-4 before:scale-0 before:rounded-full before:bg-transparent before:opacity-0 before:shadow-[0px_0px_0px_13px_transparent] before:content-[''] after:absolute after:z-[1] after:block after:h-4 after:w-4 after:rounded-full after:content-[''] checked:border-primary checked:before:opacity-[0.16] checked:after:absolute checked:after:left-1/2 checked:after:top-1/2 checked:after:h-[0.625rem] checked:after:w-[0.625rem] checked:after:rounded-full checked:after:border-primary checked:after:bg-sky-500 checked:after:content-[''] checked:after:[transform:translate(-50%,-50%)] hover:cursor-pointer hover:before:opacity-[0.04] hover:before:shadow-[0px_0px_0px_13px_rgba(0,0,0,0.6)] focus:shadow-none focus:outline-none focus:ring-0 focus:before:scale-100 focus:before:opacity-[0.12] focus:before:shadow-[0px_0px_0px_13px_rgba(0,0,0,0.6)] focus:before:transition-[box-shadow_0.2s,transform_0.2s] checked:focus:border-primary checked:focus:before:scale-100 checked:focus:before:shadow-[0px_0px_0px_13px_#3b71ca] checked:focus:before:transition-[box-shadow_0.2s,transform_0.2s] dark:border-neutral-600 dark:checked:border-primary dark:checked:after:border-primary dark:checked:after:bg-primary dark:focus:before:shadow-[0px_0px_0px_13px_rgba(255,255,255,0.4)] dark:checked:focus:border-primary dark:checked:focus:before:shadow-[0px_0px_0px_13px_#3b71ca]"
                type="radio"
                name="inlineRadioOptions"
                id="spock4"
                value="spock"
                checked={selectedOption === "spock"}
                onChange={() => onValueChange("spock")}
              />
              <label
                className="mt-px inline-block pl-[0.15rem] hover:cursor-pointer"
                htmlFor="inlineRadio4"
              >
                Spock
              </label>
            </div>
            <div className="mb-[0.125rem] mr-4 inline-block min-h-[1.5rem] pl-[1.5rem]">
              <input
                className="relative float-left -ml-[1.5rem] mr-1 mt-0.5 h-5 w-5 appearance-none rounded-full border-2 border-solid border-neutral-300 before:pointer-events-none before:absolute before:h-4 before:w-4 before:scale-0 before:rounded-full before:bg-transparent before:opacity-0 before:shadow-[0px_0px_0px_13px_transparent] before:content-[''] after:absolute after:z-[1] after:block after:h-4 after:w-4 after:rounded-full after:content-[''] checked:border-primary checked:before:opacity-[0.16] checked:after:absolute checked:after:left-1/2 checked:after:top-1/2 checked:after:h-[0.625rem] checked:after:w-[0.625rem] checked:after:rounded-full checked:after:border-primary checked:after:bg-sky-500 checked:after:content-[''] checked:after:[transform:translate(-50%,-50%)] hover:cursor-pointer hover:before:opacity-[0.04] hover:before:shadow-[0px_0px_0px_13px_rgba(0,0,0,0.6)] focus:shadow-none focus:outline-none focus:ring-0 focus:before:scale-100 focus:before:opacity-[0.12] focus:before:shadow-[0px_0px_0px_13px_rgba(0,0,0,0.6)] focus:before:transition-[box-shadow_0.2s,transform_0.2s] checked:focus:border-primary checked:focus:before:scale-100 checked:focus:before:shadow-[0px_0px_0px_13px_#3b71ca] checked:focus:before:transition-[box-shadow_0.2s,transform_0.2s] dark:border-neutral-600 dark:checked:border-primary dark:checked:after:border-primary dark:checked:after:bg-primary dark:focus:before:shadow-[0px_0px_0px_13px_rgba(255,255,255,0.4)] dark:checked:focus:border-primary dark:checked:focus:before:shadow-[0px_0px_0px_13px_#3b71ca]"
                type="radio"
                name="inlineRadioOptions"
                id="lizard5"
                value="lizard"
                checked={selectedOption === "lizard"}
                onChange={() => onValueChange("lizard")}
              />
              <label
                className="mt-px inline-block pl-[0.15rem] hover:cursor-pointer"
                htmlFor="inlineRadio5"
              >
                Lizard
              </label>
            </div>
          </div>
          {/* // */}
          <button
            onClick={() => {
              // showval();
              deploy();
            }}
            className="text-white bg-gradient-to-r from-red-800 via-yellow-600 to-yellow-500 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-purple-300 dark:focus:ring-purple-800 font-medium rounded-lg text-xl px-8 py-3.5 text-center"
          >
            Start Game
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
        </div>
      </>
    </div>
  );
}

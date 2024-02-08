"use client";
import { setCookie, getCookie } from "cookies-next";
// import bcrypt from "bcrypt";
import bcrypt from "bcryptjs";
import { BigNumber, ethers } from "ethers";
import RPS from "../../artifacts/contracts/RPS.sol/RPS.json";
import {
  useWeb3ModalProvider,
  useWeb3ModalAccount,
} from "@web3modal/ethers5/react";
import { ContractFactory } from "ethers";

export default function UserInfo() {
  const { address, chainId, isConnected } = useWeb3ModalAccount();
  const { walletProvider } = useWeb3ModalProvider();
  let lockedAmount, hash, contractAddress, txSalt;
  const bcryptSalt = bcrypt.genSaltSync(10);

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

    return uint32;
  }
  const setData = async () => {
    txSalt = salt();
    console.log(
      "Big Number : ",
      ethers.BigNumber.from(BigInt(txSalt).toString())
    );
    hash = ethers.utils.solidityKeccak256(["uint8", "uint256"], [4, txSalt]);
    lockedAmount = ethers.utils.parseEther("20");
    const value = { move: 4, salt: BigInt(txSalt).toString() };
    setCookie(contractAddress, value, { maxAge: 100 });
    console.log("TxSalt: ", Number(BigInt(txSalt)));
    console.log("type : ", typeof txSalt);
  };
  const getData = async () => {
    const dat = getCookie(`${encodeURIComponent(contractAddress)}`);
    const newdat = JSON.parse(dat);
    // const big = BigInt(newdat.salt);
    console.log("New cookie :", BigInt(parseInt(newdat.salt)));
    console.log("In bigint : ", typeof parseInt(newdat.salt));
  };

  async function deploy() {
    if (!isConnected) throw Error("User disconnected");
    // setisLoading(true);
    try {
      const ethersProvider = new ethers.providers.Web3Provider(walletProvider);
      const signer = await ethersProvider.getSigner();

      const factory = new ContractFactory(RPS.abi, RPS.bytecode, signer);

      const contract = await factory.deploy(
        hash,
        "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199".trim(),
        {
          value: lockedAmount,
        }
      );

      await contract.deployTransaction.wait(1);

      console.log("Contract deployed to : ", contract.address);
      const bal = await ethersProvider.getBalance(contract.address);
      console.log("Contract balance : ", ethers.utils.formatEther(bal));

      const value = { move: 4, salt: txSalt.toFixed(0) };
      setCookie(contractAddress, value, { maxAge: 100 });
      console.log("Cookie Set!!");
      //   router.push("/mygames");
    } catch (error) {
      console.log("Theres error : ", error);
      alert("OOPS! That Didn't go through. Please try again");
    }
  }

  return (
    <>
      <button onClick={setData}>Set Cookie</button> <br /> <br /> <br />
      <button onClick={getData}>Get Cookie</button>
      <br /> <br /> <br />
      <button onClick={deploy}>Deploy</button>
    </>
  );
}

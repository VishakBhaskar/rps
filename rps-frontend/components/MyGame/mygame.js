"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Popup } from "reactjs-popup";
import moment from "moment";
import {
  useWeb3ModalProvider,
  useWeb3ModalAccount,
} from "@web3modal/ethers5/react";
import RPS from "../../utils/RPS.json";
import { ethers } from "ethers";
import axios from "axios";
import { BASE_URL } from "@/utils/constant";
import { getCookie } from "cookies-next";

const MyGame = (props) => {
  const [canRedeem, setCanRedeem] = useState("no");
  const [played, setPlayed] = useState(null);
  const [isLoading, setisLoading] = useState(null);
  const { address, chainId, isConnected } = useWeb3ModalAccount();
  const { walletProvider } = useWeb3ModalProvider();
  const [game, setGame] = useState(null);

  const [loading, setLoading] = useState("");
  // var move;

  useMemo(() => {
    const fetchData = async () => {
      axios
        .get(`${BASE_URL}/get-game/${props.game.gameAddress}`)
        .then((res) => {
          setGame(res.data);
          if (res.data.active == true) {
            setPlayed(true);
          }
        })
        .catch((err) => {
          setLoading("error");
          console.log(err);
        });

      axios
        .get(`${BASE_URL}/p2-timeout/${props.game.gameAddress}`)
        .then((res) => {
          if (res.data) setCanRedeem("yes");
          console.log("Can redeem : ", res.data);
          setLoading("success");
        })
        .catch((err) => {
          setLoading("error");
          console.log(err);
        });
    };
    fetchData();
    console.log("rendered!!");
    console.log("Player 1 played : ", played);
  }, [played]);

  async function solve() {
    // const stake = ethers.utils.parseEther(String(props.game.amount));
    let move, salt;
    // const hash = ethers.utils.solidityKeccak256(["uint8", "uint256"], [2, 10]);
    if (!isConnected) throw Error("User disconnected");
    setisLoading(true);

    // setval();
    try {
      const dat = getCookie(`${encodeURIComponent(props.game.gameAddress)}`);
      const newdat = JSON.parse(dat);
      move = parseInt(newdat.move);
      salt = parseInt(newdat.salt);

      // console.log("Salt type :", typeof salt);
      // console.log("Move :", move);
      // console.log("Type num :", typeof 10);

      const ethersProvider = new ethers.providers.Web3Provider(walletProvider);
      const signer = await ethersProvider.getSigner();

      let playerBal = await ethersProvider.getBalance(address);
      console.log("Player 1 Balance : ", ethers.utils.formatEther(playerBal));

      const contract = new ethers.Contract(
        props.game.gameAddress,
        RPS.abi,
        signer
      );

      // const playerMove = await contract.solve(move, salt);
      const playerMove = await contract.solve(move, salt);

      await playerMove.wait(1);

      console.log("Played! Tx Hash :", playerMove);
      const bal = await ethersProvider.getBalance(contract.address);
      playerBal = await ethersProvider.getBalance(address);
      console.log("Contract balance : ", ethers.utils.formatEther(bal));
      console.log("New Player Balance : ", ethers.utils.formatEther(playerBal));

      axios
        .post(`${BASE_URL}/solve/${contract.address}`, {
          gameAddress: contract.address,
        })
        .then((res) => {
          setPlayed(true);
          console.log(res.data);
        })
        .catch((err) => console.log(err));

      setisLoading(false);
    } catch (error) {
      console.log("Theres error : ", error);
      alert("OOPS! That Didn't go through. Please try again");
    }
  }

  async function redeem() {
    if (!isConnected) throw Error("User disconnected");
    setisLoading(true);
    // setval();
    try {
      const ethersProvider = new ethers.providers.Web3Provider(walletProvider);
      const signer = await ethersProvider.getSigner();

      let playerBal = await ethersProvider.getBalance(address);
      console.log("Player Balance : ", ethers.utils.formatEther(playerBal));

      const contract = new ethers.Contract(
        props.game.gameAddress,
        RPS.abi,
        signer
      );

      const playerMove = await contract.j2Timeout();

      await playerMove.wait(1);

      console.log("Played! Tx Hash :", playerMove);
      const bal = await ethersProvider.getBalance(contract.address);
      playerBal = await ethersProvider.getBalance(address);
      console.log("Player Balance : ", ethers.utils.formatEther(playerBal));
      console.log("Contract balance : ", ethers.utils.formatEther(bal));

      axios
        .post(`${BASE_URL}/redeem/${contract.address}`, {
          gameAddress: contract.address,
        })
        .then((res) => {
          setCanRedeem("no");
          console.log(res.data);
        })
        .catch((err) => console.log(err));

      setisLoading(false);
      setPlayed(true);
      //   router.push("/mygames");
    } catch (error) {
      console.log("Theres error : ", error);
      alert("OOPS! That Didn't go through. Please try again");
    }
  }

  return (
    <div className="my-5 block w-full rounded-lg bg-white p-6 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] dark:bg-neutral-700">
      <h5 className="mb-2 text-2xl font-medium leading-tight text-neutral-800 dark:text-neutral-50">
        Game: {props.game.gameAddress}
      </h5>
      <p className="mb-2 text-xl font-medium leading-tight text-neutral-800 dark:text-neutral-50">
        Created by: {props.game.startedBy}
      </p>
      <p className="mb-2 text-xl font-medium leading-tight text-neutral-800 dark:text-neutral-50">
        Invited: {props.game.player2}
      </p>
      <p className="mb-2 text-xl font-medium leading-tight text-neutral-800 dark:text-neutral-50">
        Last Action: {moment(props.game.lastAction).fromNow()}
      </p>
      <p className="mb-2 text-xl font-medium leading-tight text-neutral-800 dark:text-neutral-50">
        Stake: {props.game.amount} ETH
      </p>

      {played || !props.game.active || canRedeem == "yes" ? (
        <p className="mb-2 text-xl font-medium leading-tight text-neutral-800 dark:text-neutral-50">
          Game expired
        </p>
      ) : props.game.player2Played && props.game.active && canRedeem == "no" ? (
        <p className="mb-2 text-xl font-medium leading-tight text-sky-500 dark:text-sky-500">
          Your Turn!
        </p>
      ) : (
        <p className="mb-2 text-xl font-medium leading-tight text-sky-500 dark:text-sky-500">
          Player 2 yet to play
        </p>
      )}

      <div className="flex justify-center"></div>
      <div className="flex justify-center mt-5">
        {canRedeem === "yes" ? (
          <button
            type="button"
            className="text-white bg-gradient-to-r from-red-800 via-yellow-600 to-yellow-500 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-purple-300 dark:focus:ring-purple-800 font-medium rounded-lg text-xl px-8 py-3.5 text-center"
            data-te-ripple-init
            data-te-ripple-color="light"
            onClick={() => {
              redeem();
            }}
          >
            Redeem
          </button>
        ) : (
          <div>
            <button
              type="button"
              className="inline-block rounded bg-sky-500 disabled:opacity-25  px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:bg-primary-700 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] dark:shadow-[0_4px_9px_-4px_rgba(59,113,202,0.5)] dark:hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)]"
              data-te-ripple-init
              data-te-ripple-color="light"
              disabled={
                played || !props.game.active || !props.game.player2Played
              }
              onClick={() => solve()}
            >
              Solve
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyGame;

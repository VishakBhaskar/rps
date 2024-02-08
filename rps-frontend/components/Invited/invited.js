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

const Invited = (props) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [canRedeem, setCanRedeem] = useState("no");
  const [played, setPlayed] = useState(null);
  const [isLoading, setisLoading] = useState(null);
  const { address, chainId, isConnected } = useWeb3ModalAccount();
  const { walletProvider } = useWeb3ModalProvider();
  const [active, setActive] = useState(props.game.active);

  const [loading, setLoading] = useState("");
  var move;

  useMemo(() => {
    const fetchData = async () => {
      axios
        .get(`${BASE_URL}/p1-timeout/${props.game.gameAddress}`)
        .then((res) => {
          if (res.data == true) setCanRedeem("yes");
          console.log("Can redeem : ", res.data);
          setLoading("success");
        })
        .catch((err) => {
          setLoading("error");
          console.log(err);
        });

      axios
        .get(`${BASE_URL}/get-game/${props.game.gameAddress}`)
        .then((res) => {
          // if (res.data.active) {
          setActive(res.data.active);
          setPlayed(res.data.player2Played);
          // }
        })
        .catch((err) => {
          setLoading("error");
          console.log(err);
        });
    };
    fetchData();

    console.log("rendered!!");
    console.log("Player 2 played : ", played);
  }, [active]);

  function onValueChange(value) {
    setSelectedOption(value);
  }
  function showval() {
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
    console.log(typeof String(props.game.amount));
    console.log("Selection : ", move);
  }

  async function play() {
    const stake = ethers.utils.parseEther(String(props.game.amount));

    // const hash = ethers.utils.solidityKeccak256(["uint8", "uint256"], [2, 10]);
    if (!isConnected) throw Error("User disconnected");
    setisLoading(true);
    showval();
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

      const playerMove = await contract.play(move, {
        value: stake,
      });

      await playerMove.wait(1);

      console.log("Played! Tx Hash :", playerMove);
      const bal = await ethersProvider.getBalance(contract.address);
      playerBal = await ethersProvider.getBalance(address);
      console.log("Contract balance : ", ethers.utils.formatEther(bal));
      console.log("New Player Balance : ", ethers.utils.formatEther(playerBal));

      axios
        .post(`${BASE_URL}/play/${contract.address}`, {
          gameAddress: contract.address,
        })
        .then((res) => {
          setPlayed(true);
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

  async function redeem() {
    if (!isConnected) throw Error("User disconnected");
    setisLoading(true);
    showval();
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

      const playerMove = await contract.j1Timeout();

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
      //   setPlayed(true);
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

      {played == true || props.game.player2Played ? (
        <p className="mb-2 text-xl font-medium leading-tight text-neutral-800 dark:text-neutral-50">
          You Played
        </p>
      ) : props.game.player2Played == false && props.game.active == true ? (
        <p className="mb-2 text-xl font-medium leading-tight  text-sky-500 dark:text-sky-500">
          Your Turn!
        </p>
      ) : canRedeem === "yes" || props.game.active == false ? (
        <p className="mb-2 text-xl font-medium leading-tight text-sky-500 dark:text-sky-500">
          Game expired
        </p>
      ) : (
        <p className="mb-2 text-xl font-medium leading-tight text-sky-500 dark:text-sky-500">
          Game expired
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
          <Popup
            trigger={
              <button
                type="button"
                className="inline-block rounded bg-sky-500 disabled:opacity-25  px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:bg-primary-700 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] dark:shadow-[0_4px_9px_-4px_rgba(59,113,202,0.5)] dark:hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)]"
                data-te-ripple-init
                data-te-ripple-color="light"
                disabled={
                  props.game.player2Played == true ||
                  played == true ||
                  props.game.active == false
                }
                onClick={() => showval()}
              >
                Play
              </button>
            }
            modal
            nested
          >
            <div className="my-5 block w-full rounded-lg bg-white p-6 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] dark:bg-violet-600">
              <h5 className="mb-2 text-2xl font-medium leading-tight text-neutral-800 dark:text-neutral-50">
                Choose your move!
              </h5>
              <div className="flex justify-center">
                <div className="mb-[0.125rem] mr-4 inline-block min-h-[1.5rem] pl-[1.5rem]">
                  <input
                    className="relative float-left -ml-[1.5rem] mr-1 mt-0.5 h-5 w-5 appearance-none rounded-full border-2 border-solid border-neutral-300 before:pointer-events-none before:absolute before:h-4 before:w-4 before:scale-0 before:rounded-full before:bg-transparent before:opacity-0 before:shadow-[0px_0px_0px_13px_transparent] before:content-[''] after:absolute after:z-[1] after:block after:h-4 after:w-4 after:rounded-full after:content-[''] checked:border-primary checked:before:opacity-[0.25] checked:after:absolute checked:after:left-1/2 checked:after:top-1/2 checked:after:h-[0.625rem] checked:after:w-[0.625rem] checked:after:rounded-full checked:after:border-primary checked:after:bg-black checked:after:content-[''] checked:after:[transform:translate(-50%,-50%)] hover:cursor-pointer hover:before:opacity-[0.04] hover:before:shadow-[0px_0px_0px_13px_rgba(0,0,0,0.6)] focus:shadow-none focus:outline-none focus:ring-0 focus:before:scale-100 focus:before:opacity-[0.12] focus:before:shadow-[0px_0px_0px_13px_rgba(0,0,0,0.6)] focus:before:transition-[box-shadow_0.2s,transform_0.2s] checked:focus:border-primary checked:focus:before:scale-100 checked:focus:before:shadow-[0px_0px_0px_13px_#3b71ca] checked:focus:before:transition-[box-shadow_0.2s,transform_0.2s] dark:border-neutral-600 dark:checked:border-primary dark:checked:after:border-primary dark:checked:after:bg-primary dark:focus:before:shadow-[0px_0px_0px_13px_rgba(255,255,255,0.4)] dark:checked:focus:border-primary dark:checked:focus:before:shadow-[0px_0px_0px_13px_#3b71ca]"
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
                    className="relative float-left -ml-[1.5rem] mr-1 mt-0.5 h-5 w-5 appearance-none rounded-full border-2 border-solid border-neutral-300 before:pointer-events-none before:absolute before:h-4 before:w-4 before:scale-0 before:rounded-full before:bg-transparent before:opacity-0 before:shadow-[0px_0px_0px_13px_transparent] before:content-[''] after:absolute after:z-[1] after:block after:h-4 after:w-4 after:rounded-full after:content-[''] checked:border-primary checked:before:opacity-[0.16] checked:after:absolute checked:after:left-1/2 checked:after:top-1/2 checked:after:h-[0.625rem] checked:after:w-[0.625rem] checked:after:rounded-full checked:after:border-primary checked:after:bg-black checked:after:content-[''] checked:after:[transform:translate(-50%,-50%)] hover:cursor-pointer hover:before:opacity-[0.04] hover:before:shadow-[0px_0px_0px_13px_rgba(0,0,0,0.6)] focus:shadow-none focus:outline-none focus:ring-0 focus:before:scale-100 focus:before:opacity-[0.12] focus:before:shadow-[0px_0px_0px_13px_rgba(0,0,0,0.6)] focus:before:transition-[box-shadow_0.2s,transform_0.2s] checked:focus:border-primary checked:focus:before:scale-100 checked:focus:before:shadow-[0px_0px_0px_13px_#3b71ca] checked:focus:before:transition-[box-shadow_0.2s,transform_0.2s] dark:border-neutral-600 dark:checked:border-primary dark:checked:after:border-primary dark:checked:after:bg-primary dark:focus:before:shadow-[0px_0px_0px_13px_rgba(255,255,255,0.4)] dark:checked:focus:border-primary dark:checked:focus:before:shadow-[0px_0px_0px_13px_#3b71ca]"
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
                    className="relative float-left -ml-[1.5rem] mr-1 mt-0.5 h-5 w-5 appearance-none rounded-full border-2 border-solid border-neutral-300 before:pointer-events-none before:absolute before:h-4 before:w-4 before:scale-0 before:rounded-full before:bg-transparent before:opacity-0 before:shadow-[0px_0px_0px_13px_transparent] before:content-[''] after:absolute after:z-[1] after:block after:h-4 after:w-4 after:rounded-full after:content-[''] checked:border-primary checked:before:opacity-[0.16] checked:after:absolute checked:after:left-1/2 checked:after:top-1/2 checked:after:h-[0.625rem] checked:after:w-[0.625rem] checked:after:rounded-full checked:after:border-primary checked:after:bg-black checked:after:content-[''] checked:after:[transform:translate(-50%,-50%)] hover:cursor-pointer hover:before:opacity-[0.04] hover:before:shadow-[0px_0px_0px_13px_rgba(0,0,0,0.6)] focus:shadow-none focus:outline-none focus:ring-0 focus:before:scale-100 focus:before:opacity-[0.12] focus:before:shadow-[0px_0px_0px_13px_rgba(0,0,0,0.6)] focus:before:transition-[box-shadow_0.2s,transform_0.2s] checked:focus:border-primary checked:focus:before:scale-100 checked:focus:before:shadow-[0px_0px_0px_13px_#3b71ca] checked:focus:before:transition-[box-shadow_0.2s,transform_0.2s] dark:border-neutral-600 dark:checked:border-primary dark:checked:after:border-primary dark:checked:after:bg-primary dark:focus:before:shadow-[0px_0px_0px_13px_rgba(255,255,255,0.4)] dark:checked:focus:border-primary dark:checked:focus:before:shadow-[0px_0px_0px_13px_#3b71ca]"
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
                    className="relative float-left -ml-[1.5rem] mr-1 mt-0.5 h-5 w-5 appearance-none rounded-full border-2 border-solid border-neutral-300 before:pointer-events-none before:absolute before:h-4 before:w-4 before:scale-0 before:rounded-full before:bg-transparent before:opacity-0 before:shadow-[0px_0px_0px_13px_transparent] before:content-[''] after:absolute after:z-[1] after:block after:h-4 after:w-4 after:rounded-full after:content-[''] checked:border-primary checked:before:opacity-[0.16] checked:after:absolute checked:after:left-1/2 checked:after:top-1/2 checked:after:h-[0.625rem] checked:after:w-[0.625rem] checked:after:rounded-full checked:after:border-primary checked:after:bg-black checked:after:content-[''] checked:after:[transform:translate(-50%,-50%)] hover:cursor-pointer hover:before:opacity-[0.04] hover:before:shadow-[0px_0px_0px_13px_rgba(0,0,0,0.6)] focus:shadow-none focus:outline-none focus:ring-0 focus:before:scale-100 focus:before:opacity-[0.12] focus:before:shadow-[0px_0px_0px_13px_rgba(0,0,0,0.6)] focus:before:transition-[box-shadow_0.2s,transform_0.2s] checked:focus:border-primary checked:focus:before:scale-100 checked:focus:before:shadow-[0px_0px_0px_13px_#3b71ca] checked:focus:before:transition-[box-shadow_0.2s,transform_0.2s] dark:border-neutral-600 dark:checked:border-primary dark:checked:after:border-primary dark:checked:after:bg-primary dark:focus:before:shadow-[0px_0px_0px_13px_rgba(255,255,255,0.4)] dark:checked:focus:border-primary dark:checked:focus:before:shadow-[0px_0px_0px_13px_#3b71ca]"
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
                    className="relative float-left -ml-[1.5rem] mr-1 mt-0.5 h-5 w-5 appearance-none rounded-full border-2 border-solid border-neutral-300 before:pointer-events-none before:absolute before:h-4 before:w-4 before:scale-0 before:rounded-full before:bg-transparent before:opacity-0 before:shadow-[0px_0px_0px_13px_transparent] before:content-[''] after:absolute after:z-[1] after:block after:h-4 after:w-4 after:rounded-full after:content-[''] checked:border-primary checked:before:opacity-[0.16] checked:after:absolute checked:after:left-1/2 checked:after:top-1/2 checked:after:h-[0.625rem] checked:after:w-[0.625rem] checked:after:rounded-full checked:after:border-primary checked:after:bg-black checked:after:content-[''] checked:after:[transform:translate(-50%,-50%)] hover:cursor-pointer hover:before:opacity-[0.04] hover:before:shadow-[0px_0px_0px_13px_rgba(0,0,0,0.6)] focus:shadow-none focus:outline-none focus:ring-0 focus:before:scale-100 focus:before:opacity-[0.12] focus:before:shadow-[0px_0px_0px_13px_rgba(0,0,0,0.6)] focus:before:transition-[box-shadow_0.2s,transform_0.2s] checked:focus:border-primary checked:focus:before:scale-100 checked:focus:before:shadow-[0px_0px_0px_13px_#3b71ca] checked:focus:before:transition-[box-shadow_0.2s,transform_0.2s] dark:border-neutral-600 dark:checked:border-primary dark:checked:after:border-primary dark:checked:after:bg-primary dark:focus:before:shadow-[0px_0px_0px_13px_rgba(255,255,255,0.4)] dark:checked:focus:border-primary dark:checked:focus:before:shadow-[0px_0px_0px_13px_#3b71ca]"
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
              <div className="flex justify-center mt-5">
                <button
                  type="button"
                  className="inline-block rounded bg-sky-500 disabled:opacity-25 px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:bg-primary-700 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] dark:shadow-[0_4px_9px_-4px_rgba(59,113,202,0.5)] dark:hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)]"
                  data-te-ripple-init
                  data-te-ripple-color="light"
                  disabled={
                    props.game.player2Played == true ||
                    played == true ||
                    props.game.active == false
                  }
                  onClick={() => {
                    play();
                    //   close();
                  }}
                >
                  Play
                </button>
              </div>
            </div>
          </Popup>
        )}
      </div>
    </div>
  );
};

export default Invited;

"use client";

import Navbar from "@/components/Navbar/navbar";
import Invited from "@/components/Invited/invited";
import { useWeb3ModalAccount } from "@web3modal/ethers5/react";

import { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import { BASE_URL } from "@/utils/constant";

export default function Page() {
  const { address, chainId, isConnected } = useWeb3ModalAccount();

  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState("loading");

  useMemo(() => {
    const fetchGames = async () => {
      axios
        .get(`${BASE_URL}/invited/${address}`)
        .then((res) => {
          console.log("data: ", res.data);
          const newdata = res.data.reverse();
          setGames(newdata);
          setLoading("success");
        })
        .catch((err) => {
          setLoading("error");
          console.log(err);
        });
    };
    fetchGames();

    console.log("Rerendered parent");
  }, [loading, address]);

  if (!isConnected) {
    return (
      <div>
        <Navbar />

        <div className="flex min-h-screen flex-col items-center justify-between p-24">
          <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex"></div>
          Please Connect your wallet
          <w3m-button /> <w3m-network-switch />
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
          <div className="mb-2 text-3xl font-medium leading-tight text-neutral-800 dark:text-neutral-50">
            Invited Games
          </div>
          <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex"></div>

          {loading === "loading" ? (
            <h1>Loading...</h1>
          ) : (
            games &&
            games.reverse().map((game, i) => <Invited game={game} key={i} />)
          )}

          {games.length == 0 ? (
            <h1>You don&apos;t have any games yet</h1>
          ) : (
            <></>
          )}

          <div className="relative flex place-items-center before:absolute before:h-[300px] before:w-full sm:before:w-[480px] before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-full sm:after:w-[240px] after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700 before:dark:opacity-10 after:dark:from-sky-900 after:dark:via-[#0141ff] after:dark:opacity-40 before:lg:h-[360px] z-[-1]"></div>
          <div className="mb-32 grid text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-4 lg:text-left"></div>
        </div>
      </>
    </div>
  );
}

"use client";
import { setCookie, getCookie } from "cookies-next";

export default function UserInfo() {
  const setData = async () => {
    setCookie(
      `${encodeURIComponent("server-key")}`,
      `${encodeURIComponent("value")}`,
      { maxAge: 60 * 60 * 24 }
    );
    console.log("Cookie Set!!");
  };
  const getData = async () => {
    const dat = getCookie(`${encodeURIComponent("server-key")}`);
    console.log("New cookie :", dat);
  };

  return (
    <>
      {/* <button onClick={setData}>Set Cookie</button> <br /> <br /> <br /> */}
      <button onClick={getData}>Get Cookie</button>
    </>
  );
}

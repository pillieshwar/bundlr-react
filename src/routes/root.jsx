import { Outlet, Link } from "react-router-dom";
import constants from "./constants";
import React from "react";
import { ethers } from "ethers";

export default function Root() {
  const [userAddress, setUserAddress] = React.useState("");
  React.useEffect(() => {
    const initialiseBundlr = async () => {
      const provider = new ethers.BrowserProvider(window.ethereum);
      // Prompt user for account connections
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      console.log("Account:", signer.address);
      setUserAddress(signer.address);
    };
    initialiseBundlr();
  }, []);
  console.log(constants.VERSION);
  return (
    <>
      <div id="sidebar">
        <h2 style={{ marginBottom: "-15px" }}> {constants.APP_NAME}</h2>
        <h1> Version: {constants.VERSION}</h1>
        <div>
          <form id="search-form" role="search">
            {/* <input
              id="q"
              aria-label="Search contacts"
              placeholder="Search"
              type="search"
              name="q"
            /> */}
            <div id="search-spinner" aria-hidden hidden={true} />
            <div className="sr-only" aria-live="polite"></div>
          </form>
          {/* <form method="post">
            <button type="submit">New</button>
          </form> */}
        </div>
        <nav>
          <ul>
            <li
              style={{
                overflow: "scroll",
                fontSize: "10px",
                fontStyle: "italic",
              }}
            >
              {/* <Link
                style={{
                  overflow: "scroll",
                  fontSize: "10px",
                  fontStyle: "italic",
                }}
                to={`login`}
              > */}
              Address: {userAddress}
              {/* </Link> */}
            </li>
            <li>
              <Link to={`askQuestions`}>Ask Question</Link>
            </li>
            <li>
              <Link to={`findAnswers`}>Questions</Link>
            </li>
            <li>
              <Link to={`contacts`}>Tags</Link>
            </li>
          </ul>
        </nav>
      </div>
      <div id="detail">
        <Outlet />
      </div>
    </>
  );
}

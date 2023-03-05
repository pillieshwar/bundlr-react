import { ethers } from "ethers";
import { WebBundlr } from "@bundlr-network/client";
import React from "react";
import { Answers } from "./Answers";

// This code has been updated for ethers.js v6
// https://docs.ethers.org/v6-beta/getting-started/
function App() {
  const [question, setQuestion] = React.useState("");

  const initialiseBundlr = async () => {
    // Connect to the MetaMask EIP-1193 object.
    // provider used for writing to the blockchain
    const provider = new ethers.BrowserProvider(window.ethereum);
    // signer used for reading from the blockchain
    const signer = await provider.getSigner();

    // link the signer to the provider
    provider.getSigner = () => signer;

    // create the WebBundlr object
    const bundlr = new WebBundlr(
      "https://node2.bundlr.network",
      "matic",
      provider
    );
    await bundlr.ready();

    const questionData = JSON.stringify({
      question: {
        title: question,
        timestamp: new Intl.DateTimeFormat("en-US", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }).format(Date.now()),
        tags: ["Arweave", "Web3", "TestByEshwar"],
      },
    });
    const tags = [
      { name: "App-Name", value: "web3fordev" },
      { name: "Content-Type", value: "application/json" },
      { name: "Version", value: "0.0.0" },
    ];
    const tx = bundlr.createTransaction(questionData, { tags });
    await tx.sign();

    await tx.upload();
    console.log(tx.id);

    const transactionId = tx.id;
    const data = await fetch("https://arweave.net/" + transactionId);
    const dataOnArweave = JSON.parse(await data.text());
    console.log(dataOnArweave);
    console.log("bundlr=", bundlr);
    return bundlr; // done!
  };

  const questionHandle = (e) => {
    setQuestion(e.target.value);
  };

  return (
    <div className="App" style={{ margin: "10%", marginLeft: "30%" }}>
      <Answers />
      <label>
        Text input: <input onChange={questionHandle} name="myInput" />
      </label>
      <button type="button" onClick={initialiseBundlr}>
        Ask Question
      </button>
    </div>
  );
}

export default App;

import { ethers } from "ethers";
import { WebBundlr } from "@bundlr-network/client";
import React from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import { useRef } from "react";

export default function AskQuestions() {
  const [questionTitle, setQuestionTitle] = React.useState("");
  const [questionBody, setQuestionBody] = React.useState("");

  const windowSize = useRef([window.innerWidth, window.innerHeight]);

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
        question_title: questionTitle,
        question_body: questionBody,
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
      { name: "Version", value: "0.0.1" },
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

  const questionTitleHandle = (e) => {
    setQuestionTitle(e.target.value);
  };
  const questionBodyHandle = (e) => {
    setQuestionBody(e.target.value);
  };

  return (
    <div className="App" style={{ margin: "0%" }}>
      <label>Title</label>
      {/* <button type="button" onClick={initialiseBundlr}>
        Ask Question
      </button> */}

      <br></br>
      <Box
        component="form"
        sx={{
          "& .MuiTextField-root": { m: 1, width: windowSize.current[0] / 1.5 },
        }}
        noValidate
        autoComplete="off"
      >
        <div>
          <TextField
            id="outlined-multiline-static"
            // label="Title"

            onChange={questionTitleHandle}
          />
        </div>
        <div>
          <label>Body</label>
          <br></br>
          <TextField
            id="outlined-multiline-static"
            // label="Body"
            multiline
            rows={7}
            onChange={questionBodyHandle}
          />
        </div>
        <div style={{ marginTop: "3%" }}>
          <button type="button" onClick={initialiseBundlr}>
            Ask Question
          </button>
        </div>
      </Box>
    </div>
  );
}

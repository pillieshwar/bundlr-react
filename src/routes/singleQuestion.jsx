import React from "react";
import axios from "axios";
import Grid from "@mui/material/Grid";
import { useLocation } from "react-router-dom";
import TextField from "@mui/material/TextField";
import { useRef } from "react";
import Box from "@mui/material/Box";
import { ethers } from "ethers";
import { WebBundlr } from "@bundlr-network/client";
import constants from "./constants";

import ReactMarkdown from "react-markdown";
import Arweave from "arweave";
const arweave = Arweave.init({
  host: "arweave.net",
  port: 443,
  protocol: "https",
});

const endpoint = "https://arweave.net/graphql/";

export default function SingleQuestion() {
  const [transactionJson, setTransactionJson] = React.useState({});
  const [postAnswer, setPostAnswer] = React.useState("");
  const [questionTransactionId, setQuestionTransactionId] = React.useState("");
  const [data, setData] = React.useState([]);
  const [display, setDisplay] = React.useState([]);

  const location = useLocation();
  var transactionId = "";

  const windowSize = useRef([window.innerWidth, window.innerHeight]);
  const answerHandle = (e) => {
    setPostAnswer(e.target.value);
  };
  console.log("questionTransactionId: ", questionTransactionId);
  React.useEffect(() => {
    async function postQuery() {
      if (location.pathname.includes("/tx")) {
        transactionId = location.pathname.split("/").pop();
        console.log("transactionId: ", transactionId);
      }

      if (transactionId !== "") {
        await axios({
          url: endpoint,
          method: "POST",
          data: {
            query: `{
            transactions(
              tags: [
                { name: "App-Name", values: ["${constants.APP_NAME}"] },
                { name: "Content-Type", values: ["${constants.CONTENT_TYPE}"] },
                { name: "Version", values: ["${constants.VERSION}"] },
                { name: "Question", values: ["false"] }
                { name: "Question-Tx-Id", values: ["${transactionId}"] },
              ]
            ) {
              edges {
                node {
                  id
                  owner {
                    address
                  }
                  data {
                    type
                  }
                  block {
                    height
                    timestamp
                  }
                  tags {
                    name
                    value
                  }
                }
              }
            }
          }`,
          },
        }).then((res) => {
          setData(res?.data?.data?.transactions?.edges);
        });
      }
    }
    postQuery();
  }, [transactionId]);
  React.useEffect(() => {
    async function getSingleTransactionJson() {
      if (transactionId !== "") {
        setTransactionJson(await arweave.api.get(transactionId));
        setQuestionTransactionId(transactionId);
      }
    }
    getSingleTransactionJson();
  }, [transactionId]);

  React.useEffect(() => {
    let promises = [];

    if (data) {
      data.map((current) => {
        promises.push(arweave.api.get(current.node.id));
      });

      Promise.all(promises).then((results) => {
        let oldDisplay = [...display];
        results.map((res) => {
          if (res?.data?.answer) {
            oldDisplay.push(res?.data?.answer);
          }
        });
        setDisplay(oldDisplay);
      });
    }
  }, [data]);

  console.log(display);
  const initialiseBundlr = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    provider.getSigner = () => signer;

    const bundlr = new WebBundlr(
      "https://node2.bundlr.network",
      "matic",
      provider
    );
    await bundlr.ready();

    const questionData = JSON.stringify({
      answer: {
        answer_body: postAnswer,
        timestamp: new Intl.DateTimeFormat("en-US", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }).format(Date.now()),
      },
    });
    const tags = [
      { name: "App-Name", value: constants.APP_NAME },
      { name: "Content-Type", value: constants.CONTENT_TYPE },
      { name: "Version", value: constants.VERSION },
      { name: "Question", value: "false" },
      { name: "Question-Tx-Id", value: questionTransactionId },
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
  return (
    <div>
      <Grid container spacing={2}>
        <div>
          <Grid mt={3} color="#3992FF" fontSize={"24px"} item xs={12}>
            {transactionJson?.data?.question?.question_title}
          </Grid>
          <Grid color="#838181" fontSize={"10px"} item xs={12}>
            {transactionJson?.data?.question?.timestamp}
          </Grid>
          <Grid item xs={12}>
            <hr />
          </Grid>
          <br></br>
          <Grid container>
            <Grid item xs={0.3}>
              x
            </Grid>
            <Grid color="#838181" fontSize={"14px"} item xs={8}>
              <ReactMarkdown>
                {transactionJson?.data?.question?.question_body}
              </ReactMarkdown>
            </Grid>
          </Grid>
          <br></br>
          <Grid container>
            <div>
              <Grid item xs={12}>
                Answers
              </Grid>
              <hr />
              {display.map((currentAns, i) => {
                return (
                  <div>
                    <Grid container>
                      <Grid item xs={0.3}></Grid>
                      <Grid
                        key={i}
                        color="#838181"
                        fontSize={"14px"}
                        item
                        xs={8}
                      >
                        <ReactMarkdown>{currentAns?.answer_body}</ReactMarkdown>
                      </Grid>
                    </Grid>
                    <hr />
                  </div>
                );
              })}
              <Grid item xs={12}>
                Your Answer
              </Grid>
              <Box
                component="form"
                sx={{
                  "& .MuiTextField-root": {
                    m: 1,
                    width: windowSize.current[0] / 1.5,
                  },
                }}
                noValidate
                autoComplete="off"
              >
                <TextField
                  id="outlined-multiline-static"
                  // label="Body"
                  xs={{ width: windowSize.current[0] / 1.5 }}
                  multiline
                  rows={7}
                  onChange={answerHandle}
                />
                <div style={{ marginTop: "1%" }}>
                  <button type="button" onClick={initialiseBundlr}>
                    Submit Answer
                  </button>
                </div>
              </Box>
            </div>
          </Grid>
        </div>
      </Grid>
    </div>
  );
}

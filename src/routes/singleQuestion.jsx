import { Form } from "react-router-dom";
import React from "react";
import axios from "axios";
import { useQuery } from "react-query";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import { styled } from "@mui/material/styles";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import TextField from "@mui/material/TextField";
import { useRef } from "react";
import Box from "@mui/material/Box";
import { ethers } from "ethers";
import { WebBundlr } from "@bundlr-network/client";

import Arweave from "arweave";
const arweave = Arweave.init({
  host: "arweave.net",
  port: 443,
  protocol: "https",
});

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "left",
  color: theme.palette.text.secondary,
}));
const endpoint = "https://arweave.net/graphql/";
const FILMS_QUERY = `

{
    transactions(
      tags: [
        { name: "App-Name", values: ["web3fordev"] },
        { name: "Content-Type", values: ["application/json"] }
        { name: "Version", values: ["0.0.0"] },
        { name: "Question-Tx-Id", values: ["mwlvlB-9iyqe0PfjORx545stMDz2hL1EdGigb85I2h4"] }
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
  }
`;

export default function SingleQuestion() {
  const [transactionJson, setTransactionJson] = React.useState({});
  const [postAnswer, setPostAnswer] = React.useState("");
  const [questionTransactionId, setQuestionTransactionId] = React.useState("");
  const [data, setData] = React.useState([]);

  const location = useLocation();
  if (location.pathname.includes("/tx")) {
    var transactionId = location.pathname.split("/").pop();
    console.log("transactionId: ", transactionId);
  }
  var txidTable = [];
  const windowSize = useRef([window.innerWidth, window.innerHeight]);
  const answerHandle = (e) => {
    setPostAnswer(e.target.value);
  };
  console.log("questionTransactionId: ", questionTransactionId);
  React.useEffect(() => {
    async function postQuery() {
      const response = await axios({
        url: endpoint,
        method: "POST",
        data: {
          query: `{
            transactions(
              tags: [
                { name: "App-Name", values: ["web3fordev"] },
                { name: "Content-Type", values: ["application/json"] }
                { name: "Version", values: ["0.0.1"] },
                { name: "Question-Tx-Id", values: [${questionTransactionId}] }
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
    postQuery();
  }, []);
  React.useEffect(() => {
    async function getSingleTransactionJson() {
      setTransactionJson(await arweave.api.get(transactionId));
      setQuestionTransactionId(transactionId);
    }
    getSingleTransactionJson();
  }, []);

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
      { name: "App-Name", value: "web3fordev" },
      { name: "Content-Type", value: "application/json" },
      { name: "Version", value: "0.0.1" },
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
          <Grid mt={7} color="#3992FF" fontSize={"24px"} item xs={12}>
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
              {transactionJson?.data?.question?.question_body}
            </Grid>
          </Grid>
          <br></br>
          <hr />
          <Grid container>
            <div>
              <Grid item xs={12}>
                Answers
              </Grid>
              <Grid container>
                <Grid item xs={0.3}></Grid>
                <Grid color="#838181" fontSize={"14px"} item xs={8}>
                  {data?.data?.answer?.answer_body}
                </Grid>
              </Grid>
              <hr />

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

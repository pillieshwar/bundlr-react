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
import constants from "./constants";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import Arweave from "arweave";
const arweave = Arweave.init({
  host: "arweave.net",
  port: 443,
  protocol: "https",
});

const endpoint = "https://arweave.net/graphql/";
const FILMS_QUERY = `
{
    transactions(
      tags: [
        { name: "App-Name", values: ["${constants.APP_NAME}"] },
        { name: "Content-Type", values: ["${constants.CONTENT_TYPE}"] },
        { name: "Version", values: ["${constants.VERSION}"] },
        { name: "Question", values: ["true"] }
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

export default function Contact() {
  const [display, setDisplay] = React.useState([]);
  const [data, setData] = React.useState([]);
  const [txId, setTxId] = React.useState([]);
  var txidTable = [];
  React.useEffect(() => {
    async function postQuery() {
      const response = await axios({
        url: endpoint,
        method: "POST",
        data: {
          query: FILMS_QUERY,
        },
      }).then((res) => {
        setData(res?.data?.data?.transactions?.edges);
      });
    }
    postQuery();
  }, []);

  React.useEffect(() => {
    let promises = [];

    if (data) {
      data.map((current) => {
        promises.push(arweave.api.get(current.node.id));
        txidTable.push(current.node.id);
      });
      setTxId(txidTable);

      Promise.all(promises).then((results) => {
        let oldDisplay = [...display];
        results.map((res) => {
          if (res?.data?.question) {
            oldDisplay.push(res?.data?.question);
          }
        });
        setDisplay(oldDisplay);
      });
    }
  }, [data]);
  function RedirectURL(id) {
    window.location = "https://viewblock.io/arweave/address/" + id;
  }
  return (
    <div>
      {display.map((current, i) => {
        return (
          <Grid container spacing={2}>
            <Grid color="#3992FF" item xs={12}>
              <span>
                <Link to={`/tx/${txId[i]}`}>{current.question_title}</Link>
                <br></br>
                {current.tags.map((tag) => {
                  return (
                    <Chip
                      sx={{ mr: 0.5 }}
                      label={tag}
                      size="small"
                      color="success"
                      variant="outlined"
                    />
                  );
                })}
              </span>
            </Grid>
            <Grid color="#838181" fontSize={"14px"} item xs={12}>
              {/* style={{
                whiteSpace: "nowrap",
                textOverflow: "ellipsis",
                width: "300px",
                display: "block",
                overflow: "hidden",
                minHeight: "30px",
              }} */}
              <Typography
                sx={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  display: "-webkit-box",
                  WebkitLineClamp: "2",
                  WebkitBoxOrient: "vertical",
                }}
                variant="body2"
                gutterBottom
              >
                {current.question_body}
              </Typography>
            </Grid>
            {/* <Grid item xs={12}>
              {current.tags.map((tag) => {
                return (
                  <Chip
                    label={tag}
                    size="small"
                    color="success"
                    variant="outlined"
                  />
                );
              })}
            </Grid> */}
            <br></br>
            <Grid
              item
              color="black"
              fontSize={"10px"}
              sx={{ float: "left" }}
              xs={12}
              md={10}
            >
              Asked by:{" "}
              <a href="#" onClick={() => RedirectURL(txId[i])}>
                {txId[i]}
              </a>
            </Grid>
            <Grid item fontSize={"11px"} md={2} xs={12}>
              {current.timestamp}
            </Grid>
            <br></br>
            <Grid item xs={12}>
              <hr />
            </Grid>
          </Grid>
        );
      })}
    </div>
  );
}

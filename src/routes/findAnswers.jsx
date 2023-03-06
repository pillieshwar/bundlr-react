import { Form } from "react-router-dom";
import React from "react";
import axios from "axios";
import { useQuery } from "react-query";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import { styled } from "@mui/material/styles";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";

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
        { name: "Version", values: ["0.0.0"] }
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
      });

      Promise.all(promises).then((results) => {
        let oldDisplay = [...display];
        results.map((res) => {
          if (res?.data?.question) {
            oldDisplay.push(res?.data?.question);
          }
          //   else if (res?.data?.question?.title) {
          //     oldDisplay.push(res?.data?.question?.title);
          //   }
        });

        setDisplay(oldDisplay);
      });
    }
  }, [data]);

  return (
    <div>
      <Grid container spacing={2}>
        {display.map((current, i) => {
          return (
            <div>
              <Grid color="#3992FF" item xs={12}>
                {current.question_title}
              </Grid>
              <Grid color="#838181" fontSize={"14px"} item xs={12}>
                {current.question_body}
              </Grid>
              <Grid item xs={12}>
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
              </Grid>
            </div>
          );
        })}
      </Grid>
    </div>
  );
}

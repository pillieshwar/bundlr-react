import React from "react";
import axios from "axios";
import { useQuery } from "react-query";
import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
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
  textAlign: "center",
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

export function Answers() {
  const [display, setDisplay] = React.useState([]);

  const { data, isLoading, error } = useQuery("launches", async () => {
    const response = await axios({
      url: endpoint,
      method: "POST",
      data: {
        query: FILMS_QUERY,
      },
    });
    return response?.data?.data?.transactions?.edges;
  });

  console.log("data:", data);

  if (data) {
    data.map(async (current) => {
      setDisplay(
        await (
          await arweave.api.get(current.node.id)
        ).data.question.title
      );
    });
  }

  //   if (isLoading) return "Loading...";
  //   if (error) return <pre>{error.message}</pre>;

  console.log("Display", display);
  return (
    <div>
      <Grid container spacing={2}>
        <Grid color="blue" item xs={12}>
          <Item>{display}</Item>
        </Grid>
      </Grid>
    </div>
  );
}

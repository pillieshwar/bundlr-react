import React from "react";
import axios from "axios";
import { useQuery } from "react-query";

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
      <ul>{display}</ul>
    </div>
  );
}

import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import AskQuestions from "./routes/askQuestions";
import FindAnswers from "./routes/findAnswers";
import reportWebVitals from "./reportWebVitals";
import { QueryClient, QueryClientProvider } from "react-query";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Root from "./routes/root";
import ErrorPage from "./error-page";
import Contact from "./routes/contact";

const client = new QueryClient();

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "contacts/:contactId",
        element: <Contact />,
      },
      {
        path: "askQuestions",
        element: <AskQuestions />,
      },
      {
        path: "findAnswers",
        element: <FindAnswers />,
      },
    ],
  },
]);

// const client = new ApolloClient
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <QueryClientProvider client={client} contextSharing={true}>
    <RouterProvider router={router}>
      <App />
      <FindAnswers />
    </RouterProvider>{" "}
  </QueryClientProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

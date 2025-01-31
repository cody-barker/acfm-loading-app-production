import React from "react";
import ReactDOM from "react-dom/client";
import "./styles/index.css";
import App from "./pages/App.js";
import reportWebVitals from "./reportWebVitals.js";
import { BrowserRouter } from "react-router-dom";
import { UserProvider } from "./contexts/UserContext.js";
import { ItemsProvider } from "./contexts/ItemsContext.js";
import { TeamsProvider } from "./contexts/TeamsContext.js";
import { LoadingListsProvider } from "./contexts/LoadingListsContext.js";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <BrowserRouter>
    <UserProvider>
      <ItemsProvider>
        <TeamsProvider>
          <LoadingListsProvider>
            <App />
          </LoadingListsProvider>
        </TeamsProvider>
      </ItemsProvider>
    </UserProvider>
  </BrowserRouter>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

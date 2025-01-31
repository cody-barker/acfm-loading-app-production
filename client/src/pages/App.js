import "../styles/App.css";
import { Routes, Route } from "react-router-dom";
import NavBar from "../components/NavBar";
import Login from "./Login";
import { useContext } from "react";
import { UserContext } from "../contexts/UserContext";
import PMDashboard from "./PMDashboard";

function App() {
  const { user, loading: userLoading } = useContext(UserContext);

  if (userLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="page-container">
        <div className="content-wrap">
          <Login />
        </div>
      </div>
    );
  }

  return (
    <>
        <header>
          <NavBar />
        </header>
        <main>
          <Routes>
            <Route path="/" element={<PMDashboard />} />
          </Routes>
        </main>
    </>
  );
}

export default App;

import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import NavBar from "../components/NavBar";
import { useContext } from "react";
import { UserContext } from "../contexts/UserContext";

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
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
          </Routes>
        </Router>
      </main>
    </>
  );
}

export default App;

import "../styles/App.css";
import { Routes, Route } from "react-router-dom";
import { useContext } from "react";
import { UserContext } from "../contexts/UserContext";
import NavBar from "../components/NavBar";
import LoadingListEditor from "./LoadingListEditor";
import Login from "./Login";
import PMDashboard from "./PMDashboard";
import Inventory from "./Inventory";
import Loaders from "./Loaders";

function LoadingScreen() {
  return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
    </div>
  );
}

function AuthenticatedApp() {
  return (
    <>
      <header>
        <NavBar />
      </header>
      <main className="main-container">
        <Routes>
          <Route path="/" element={<PMDashboard />} />
          <Route path="loading-lists/:id" element={<LoadingListEditor />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="loaders" element={<Loaders />} />
        </Routes>
      </main>
    </>
  );
}

function App() {
  const { user, loading: userLoading } = useContext(UserContext);

  if (userLoading) return <LoadingScreen />;
  if (!user) return <Login />;

  return <AuthenticatedApp />;
}

export default App;

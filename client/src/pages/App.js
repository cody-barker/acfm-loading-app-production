import "./App.css";
import { BrowserRouter as Routes, Route } from "react-router-dom";

function App() {
  return (
    <main>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </main>
  );
}

export default App;

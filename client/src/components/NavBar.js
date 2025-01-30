import { useState, useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { UserContext } from "../contexts/UserContext";

function NavBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);

  function handleLogout() {
    fetch("/logout", {
      method: "DELETE",
    }).then((r) => {
      if (r.ok) {
        setUser(null);
        navigate("/");
      }
    });
  }

  function toggleMenu() {
    setIsMenuOpen(!isMenuOpen);
  }

  function closeMenu() {
    setIsMenuOpen(false);
  }

  return (
    <div className="nav-container">
      <nav id="navbar">
        <NavLink to="/">
          <img
            className="logo-img"
            src="/assets/acfm_logo_transparent.svg"
            alt="logo"
          />
        </NavLink>
        <button className="menu-toggle" onClick={toggleMenu}>
          {isMenuOpen ? (
            <span className="hamburger-icon--close">&times;</span>
          ) : (
            <span className="hamburger-icon">&#9776;</span>
          )}
        </button>
        <div className={`nav-links ${isMenuOpen ? "open" : ""}`}>
          <NavLink className="nav-button" to="/" onClick={closeMenu}>
            Home{" "}
          </NavLink>

          <NavLink
            className="nav-button"
            to="/"
            onClick={() => {
              handleLogout();
              closeMenu();
            }}
          >
            Logout
          </NavLink>
        </div>
      </nav>
    </div>
  );
}

export default NavBar;

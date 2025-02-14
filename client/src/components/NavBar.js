import { useState, useContext, useCallback } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { UserContext } from "../contexts/UserContext";
import { Toolbar, Typography, AppBar, Button } from "@mui/material";

const NavItem = ({ to, label, onClick }) => (
  <NavLink to={to} onClick={onClick} style={{ textDecoration: "none" }}>
    <Typography variant="h6" color="inherit" sx={{ padding: 1 }}>
      {label}
    </Typography>
  </NavLink>
);

function NavBar() {
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  async function handleLogout() {
    try {
      const response = await fetch("/logout", { method: "DELETE" });
      if (response.ok) {
        setUser(null);
        navigate("/");
      } else {
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("Network error during logout:", error);
    }
  }

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  return (
    <AppBar position="static">
      <Toolbar variant="dense">
        <NavItem to="/" label="Loading Lists" />
        <NavItem to="/inventory" label="Inventory" />
        <NavItem to="/loaders" label="Loaders" />
        <Button
          color="inherit"
          onClick={() => {
            handleLogout();
            closeMenu();
          }}
          sx={{ padding: 1 }}
        >
          Log Out
        </Button>
      </Toolbar>
    </AppBar>
  );
}

export default NavBar;

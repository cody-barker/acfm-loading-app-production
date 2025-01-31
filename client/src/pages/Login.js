import LoginForm from "../components/LoginForm";
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Alert,
} from "@mui/material";

function Login() {
  return (
    <div className="wrapper  background-image ">
      <div className="wrapper__form wrapper__form--login">
        <h1 className="wrapper__title">ACFM Loading App</h1>
        <LoginForm />
      </div>
    </div>
  );
}

export default Login;

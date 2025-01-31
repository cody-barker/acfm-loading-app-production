import React, { useState, useContext } from "react";
import { UserContext } from "../contexts/UserContext";
import Error from "../components/Error";
import { Container, Box, TextField, Button, Typography } from "@mui/material";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [token, setToken] = useState("");
  const { setUser } = useContext(UserContext);

  const loginUser = async (email, password) => {
    const response = await fetch("/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      return { success: true, user: data };
    } else {
      return {
        success: false,
        error: data.errors,
      };
    }
  };

  const signUpUser = async (userData) => {
    const response = await fetch("/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (response.ok) {
      return { success: true, user: data };
    } else {
      return {
        success: false,
        error: data.errors,
      };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (isSignUp) {
      const result = await signUpUser({
        email,
        password,
        password_confirmation: passwordConfirmation,
        first_name: firstName,
        last_name: lastName,
        token,
      });
      if (result.success) {
        setUser(result.user);
      } else {
        setError(result.error);
      }
    } else {
      const result = await loginUser(email, password);
      if (result.success) {
        setUser(result.user);
      } else {
        console.log(result);
        setError(result.error);
      }
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography component="h1" variant="h5">
          ACFM Loading App
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          {error && <Error error={error} />}
          {isSignUp && (
            <>
              <TextField
                margin="normal"
                required
                fullWidth
                id="firstName"
                label="First Name"
                name="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                id="lastName"
                label="Last Name"
                name="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </>
          )}
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {isSignUp && (
            <>
              <TextField
                margin="normal"
                required
                fullWidth
                name="passwordConfirmation"
                label="Confirm Password"
                type="password"
                id="passwordConfirmation"
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="token"
                label="Employee Token"
                id="token"
                value={token}
                onChange={(e) => setToken(e.target.value)}
              />
            </>
          )}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            {isSignUp ? "Sign Up" : "Sign In"}
          </Button>
          <Button
            fullWidth
            variant="outlined"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError("");
            }}
            sx={{ mb: 2 }}
          >
            {isSignUp ? "Back to Login" : "Create Account"}
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default Login;

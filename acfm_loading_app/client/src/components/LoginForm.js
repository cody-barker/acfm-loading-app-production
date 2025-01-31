import { useState, useContext } from "react";
import Error from "./Error";
import { UserContext } from "../contexts/UserContext";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { setUser } = useContext(UserContext);

  function handleSubmit(e) {
    e.preventDefault();
    setIsLoading(true);
    fetch("/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    })
      .then((r) => {
        setIsLoading(false);
        if (r.ok) {
          r.json().then((user) => {
            setUser(user);
          });
        } else {
          r.json().then((err) => setErrors(err.errors));
        }
      })
      .catch((error) => {
        setIsLoading(false);
        console.error("Login error:", error);
      });
  }

  return (
    <form className="form form--login" onSubmit={handleSubmit}>
      <label className="form__label">
        Email
        <input
          name="email"
          type="text"
          autoComplete="off"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </label>
      <label className="form__label">
        Password
        <input
          name="password"
          type="password"
          autoComplete="off"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </label>

      <button className="button button--login" type="submit">
        {isLoading ? "Loading..." : "Login"}
      </button>

      {errors.map((err) => (
        <Error key={err}>{err}</Error>
      ))}
    </form>
  );
}

export default LoginForm;

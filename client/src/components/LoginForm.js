import { useState, useContext } from "react";
import Error from "./Error";
import { UserContext } from "../contexts/UserContext";

function LoginForm() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { setUser } = useContext(UserContext);

  function handleSubmit(e) {
    e.preventDefault();
    setIsLoading(true);
    login();
  }

  function login() {
    fetch("/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
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

  function handleInputChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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
          onChange={handleInputChange}
        />
      </label>
      <label className="form__label">
        Password
        <input
          name="password"
          type="password"
          autoComplete="off"
          value={password}
          onChange={handleInputChange}
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

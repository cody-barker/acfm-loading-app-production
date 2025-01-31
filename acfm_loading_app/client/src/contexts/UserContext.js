import { useState, useEffect, useMemo, createContext } from "react";

const UserContext = createContext();

function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const fetchUser = async () => {
      try {
        const response = await fetch("/me", { signal });
        if (!response.ok) throw new Error("Failed to fetch user");

        const userData = await response.json();
        setUser(userData);
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Error fetching user:", error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUser();

    return () => controller.abort();
  }, []);

  const value = useMemo(() => ({ user, setUser, loading }), [user, loading]);

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export { UserContext, UserProvider };

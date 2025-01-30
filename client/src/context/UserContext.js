import { useState, useEffect, createContext } from "react";

const UserContext = createContext();

function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;
    let isMounted = true;

    const fetchUser = async () => {
      try {
        const response = await fetch("/me", { signal });
        if (!response.ok) throw new Error("Failed to fetch user");

        const userData = await response.json();
        if (isMounted) {
          setUser(userData);
          setLoading(false);
        }
      } catch (error) {
        if (error.name !== "AbortError" && isMounted) {
          console.error("Error fetching user:", error);
          setLoading(false);
        }
      }
    };

    fetchUser();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, loading }}>
      {children}
    </UserContext.Provider>
  );
}

export { UserContext, UserProvider };

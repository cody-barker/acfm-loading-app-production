import { useState, useEffect, useMemo, createContext, useContext } from "react";
import { UserContext } from "./UserContext";

const TeamsContext = createContext();

function TeamsProvider({ children }) {
  const { user } = useContext(UserContext);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const fetchTeams = async () => {
      if (!user) return;
      try {
        const response = await fetch("/api/teams", { signal });
        if (!response.ok) throw new Error("Failed to fetch teams");

        const teamData = await response.json();
        setTeams(teamData);
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Error fetching teams:", error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();

    return () => controller.abort();
  }, [user]);

  const value = useMemo(() => ({ teams, setTeams, loading }), [teams, loading]);

  return (
    <TeamsContext.Provider value={value}>{children}</TeamsContext.Provider>
  );
}

export { TeamsContext, TeamsProvider };

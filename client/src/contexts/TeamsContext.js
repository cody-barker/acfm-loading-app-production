import { useState, useEffect, useMemo, createContext } from "react";

const TeamsContext = createContext();

function TeamsProvider({ children }) {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const fetchTeams = async () => {
      try {
        const response = await fetch("/teams", { signal });
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
  }, []);

  const value = useMemo(() => ({ teams, setTeams, loading }), [teams, loading]);

  return (
    <TeamsContext.Provider value={value}>{children}</TeamsContext.Provider>
  );
}

export { TeamsContext, TeamsProvider };

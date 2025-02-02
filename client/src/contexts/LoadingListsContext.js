import { useState, useEffect, useMemo, createContext } from "react";

export const LoadingListsContext = createContext();

export const LoadingListsProvider = ({ children }) => {
  const [loadingLists, setLoadingLists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const fetchLoadingLists = async () => {
      try {
        const response = await fetch("/api/loading_lists", { signal });
        if (!response.ok) throw new Error("Failed to fetch loading lists");

        const loadingListData = await response.json();
        setLoadingLists(loadingListData);
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Error fetching loading lists:", error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchLoadingLists();

    return () => controller.abort();
  }, []);

  const value = useMemo(
    () => ({
      loadingLists,
      setLoadingLists,
      loading,
      setLoading
    }),
    [loadingLists, loading]
  );

  return (
    <LoadingListsContext.Provider value={value}>
      {children}
    </LoadingListsContext.Provider>
  );
};

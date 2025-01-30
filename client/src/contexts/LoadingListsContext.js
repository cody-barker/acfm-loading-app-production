import { useState, useEffect, useMemo, createContext } from "react";

const LoadingListsContext = createContext();

function LoadingListsProvider({ children }) {
  const [loadingLists, setLoadingLists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const fetchLoadingLists = async () => {
      try {
        const response = await fetch("/loading_lists", { signal });
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
    () => ({ loadingLists, loading }),
    [loadingLists, loading]
  );

  return (
    <LoadingListsContext.Provider value={value}>
      {children}
    </LoadingListsContext.Provider>
  );
}

export { LoadingListsContext, LoadingListsProvider };

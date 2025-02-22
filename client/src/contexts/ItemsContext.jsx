import { useState, useEffect, useMemo, createContext, useContext } from "react";
import { UserContext } from "./UserContext";

const ItemsContext = createContext();

function ItemsProvider({ children }) {
  const { user } = useContext(UserContext);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const fetchItems = async () => {
      if (!user) return;

      try {
        const response = await fetch("/api/items", { signal });
        if (!response.ok) throw new Error("Failed to fetch items");

        const itemsData = await response.json();
        setItems(itemsData);
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Error fetching items:", error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchItems();

    return () => controller.abort();
  }, [user]);

  const value = useMemo(() => ({ items, setItems, loading }), [items, loading]);

  return (
    <ItemsContext.Provider value={value}>{children}</ItemsContext.Provider>
  );
}

export { ItemsContext, ItemsProvider };

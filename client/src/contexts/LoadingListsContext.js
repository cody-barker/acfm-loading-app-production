import { useState, useEffect, useMemo, createContext } from "react";

export const LoadingListsContext = createContext();

export const LoadingListsProvider = ({ children }) => {
  const [loadingLists, setLoadingLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [availableItems, setAvailableItems] = useState([]);

  const updateLoadingList = (id, updatedItems) => {
    setLoadingLists((prevLists) =>
      prevLists.map((list) =>
        list.id === id ? { ...list, loading_list_items: updatedItems } : list
      )
    );
  };

  const updateAvailableItems = (itemId, quantityChange) => {
    setAvailableItems((prevAvailableItems) =>
      prevAvailableItems.map((item) =>
        item.id === itemId
          ? { ...item, quantity: item.quantity + quantityChange }
          : item
      )
    );
  };

  const updateLoadingListItemQuantity = (
    loadingListItemId,
    quantity,
    adjustAvailable
  ) => {
    // Logic to update the loading list item quantity in the context
    // ...

    if (adjustAvailable) {
      // Logic to adjust the available item quantity
      setAvailableItems((prevAvailableItems) => {
        return prevAvailableItems.map((availableItem) =>
          availableItem.id === loadingListItemId
            ? {
                ...availableItem,
                quantity:
                  availableItem.quantity +
                  (adjustAvailable === "increase" ? 1 : -1),
              }
            : availableItem
        );
      });
    }
  };

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
      updateLoadingList,
      availableItems,
      setAvailableItems,
      updateLoadingListItemQuantity,
      updateAvailableItems,
    }),
    [loadingLists, loading, availableItems]
  );

  return (
    <LoadingListsContext.Provider value={value}>
      {children}
    </LoadingListsContext.Provider>
  );
};

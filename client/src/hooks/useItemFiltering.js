import { useState, useMemo } from "react";

export const useItemFiltering = (items, selectedCategory) => {
  const [itemNameFilter, setItemNameFilter] = useState("");

  const uniqueCategories = useMemo(
    () => [...new Set(items.map((item) => item.category))],
    [items]
  );

  const filteredItems = useMemo(
    () =>
      items.filter((item) => {
        const matchesCategory = selectedCategory
          ? item.category === selectedCategory
          : true;
        const matchesName = itemNameFilter
          ? item.name.toLowerCase().includes(itemNameFilter.toLowerCase())
          : true;
        return matchesCategory && matchesName;
      }),
    [items, selectedCategory, itemNameFilter]
  );

  return {
    itemNameFilter,
    setItemNameFilter,
    uniqueCategories,
    filteredItems,
  };
};

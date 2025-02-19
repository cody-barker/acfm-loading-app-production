import { useState, useMemo } from "react";

export const useItemFiltering = (items, selectedCategory) => {
  const [nameFilter, setNameFilter] = useState("");

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
        const matchesName = nameFilter
          ? item.name.toLowerCase().includes(nameFilter.toLowerCase())
          : true;
        return matchesCategory && matchesName;
      }),
    [items, selectedCategory, nameFilter]
  );

  return {
    nameFilter,
    setNameFilter,
    uniqueCategories,
    filteredItems,
  };
};

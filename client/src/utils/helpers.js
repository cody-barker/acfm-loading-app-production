import { format } from "date-fns";

export const getLoadText = (date, tomorrow) => {
  if (date < tomorrow) return "Loaded";
  return "Load";
};

export const formatDate = (date, today, tomorrow) => {
  if (date === tomorrow) return "Today";
  if (date === today) return "Yesterday";
  return format(date, "MM-dd-yyyy");
};

export const formatReturnDate = (returnDate, today, tomorrow) => {
  if (returnDate === today) return "Today";
  if (returnDate === tomorrow) return "Tomorrow";
  return format(returnDate, "MM-dd-yyyy");
};

export const getItemIdFromDraggable = (draggableId) => {
  const id = parseInt(draggableId, 10);
  return isNaN(id) ? null : id;
};

export const settlePromise = (promise) =>
  Promise.allSettled([promise]).then(([{ value, reason }]) => [value, reason]);

/**
 * Calculates the total quantity of an item returning on a specific date
 * @param {number} itemId - The ID of the item to check
 * @param {Array} loadingLists - Array of loading lists to check
 * @param {string} returnDate - The date to check returns for (YYYY-MM-DD format)
 * @returns {number} Total quantity of the item returning on the specified date
 */
export const calculateReturningQuantity = (
  itemId,
  loadingLists,
  returnDate
) => {
  return loadingLists.reduce((total, list) => {
    const item = list.loading_list_items.find(
      (loadingListItem) =>
        loadingListItem.item_id === itemId && list.return_date === returnDate
    );
    return total + (item?.quantity || 0);
  }, 0);
};

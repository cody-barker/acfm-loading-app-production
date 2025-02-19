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

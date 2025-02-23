// useLoadingListDates.jsx
export const useLoadingListDates = () => {
  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const formattedTomorrow = tomorrow.toISOString().split("T")[0];

  return { today, formattedTomorrow };
};

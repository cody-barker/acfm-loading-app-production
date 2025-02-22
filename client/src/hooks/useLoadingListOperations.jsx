import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loadingListService } from "../services/loadingListService";
import { settlePromise } from "../utils/helpers";

export const useLoadingListOperations = (
  loadingList,
  setLoadingLists,
  setItems,
  setCopyDialogOpen
) => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [copyError, setCopyError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await loadingListService.deleteList(loadingList.id);

      // Update local state
      setLoadingLists((prevLists) =>
        prevLists.filter((list) => list.id !== loadingList.id)
      );

      // Fetch updated items
      const [itemsResponse, itemsError] = await settlePromise(
        fetch("/api/items")
      );

      if (itemsError) {
        return console.error("Failed to fetch updated items: ", itemsError);
      }

      const updatedItems = await itemsResponse.json();
      setItems(updatedItems);
      navigate("/");
    } catch (error) {
      setError(error.errors);
      console.error("Error deleting loading list:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopySubmit = async (copyFormData) => {
    setIsLoading(true);
    setCopyError(null);

    try {
      const newList = await loadingListService.submitListCopy(
        copyFormData,
        loadingList.loading_list_items
      );

      // Update local state with the new list
      setLoadingLists((prevLists) => [...prevLists, newList]);

      // Close dialog and navigate
      setCopyDialogOpen(false);
      navigate(`/loading-lists/${newList.id}`);
    } catch (error) {
      // For 422 responses, error will contain the errors array from your API
      console.error("Error copying loading list:", error);
      setCopyError(error.errors);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    error,
    copyError,
    isLoading,
    handleDelete,
    handleCopySubmit,
    setError,
    setCopyError,
  };
};

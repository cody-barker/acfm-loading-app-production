import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loadingListService } from "../services/loadingListService";
import { settlePromise } from "../utils/helpers";

export const useLoadingListOperations = (
  loadingList,
  setLoadingLists,
  setItems
) => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [copyError, setCopyError] = useState(null);

  const handleDelete = async () => {
    try {
      await loadingListService.deleteList(loadingList.id);
      setLoadingLists((prevLists) =>
        prevLists.filter((list) => list.id !== loadingList.id)
      );

      const [itemsResponse, itemsError] = await settlePromise(
        fetch("/api/items")
      );
      if (itemsError)
        return console.error("Error fetching updated items:", itemsError);

      const updatedItems = await itemsResponse.json();
      setItems(updatedItems);
      navigate("/");
    } catch (error) {
      console.error("Error deleting loading list:", error);
    }
  };

  return { error, copyError, handleDelete, setError, setCopyError };
};

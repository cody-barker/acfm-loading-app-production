import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loadingListService } from "../services/loadingListService";
import { settlePromise } from "../utils/helpers";

export const useLoadingListOperations = (
  loadingList,
  loadingLists,
  setLoadingLists,
  setItems,
  setCopyDialogOpen,
  setOpenEditForm,
  setEditForm,
  items
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

  const handleSubmit = async (editForm) => {
    setIsLoading(true);
    setError(null);

    try {
      const updatedList = await loadingListService.updateListDetails(
        editForm,
        loadingList.id
      );

      // Update local state
      setLoadingLists(
        loadingLists.map((list) =>
          list.id === loadingList.id ? updatedList : list
        )
      );

      // Close the form
      setOpenEditForm(false);
    } catch (error) {
      setError(error.message);
      console.error("Error updating loading list:", error);
    } finally {
      setIsLoading(false);
      setOpenEditForm(false);
    }
  };

  const updateItemQuantity = async (item, delta) => {
    setIsLoading(true);
    setError(null);

    try {
      const updatedItem = await loadingListService.updateItemQuantity(
        item.id,
        item.quantity + delta
      );

      // Update local state
      setItems((prev) =>
        prev.map((i) =>
          i.id === updatedItem.id ? { ...i, quantity: updatedItem.quantity } : i
        )
      );
    } catch (error) {
      setError(error.message);
      console.error("Error updating item quantity:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const decreaseItemQuantity = (item) => updateItemQuantity(item, -1);
  const increaseItemQuantity = (item) => updateItemQuantity(item, 1);

  const findLoadingListItemById = (id) =>
    loadingList?.loading_list_items?.find((item) => item.id === id);

  const removeItemFromLoadingList = (sourceIndex) => {
    setLoadingLists((prev) =>
      prev.map((list) =>
        list.id === loadingList.id
          ? {
              ...list,
              loading_list_items: list.loading_list_items.filter(
                (_, index) => index !== sourceIndex
              ),
            }
          : list
      )
    );
  };

  const returnLoadingListItemToAvailableItems = (itemId, quantity) => {
    setItems((prev) =>
      prev.map((availableItem) =>
        availableItem.id === itemId
          ? { ...availableItem, quantity: availableItem.quantity + quantity }
          : availableItem
      )
    );
  };

  const createLoadingListItem = async (item) => {
    try {
      const newLoadingListItem = await loadingListService.createLoadingListItem(
        loadingList.id,
        item.id
      );

      setLoadingLists((prev) =>
        prev.map((list) =>
          list.id === newLoadingListItem.loading_list_id
            ? {
                ...list,
                loading_list_items: [
                  ...list.loading_list_items,
                  newLoadingListItem,
                ],
              }
            : list
        )
      );

      await decreaseItemQuantity(item);
      setError(null);
      return true;
    } catch (error) {
      setError(error.message);
      console.error("Error creating loading list item:", error);
      return false;
    }
  };

  const updateLoadingListItemQuantity = async (loadingListItem, delta) => {
    try {
      const updatedItem =
        await loadingListService.updateLoadingListItemQuantity(
          loadingListItem.id,
          loadingListItem.quantity + delta
        );

      setLoadingLists((prev) =>
        prev.map((list) =>
          list.id === loadingListItem.loading_list_id
            ? {
                ...list,
                loading_list_items: list.loading_list_items.map((item) =>
                  item.id === updatedItem.id
                    ? { ...item, quantity: updatedItem.quantity }
                    : item
                ),
              }
            : list
        )
      );

      if (delta > 0) {
        await decreaseItemQuantity(updatedItem.item);
      } else {
        await increaseItemQuantity(updatedItem.item);
      }
      setError(null);
      return true;
    } catch (error) {
      setError(error.message);
      console.error("Error updating loading list item quantity:", error);
      return false;
    }
  };

  const deleteLoadingListItem = async (id) => {
    const loadingListItem = findLoadingListItemById(id);
    if (!loadingListItem) {
      console.error("Loading list item not found:", id);
      return false;
    }

    try {
      await loadingListService.deleteLoadingListItem(id);

      const index = loadingList.loading_list_items.findIndex(
        (item) => item.id === id
      );
      removeItemFromLoadingList(index);
      returnLoadingListItemToAvailableItems(
        loadingListItem.item_id,
        loadingListItem.quantity
      );
      setError(null);
      return true;
    } catch (error) {
      setError(error.message);
      console.error("Error deleting loading list item:", error);
      return false;
    }
  };

  const increaseLoadingListItemQuantity = (loadingListItem) =>
    updateLoadingListItemQuantity(loadingListItem, 1);

  const decreaseLoadingListItemQuantity = async (loadingListItem) => {
    // If quantity is 1, delete the item instead of decreasing
    if (loadingListItem.quantity === 1) {
      return deleteLoadingListItem(loadingListItem.id);
    }
    return updateLoadingListItemQuantity(loadingListItem, -1);
  };

  const handleAddToLoadingList = async (draggedItemId) => {
    const item = items.find((i) => i.id === draggedItemId);

    if (!item) {
      setError("Error: Item not found.");
      return false;
    }

    const itemExists = loadingList.loading_list_items.some(
      (loadingListItem) => loadingListItem.item_id === item.id
    );

    if (itemExists) {
      setError("This item is already on the loading list.");
      return false;
    }

    return await createLoadingListItem(item);
  };

  const handleRemoveFromLoadingList = async (sourceIndex) => {
    const item = loadingList.loading_list_items[sourceIndex];
    if (!item) return false;
    return deleteLoadingListItem(item.id);
  };

  return {
    error,
    copyError,
    isLoading,
    handleDelete,
    handleCopySubmit,
    handleSubmit,
    decreaseItemQuantity,
    increaseItemQuantity,
    createLoadingListItem,
    increaseLoadingListItemQuantity,
    decreaseLoadingListItemQuantity,
    handleAddToLoadingList,
    handleRemoveFromLoadingList,
    setError,
    setCopyError,
  };
};

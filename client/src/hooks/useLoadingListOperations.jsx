import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { loadingListService } from "../services/loadingListService";
import { settlePromise } from "../utils/helpers";

export const useLoadingListOperations = (
  loadingList = null,
  loadingLists = [],
  setLoadingLists,
  setItems = null,
  setCopyDialogOpen = null,
  setOpenEditForm = null,
  setEditForm = null,
  items = null
) => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [copyError, setCopyError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Add refs for abort controllers
  const createControllerRef = useRef(null);
  const deleteControllerRef = useRef(null);
  const copyControllerRef = useRef(null);
  const submitControllerRef = useRef(null);
  const quantityControllerRef = useRef(null);
  const createItemControllerRef = useRef(null);
  const updateListItemControllerRef = useRef(null);

  // Cleanup function to abort any pending requests when component unmounts
  useEffect(() => {
    return () => {
      createControllerRef.current?.abort();
      deleteControllerRef.current?.abort();
      copyControllerRef.current?.abort();
      submitControllerRef.current?.abort();
      quantityControllerRef.current?.abort();
      createItemControllerRef.current?.abort();
      updateListItemControllerRef.current?.abort();
    };
  }, []);

  const handleCreate = async (formData) => {
    // Abort any existing create operation
    createControllerRef.current?.abort();
    createControllerRef.current = new AbortController();

    setIsLoading(true);
    setError(null);

    try {
      const newList = await loadingListService.createList(
        formData,
        createControllerRef.current.signal
      );

      // Update local state
      setLoadingLists((prevLists) => [...prevLists, newList]);
      return newList;
    } catch (error) {
      if (error.name === "AbortError") return;
      setError(error.errors);
      console.error("Error creating loading list:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    // Abort any existing delete operation
    deleteControllerRef.current?.abort();
    deleteControllerRef.current = new AbortController();

    setIsLoading(true);
    setError(null);
    try {
      await loadingListService.deleteList(
        loadingList?.id,
        deleteControllerRef.current.signal
      );

      // Update local state
      setLoadingLists((prevLists) =>
        prevLists.filter((list) => list.id !== loadingList?.id)
      );

      // Fetch updated items
      const [itemsResponse, itemsError] = await settlePromise(
        fetch("/api/items", { signal: deleteControllerRef.current.signal })
      );

      if (itemsError) {
        if (itemsError.name === "AbortError") return;
        return console.error("Failed to fetch updated items: ", itemsError);
      }

      const updatedItems = await itemsResponse.json();
      setItems?.(updatedItems);
      navigate("/");
    } catch (error) {
      if (error.name === "AbortError") return;
      setError(error.errors);
      console.error("Error deleting loading list:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopySubmit = async (copyFormData) => {
    // Abort any existing copy operation
    copyControllerRef.current?.abort();
    copyControllerRef.current = new AbortController();

    setIsLoading(true);
    setCopyError(null);

    try {
      const newList = await loadingListService.submitListCopy(
        copyFormData,
        loadingList?.loading_list_items,
        copyControllerRef.current.signal
      );

      setLoadingLists((prevLists) => [...prevLists, newList]);
      setCopyDialogOpen?.(false);
      navigate(`/loading-lists/${newList.id}`);
    } catch (error) {
      if (error.name === "AbortError") return;
      console.error("Error copying loading list:", error);
      setCopyError(error.errors);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (editForm) => {
    // Abort any existing submit operation
    submitControllerRef.current?.abort();
    submitControllerRef.current = new AbortController();

    setIsLoading(true);
    setError(null);

    try {
      const updatedList = await loadingListService.updateListDetails(
        editForm,
        loadingList?.id,
        submitControllerRef.current.signal
      );

      setLoadingLists(
        loadingLists.map((list) =>
          list.id === loadingList?.id ? updatedList : list
        )
      );

      // Only close the form on successful update
      setOpenEditForm?.(false);
    } catch (error) {
      if (error.name === "AbortError") return;
      setError(error.errors);
      console.error("Error updating loading list:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateItemQuantity = async (item, delta) => {
    // Abort any existing quantity update operation
    quantityControllerRef.current?.abort();
    quantityControllerRef.current = new AbortController();

    setIsLoading(true);
    setError(null);

    try {
      const updatedItem = await loadingListService.updateItemQuantity(
        item.id,
        item.quantity + delta,
        quantityControllerRef.current.signal
      );

      setItems?.((prev) =>
        prev.map((i) =>
          i.id === updatedItem.id ? { ...i, quantity: updatedItem.quantity } : i
        )
      );
    } catch (error) {
      if (error.name === "AbortError") return;
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
        list.id === loadingList?.id
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
    setItems?.((prev) =>
      prev.map((availableItem) =>
        availableItem.id === itemId
          ? { ...availableItem, quantity: availableItem.quantity + quantity }
          : availableItem
      )
    );
  };

  const createLoadingListItem = async (item) => {
    // Abort any existing create operation
    createItemControllerRef.current?.abort();
    createItemControllerRef.current = new AbortController();

    try {
      const newLoadingListItem = await loadingListService.createLoadingListItem(
        loadingList?.id,
        item.id,
        createItemControllerRef.current.signal
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
      if (error.name === "AbortError") return;
      setError(error.message);
      console.error("Error creating loading list item:", error);
      return false;
    }
  };

  const updateLoadingListItemQuantity = async (loadingListItem, delta) => {
    // Abort any existing update operation
    updateListItemControllerRef.current?.abort();
    updateListItemControllerRef.current = new AbortController();

    try {
      const updatedItem =
        await loadingListService.updateLoadingListItemQuantity(
          loadingListItem.id,
          loadingListItem.quantity + delta,
          updateListItemControllerRef.current.signal
        );

      setLoadingLists((prev) =>
        prev.map((list) =>
          list.id === loadingListItem.loading_list_id
            ? {
                ...list,
                loading_list_items: list.loading_list_items.map((item) =>
                  item.id === updatedItem.id ? updatedItem : item
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
      if (error.name === "AbortError") return;
      console.error("Error updating loading list item quantity:", error);
      throw error;
    }
  };

  const deleteLoadingListItem = async (id) => {
    deleteControllerRef.current?.abort();
    deleteControllerRef.current = new AbortController();

    const loadingListItem = findLoadingListItemById(id);
    if (!loadingListItem) {
      console.error("Loading list item not found:", id);
      return false;
    }

    try {
      await loadingListService.deleteLoadingListItem(
        id,
        deleteControllerRef.current.signal
      );

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
      if (error.name === "AbortError") return;
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
    const item = items?.find((i) => i.id === draggedItemId);

    if (!item) {
      setError("Error: Item not found.");
      return false;
    }

    const itemExists = loadingList?.loading_list_items.some(
      (loadingListItem) => loadingListItem.item_id === item.id
    );

    if (itemExists) {
      setError("This item is already on the loading list.");
      return false;
    }

    return await createLoadingListItem(item);
  };

  const handleRemoveFromLoadingList = async (sourceIndex) => {
    const item = loadingList?.loading_list_items[sourceIndex];
    if (!item) return false;
    return deleteLoadingListItem(item.id);
  };

  return {
    error,
    copyError,
    isLoading,
    handleCreate,
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

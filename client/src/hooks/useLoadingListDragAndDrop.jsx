import { getItemIdFromDraggable } from "../utils/helpers";

export const useLoadingListDragAndDrop = (
  handleAddToLoadingList,
  handleRemoveFromLoadingList,
  setError
) => {
  const handleDragEnd = async (result) => {
    const { source, destination } = result;

    // Early return if no valid drop
    if (!isValidDrop(source, destination)) {
      return;
    }

    if (isMovingToAvailableItems(source, destination)) {
      await handleRemoveFromLoadingList(source.index);
      return;
    }

    if (isMovingToLoadingList(source, destination)) {
      const itemId = getItemIdFromDraggable(result.draggableId);
      if (!itemId) {
        setError("Invalid item ID");
        return;
      }
      await handleAddToLoadingList(itemId);
    }
  };

  // Helper functions for cleaner code
  const isValidDrop = (source, destination) => {
    return (
      destination &&
      (source.droppableId !== destination.droppableId ||
        source.index !== destination.index)
    );
  };

  const isMovingToAvailableItems = (source, destination) => {
    return (
      source.droppableId === "loadingListItems" &&
      destination.droppableId === "availableItems"
    );
  };

  const isMovingToLoadingList = (source, destination) => {
    return (
      source.droppableId === "availableItems" &&
      destination.droppableId === "loadingListItems"
    );
  };

  return handleDragEnd;
};

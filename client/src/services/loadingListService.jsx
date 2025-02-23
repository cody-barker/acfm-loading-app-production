const createLoadingList = async (copyFormData, signal) => {
  const response = await fetch("/api/loading_lists", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(copyFormData),
    signal,
  });

  const data = await response.json();

  if (!response.ok) {
    throw data; // This will contain your errors array for 422 responses
  }

  return data;
};

const createLoadingListItem = async (item, signal) => {
  const response = await fetch("/api/loading_list_items", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item),
    signal,
  });

  const data = await response.json();

  if (!response.ok) {
    throw data;
  }

  return data;
};

export const loadingListService = {
  deleteList: async (id, signal) => {
    const response = await fetch(`/api/loading_lists/${id}`, {
      method: "DELETE",
      signal,
    });

    if (!response.ok) {
      throw new Error("Failed to delete loading list");
    }

    return response;
  },

  submitListCopy: async (copyFormData, loadingListItems, signal) => {
    // Create new list
    const newList = await createLoadingList(copyFormData, signal);

    // Prepare all items for the new list
    const newLoadingListItems = loadingListItems.map((loadingListItem) => ({
      ...loadingListItem,
      loading_list_id: newList.id,
    }));

    // Create all items
    const createdItems = await Promise.all(
      newLoadingListItems.map((item) => createLoadingListItem(item, signal))
    );

    // Return the complete list with its items
    return {
      ...newList,
      loading_list_items: createdItems,
    };
  },

  updateListDetails: async (editForm, id, signal) => {
    const response = await fetch(`/api/loading_lists/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(editForm),
      signal,
    });

    const data = await response.json();

    if (!response.ok) {
      throw data; // This will contain your errors array for 422 responses
    }

    return data;
  },

  /**
   * Updates the quantity of an item
   * @param {number} itemId - The ID of the item to update
   * @param {number} newQuantity - The new quantity value
   * @param {AbortSignal} signal - The abort controller signal
   * @returns {Promise<Object>} The updated item
   */
  updateItemQuantity: async (itemId, newQuantity, signal) => {
    const response = await fetch(`/api/items/${itemId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        quantity: newQuantity,
      }),
      signal,
    });

    const data = await response.json();

    if (!response.ok) {
      throw data;
    }

    return data;
  },

  createLoadingListItem: async (
    loadingListId,
    itemId,
    signal,
    quantity = 1
  ) => {
    const response = await fetch("/api/loading_list_items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        loading_list_id: loadingListId,
        item_id: itemId,
        quantity,
      }),
      signal,
    });

    const data = await response.json();
    if (!response.ok) {
      throw data;
    }
    return data;
  },

  updateLoadingListItemQuantity: async (
    loadingListItemId,
    newQuantity,
    signal
  ) => {
    const response = await fetch(
      `/api/loading_list_items/${loadingListItemId}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: newQuantity }),
        signal,
      }
    );

    const data = await response.json();
    if (!response.ok) {
      throw data;
    }
    return data;
  },

  deleteLoadingListItem: async (loadingListItemId, signal) => {
    const response = await fetch(
      `/api/loading_list_items/${loadingListItemId}`,
      {
        method: "DELETE",
        signal,
      }
    );

    if (!response.ok) {
      throw new Error("Failed to delete loading list item");
    }
  },
};

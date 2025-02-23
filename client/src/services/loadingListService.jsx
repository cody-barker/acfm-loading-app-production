const createLoadingList = async (copyFormData) => {
  const response = await fetch("/api/loading_lists", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(copyFormData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw data; // This will contain your errors array for 422 responses
  }

  return data;
};

const createLoadingListItem = async (item) => {
  const response = await fetch("/api/loading_list_items", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item),
  });

  const data = await response.json();

  if (!response.ok) {
    throw data;
  }

  return data;
};

export const loadingListService = {
  deleteList: async (id) => {
    const response = await fetch(`/api/loading_lists/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete loading list");
    }

    return response;
  },

  submitListCopy: async (copyFormData, loadingListItems) => {
    // Create new list
    const newList = await createLoadingList(copyFormData);

    // Prepare all items for the new list
    const newLoadingListItems = loadingListItems.map((loadingListItem) => ({
      ...loadingListItem,
      loading_list_id: newList.id,
    }));

    // Create all items
    const createdItems = await Promise.all(
      newLoadingListItems.map((item) => createLoadingListItem(item))
    );

    // Return the complete list with its items
    return {
      ...newList,
      loading_list_items: createdItems,
    };
  },

  updateListDetails: async (editForm, id) => {
    const response = await fetch(`/api/loading_lists/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(editForm),
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
   * @returns {Promise<Object>} The updated item
   */
  updateItemQuantity: async (itemId, newQuantity) => {
    const response = await fetch(`/api/items/${itemId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        quantity: newQuantity,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw data;
    }

    return data;
  },
};

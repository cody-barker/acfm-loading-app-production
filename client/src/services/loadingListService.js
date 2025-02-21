export const loadingListService = {
  deleteList: async (id) => {
    return fetch(`/api/loading_lists/${id}`, {
      method: "DELETE",
    });
  },

  submitListCopy: async (copyFormData, loadingListItems) => {
    try {
      // Create new list
      const listResponse = await fetch("/api/loading_lists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(copyFormData),
      });

      if (!listResponse.ok) {
        throw new Error(`Failed to create list: ${listResponse.statusText}`);
      }

      const newList = await listResponse.json();

      // Prepare all items for the new list
      const newLoadingListItems = loadingListItems.map((loadingListItem) => ({
        ...loadingListItem,
        loading_list_id: newList.id,
      }));

      // Create all items
      const itemPromises = newLoadingListItems.map((loadingListItem) =>
        fetch("/api/loading_list_items", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(loadingListItem),
        })
      );

      const itemResponses = await Promise.all(itemPromises);

      // Check if any item creation failed
      const failedItems = itemResponses.filter((response) => !response.ok);
      if (failedItems.length > 0) {
        throw new Error(`Failed to create ${failedItems.length} items`);
      }

      // Instead of fetching the complete list again, construct it locally
      const createdItems = await Promise.all(
        itemResponses.map((response) => response.json())
      );

      // Return the complete list with its items
      return {
        ...newList,
        loading_list_items: createdItems,
      };
    } catch (error) {
      throw new Error(`Error copying list: ${error.message}`);
    }
  },
};

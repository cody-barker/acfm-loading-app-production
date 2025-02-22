import { settlePromise } from "../utils/helpers";

const createLoadingList = async (copyFormData) => {
  const [response, error] = await settlePromise(
    fetch("/api/loading_lists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(copyFormData),
    })
  );

  if (error) {
    throw error;
  }

  const data = await response.json();

  if (!response.ok) {
    throw data;
  }

  return data;
};

const createLoadingListItem = async (item) => {
  const [response, error] = await settlePromise(
    fetch("/api/loading_list_items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item),
    })
  );

  if (error) {
    console.error("Network error:", error);
    throw error;
  }

  const data = await response.json();

  if (!response.ok) {
    console.error("API error:", data);
    throw data;
  }

  return data;
};

export const loadingListService = {
  deleteList: async (id) => {
    const [response, error] = await settlePromise(
      fetch(`/api/loading_lists/${id}`, {
        method: "DELETE",
      })
    );

    if (error || !response.ok) {
      console.error("Delete error:", error || response.statusText);
      throw error || new Error("Failed to delete loading list");
    }

    return response;
  },

  submitListCopy: async (copyFormData, loadingListItems) => {
    try {
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
    } catch (error) {
      throw error;
    }
  },
};

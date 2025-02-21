export const loadingListService = {
  deleteList: async (id) => {
    await fetch(`/api/loading_lists/${id}`, {
      method: "DELETE",
    });
  },
};

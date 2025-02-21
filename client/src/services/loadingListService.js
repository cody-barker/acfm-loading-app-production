export const loadingListService = {
  deleteList: async (id) => {
    fetch(`/api/loading_lists/${id}`, {
      method: "DELETE",
    });
  },


};

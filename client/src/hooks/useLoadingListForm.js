import { useState, useEffect } from "react";

export const useLoadingListForm = (user, loadingListDetails = null) => {
  const [editForm, setEditForm] = useState({
    site_name: "",
    date: "",
    return_date: "",
    notes: "",
    team_id: "",
    user_id: user.id,
  });

  useEffect(() => {
    if (loadingListDetails) {
      setEditForm({
        site_name: loadingListDetails.site_name,
        date: loadingListDetails.date,
        return_date: loadingListDetails.return_date,
        notes: loadingListDetails.notes,
        team_id: loadingListDetails.team_id,
        user_id: user.id,
      });
    }
  }, [loadingListDetails]);

  return [editForm, setEditForm];
};

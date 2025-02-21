import { useState, useEffect } from "react";

export const useEditLoadingListDetailsForm = (user, loadingListDetails = null) => {
  const [loadingListDetailsFormData, setLoadingListDetailsFormData] =
    useState({
      site_name: "",
      date: "",
      return_date: "",
      notes: "",
      team_id: "",
      user_id: user.id,
    });

  useEffect(() => {
    if (loadingListDetails) {
      setLoadingListDetailsFormData({
        site_name: loadingListDetails.site_name || "",
        date: loadingListDetails.date || "",
        return_date: loadingListDetails.return_date || "",
        notes: loadingListDetails.notes || "",
        team_id: loadingListDetails.team_id || "",
        user_id: user.id,
      });
    }
  }, [loadingListDetails, user.id]);

  return [loadingListDetailsFormData, setLoadingListDetailsFormData];
};

import { useState } from "react";

export const useLoadingListCopy = (user, editForm) => {
  const [copyDialogOpen, setCopyDialogOpen] = useState(false);
  const [copyFormData, setCopyFormData] = useState({
    site_name: "",
    date: "",
    return_date: "",
    notes: "",
    team_id: "",
    user_id: user.id,
  });

  const handleCopy = () => {
    setCopyFormData({
      ...editForm,
      date: "",
      return_date: "",
    });
    setCopyDialogOpen(true);
  };

  return {
    copyDialogOpen,
    setCopyDialogOpen,
    copyFormData,
    setCopyFormData,
    handleCopy,
  };
};

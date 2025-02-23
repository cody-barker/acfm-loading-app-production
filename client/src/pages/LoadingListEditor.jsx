import { useParams, useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import { DragDropContext } from "react-beautiful-dnd";
import { Box, Container } from "@mui/material";
import { ItemsContext } from "../contexts/ItemsContext";
import { LoadingListsContext } from "../contexts/LoadingListsContext";
import { UserContext } from "../contexts/UserContext";
import { TeamsContext } from "../contexts/TeamsContext";
import { AvailableItems } from "../components/LoadingListEditor/AvailableItems";
import {
  getItemIdFromDraggable,
  settlePromise,
  calculateReturningQuantity,
} from "../utils/helpers";
import { useLoadingListForm } from "../hooks/useLoadingListForm";
import LoadingListHeader from "../components/LoadingListEditor/LoadingListHeader";
import LoadingListDialog from "../components/LoadingListEditor/LoadingListDialog";
import LoadingListItems from "../components/LoadingListEditor/LoadingListItems";
import ToggleButton from "../components/LoadingListEditor/ToggleButton";
import CopyListDialog from "../components/LoadingListEditor/CopyListDialog";
import Error from "../components/Error";
import "../styles/LoadingListEditor.css";
import { useLoadingListOperations } from "../hooks/useLoadingListOperations";
import { useLoadingListDragAndDrop } from "../hooks/useLoadingListDragAndDrop";

const LoadingListEditor = () => {
  let { id } = useParams();
  id = parseInt(id);

  const { items, setItems } = useContext(ItemsContext);
  const { loadingLists, setLoadingLists } = useContext(LoadingListsContext);
  const { teams } = useContext(TeamsContext);
  const { user } = useContext(UserContext);

  let loadingList = loadingLists.find((loadingList) => loadingList.id === id);
  const [isExpanded, setIsExpanded] = useState(true);
  const [openEditForm, setOpenEditForm] = useState(false);
  const [copyDialogOpen, setCopyDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [editForm, setEditForm] = useLoadingListForm(user, loadingList);
  const [copyFormData, setCopyFormData] = useState({
    site_name: "",
    date: "",
    return_date: "",
    notes: "",
    team_id: "",
    user_id: user.id,
  });
  const {
    error,
    setError,
    copyError,
    setCopyError,
    handleDelete,
    handleCopySubmit,
    handleSubmit,
    decreaseItemQuantity,
    increaseItemQuantity,
    increaseLoadingListItemQuantity,
    decreaseLoadingListItemQuantity,
    handleAddToLoadingList,
    handleRemoveFromLoadingList,
  } = useLoadingListOperations(
    loadingList,
    loadingLists,
    setLoadingLists,
    setItems,
    setCopyDialogOpen,
    setOpenEditForm,
    setEditForm,
    items
  );

  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const formattedTomorrow = tomorrow.toISOString().split("T")[0];

  if (!loadingList) {
    return <div></div>;
  }

  const handleCopy = () => {
    setCopyFormData({
      ...editForm,
      date: "",
      return_date: "",
    });
    setCopyDialogOpen(true);
  };

  const returningTodayCount = (itemId) =>
    calculateReturningQuantity(itemId, loadingLists, today);

  const onDragEnd = useLoadingListDragAndDrop(
    handleAddToLoadingList,
    handleRemoveFromLoadingList,
    setError
  );

  // const onDragEnd = async (result) => {
  //   const { source, destination } = result;

  //   // If there's no destination, or the item was dropped in its original location
  //   if (
  //     !destination ||
  //     (source.droppableId === destination.droppableId &&
  //       source.index === destination.index)
  //   ) {
  //     return;
  //   }

  //   // Moving from loading list to available items
  //   if (
  //     source.droppableId === "loadingListItems" &&
  //     destination.droppableId === "availableItems"
  //   ) {
  //     await handleRemoveFromLoadingList(source.index);
  //   }

  //   // Moving from available items to loading list
  //   if (
  //     source.droppableId === "availableItems" &&
  //     destination.droppableId === "loadingListItems"
  //   ) {
  //     const itemId = getItemIdFromDraggable(result.draggableId);
  //     if (itemId === null) {
  //       setError("Invalid item ID");
  //       return;
  //     }
  //     await handleAddToLoadingList(itemId);
  //   }
  // };

  return (
    <Container maxWidth="xl">
      <LoadingListHeader
        loadingList={loadingList}
        handleDelete={handleDelete}
        handleEdit={() => setOpenEditForm(true)}
        handleCopy={handleCopy}
        error={error}
        today={today}
        formattedTomorrow={formattedTomorrow}
      />
      <LoadingListDialog
        openEditForm={openEditForm}
        onClose={() => setOpenEditForm(false)}
        formData={editForm}
        setFormData={setEditForm}
        handleSubmit={(e) => {
          e.preventDefault();
          handleSubmit(editForm);
        }}
        handleDelete={handleDelete}
        teams={teams}
      />
      <CopyListDialog
        copyDialogOpen={copyDialogOpen}
        setCopyDialogOpen={setCopyDialogOpen}
        copyFormData={copyFormData}
        setCopyFormData={setCopyFormData}
        handleCopySubmit={() => handleCopySubmit(copyFormData)}
        teams={teams}
        copyError={copyError}
        setCopyError={setCopyError}
      />
      <DragDropContext onDragEnd={onDragEnd}>
        <Box
          className="loading-list-editor"
          sx={{
            display: "flex",
            flexDirection: "row",
            maxWidth: "1100px",
            margin: "auto",
            paddingRight: 4,
            paddingLeft: 4,
          }}
        >
          <AvailableItems
            isExpanded={isExpanded}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            returningTodayCount={returningTodayCount}
            items={items}
          />
          <ToggleButton isExpanded={isExpanded} setIsExpanded={setIsExpanded} />
          <LoadingListItems
            loadingList={loadingList}
            decreaseLoadingListItemQuantity={decreaseLoadingListItemQuantity}
            increaseLoadingListItemQuantity={increaseLoadingListItemQuantity}
          />
        </Box>
      </DragDropContext>
    </Container>
  );
};

export { LoadingListEditor as default };

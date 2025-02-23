import { useParams } from "react-router-dom";
import { useContext, useState } from "react";
import { DragDropContext } from "react-beautiful-dnd";
import { Box, Container } from "@mui/material";
import { ItemsContext } from "../contexts/ItemsContext";
import { LoadingListsContext } from "../contexts/LoadingListsContext";
import { UserContext } from "../contexts/UserContext";
import { TeamsContext } from "../contexts/TeamsContext";
import { AvailableItems } from "../components/LoadingListEditor/AvailableItems";
import { calculateReturningQuantity } from "../utils/helpers";
import { useLoadingListForm } from "../hooks/useLoadingListForm";
import { useLoadingListOperations } from "../hooks/useLoadingListOperations";
import { useLoadingListDragAndDrop } from "../hooks/useLoadingListDragAndDrop";
import { useLoadingListDates } from "../hooks/useLoadingListDates";
import { useLoadingListCopy } from "../hooks/useLoadingListCopy";
import LoadingListHeader from "../components/LoadingListEditor/LoadingListHeader";
import LoadingListDialog from "../components/LoadingListEditor/LoadingListDialog";
import LoadingListItems from "../components/LoadingListEditor/LoadingListItems";
import ToggleButton from "../components/LoadingListEditor/ToggleButton";
import CopyListDialog from "../components/LoadingListEditor/CopyListDialog";
import "../styles/LoadingListEditor.css";

const LoadingListEditor = () => {
  let { id } = useParams();
  id = parseInt(id);

  const { items, setItems } = useContext(ItemsContext);
  const { loadingLists, setLoadingLists } = useContext(LoadingListsContext);
  const { teams } = useContext(TeamsContext);
  const { user } = useContext(UserContext);

  let loadingList = loadingLists.find((loadingList) => loadingList.id === id);

  const { today, formattedTomorrow } = useLoadingListDates();
  const [isExpanded, setIsExpanded] = useState(true);
  const [openEditForm, setOpenEditForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [editForm, setEditForm] = useLoadingListForm(user, loadingList);

  const {
    copyDialogOpen,
    setCopyDialogOpen,
    copyFormData,
    setCopyFormData,
    handleCopy,
  } = useLoadingListCopy(user, editForm);

  const {
    error,
    setError,
    copyError,
    setCopyError,
    handleDelete,
    handleCopySubmit,
    handleSubmit,
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

  const returningTodayCount = (itemId) =>
    calculateReturningQuantity(itemId, loadingLists, today);

  const onDragEnd = useLoadingListDragAndDrop(
    handleAddToLoadingList,
    handleRemoveFromLoadingList,
    setError
  );

  if (!loadingList) {
    return <div></div>;
  }

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
        error={error}
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

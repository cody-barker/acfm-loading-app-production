import { useParams, useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import { DragDropContext } from "react-beautiful-dnd";
import { Box, Container } from "@mui/material";
import { ItemsContext } from "../contexts/ItemsContext";
import { LoadingListsContext } from "../contexts/LoadingListsContext";
import { UserContext } from "../contexts/UserContext";
import { TeamsContext } from "../contexts/TeamsContext";
import { AvailableItems } from "../components/LoadingListEditor/AvailableItems";
import { getItemIdFromDraggable, settlePromise } from "../utils/helpers";
import { useLoadingListForm } from "../hooks/useLoadingListForm";
import LoadingListHeader from "../components/LoadingListEditor/LoadingListHeader";
import LoadingListDialog from "../components/LoadingListEditor/LoadingListDialog";
import LoadingListItems from "../components/LoadingListEditor/LoadingListItems";
import ToggleButton from "../components/LoadingListEditor/ToggleButton";
import CopyListDialog from "../components/LoadingListEditor/CopyListDialog";
import Error from "../components/Error";
import "../styles/LoadingListEditor.css";
import { useLoadingListOperations } from "../hooks/useLoadingListOperations";

function LoadingListEditor() {
  const navigate = useNavigate();
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
  const [editForm, setEditForm] = useLoadingListForm(user, null);
  const { error, setError, copyError, setCopyError, handleDelete } = useLoadingListOperations(loadingList, setLoadingLists, setItems);

  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const formattedTomorrow = tomorrow.toISOString().split("T")[0];

  const [copyFormData, setCopyFormData] = useState({
    site_name: "",
    date: "",
    return_date: "",
    notes: "",
    team_id: "",
    user_id: user.id,
  });


  if (!loadingList) {
    return <div></div>;
  }

  const handleCopyList = () => {
    setCopyFormData({
      ...editForm,
      date: "",
      return_date: "",
    });
    setCopyDialogOpen(true);
  };

  const handleCopySubmit = async (e) => {
    e.preventDefault();
    try {
      // Create new loading list
      const response = await fetch("/api/loading_lists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(copyFormData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw errorData;
      }

      const newList = await response.json();
      setCopyError(null);

      // Copy all loading list items to the new list
      const copyPromises = loadingList.loading_list_items.map((item) =>
        fetch("/api/loading_list_items", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            loading_list_id: newList.id,
            item_id: item.item_id,
            quantity: item.quantity,
          }),
        })
      );

      // Wait for all items to be created
      await Promise.all(copyPromises);

      // Fetch the complete list with items
      const updatedListResponse = await fetch(
        `/api/loading_lists/${newList.id}`
      );
      const updatedList = await updatedListResponse.json();

      // Add team association
      const selectedTeam = teams.find(
        (team) => team.id === copyFormData.team_id
      );
      const listWithTeam = {
        ...updatedList,
        team: selectedTeam,
      };

      setLoadingLists((prev) => [...prev, listWithTeam]);
      setCopyDialogOpen(false);
      navigate(`/loading-lists/${listWithTeam.id}`);
    } catch (error) {
      console.error("Error copying loading list:", error);
      setCopyError(error.errors || "An unexpected error occurred");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const [response, error] = await settlePromise(
      fetch(`/api/loading_lists/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editForm),
      })
    );

    if (error) return console.error("Error submitting loading list:", error);

    const updatedList = await response.json();
    setLoadingLists(
      loadingLists.map((list) => (list.id === id ? updatedList : list))
    );
    setOpenEditForm(false);
  };

  const returningTodayCount = (itemId) => {
    let totalReturningQuantity = 0;

    loadingLists.forEach((list) => {
      const item = list.loading_list_items.find(
        (loadingListItem) =>
          loadingListItem.item_id === itemId && list.return_date === today
      );
      if (item) {
        totalReturningQuantity += item.quantity;
      }
    });

    return totalReturningQuantity;
  };

  const decreaseItemQuantity = async (item) => {
    const [response, error] = await settlePromise(
      fetch(`/api/items/${item.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quantity: item.quantity - 1,
        }),
      })
    );

    if (error) return console.error("Error decreasing item quantity:", error);

    const updatedItem = await response.json();
    setItems((prev) =>
      prev.map((i) =>
        i.id === updatedItem.id ? { ...i, quantity: updatedItem.quantity } : i
      )
    );
  };

  const increaseItemQuantity = async (item) => {
    const [response, error] = await settlePromise(
      fetch(`/api/items/${item.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quantity: item.quantity + 1,
        }),
      })
    );

    if (error) return console.error("Error increasing item quantity:", error);

    const updatedItem = await response.json();
    setItems((prev) =>
      prev.map((i) =>
        i.id === updatedItem.id ? { ...i, quantity: updatedItem.quantity } : i
      )
    );
  };

  const createLoadingListItem = async (item) => {
    const [response, error] = await settlePromise(
      fetch("/api/loading_list_items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          loading_list_id: id,
          item_id: item.id,
          quantity: 1,
        }),
      })
    );

    if (error) return console.error("Error creating loading list item:", error);

    const newLoadingListItem = await response.json();

    setLoadingLists((prev) =>
      prev.map((list) =>
        list.id === newLoadingListItem.loading_list_id
          ? {
              ...list,
              loading_list_items: [
                ...list.loading_list_items,
                newLoadingListItem,
              ],
            }
          : list
      )
    );

    decreaseItemQuantity(item);
  };

  const increaseLoadingListItemQuantity = async (loadingListItem) => {
    const [response, error] = await settlePromise(
      fetch(`/api/loading_list_items/${loadingListItem.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quantity: loadingListItem.quantity + 1,
        }),
      })
    );

    if (error)
      return console.error(
        "Error increasing loading list item quantity:",
        error
      );

    const updatedItem = await response.json();
    setLoadingLists((prev) =>
      prev.map((list) =>
        list.id === loadingListItem.loading_list_id
          ? {
              ...list,
              loading_list_items: list.loading_list_items.map((item) =>
                item.id === updatedItem.id
                  ? { ...item, quantity: updatedItem.quantity }
                  : item
              ),
            }
          : list
      )
    );
    decreaseItemQuantity(updatedItem.item);
  };

  const decreaseLoadingListItemQuantity = async (loadingListItem) => {
    // If quantity is 1, delete the item instead of decreasing
    if (loadingListItem.quantity === 1) {
      try {
        // Just delete the loading list item, don't call increaseItemQuantity here
        // as deleteLoadingListItem will handle updating the item quantity
        await deleteLoadingListItem(loadingListItem.id);
        return;
      } catch (error) {
        console.error("Error deleting loading list item:", error);
        return;
      }
    }

    const [response, error] = await settlePromise(
      fetch(`/api/loading_list_items/${loadingListItem.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quantity: loadingListItem.quantity - 1,
        }),
      })
    );

    if (error) {
      console.error("Error decreasing loading list item quantity:", error);
      return;
    }

    const updatedItem = await response.json();
    setLoadingLists((prev) =>
      prev.map((list) =>
        list.id === loadingListItem.loading_list_id
          ? {
              ...list,
              loading_list_items: list.loading_list_items.map((item) =>
                item.id === updatedItem.id
                  ? { ...item, quantity: updatedItem.quantity }
                  : item
              ),
            }
          : list
      )
    );
    increaseItemQuantity(updatedItem.item);
  };

  const findLoadingListItemById = (id) =>
    loadingList.loading_list_items.find((item) => item.id === id);

  const deleteLoadingListItem = async (id) => {
    const loadingListItem = findLoadingListItemById(id);
    if (!loadingListItem) {
      console.error("Loading list item not found:", id);
      return false;
    }

    try {
      const response = await fetch(`/api/loading_list_items/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete item");
      }

      removeItemFromLoadingList(
        loadingList.loading_list_items.findIndex((item) => item.id === id)
      );
      returnLoadingListItemToAvailableItems(
        loadingListItem.item_id,
        loadingListItem.quantity
      );

      return true;
    } catch (error) {
      console.error("Error deleting loading list item:", error);
      setError("Failed to delete item. Please try again.");
      return false;
    }
  };

  const removeItemFromLoadingList = (sourceIndex) => {
    setLoadingLists((prev) =>
      prev.map((list) =>
        list.id === loadingList.id
          ? {
              ...list,
              loading_list_items: list.loading_list_items.filter(
                (_, index) => index !== sourceIndex
              ),
            }
          : list
      )
    );
  };

  const returnLoadingListItemToAvailableItems = (itemId, quantity) => {
    setItems((prev) =>
      prev.map((availableItem) =>
        availableItem.id === itemId
          ? {
              ...availableItem,
              quantity: availableItem.quantity + quantity,
            }
          : availableItem
      )
    );
  };

  const handleRemoveFromLoadingList = async (sourceIndex) => {
    const item = loadingList.loading_list_items[sourceIndex];
    if (!item) return false;

    try {
      const response = await fetch(`/api/loading_list_items/${item.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete item");
      }

      removeItemFromLoadingList(sourceIndex);
      returnLoadingListItemToAvailableItems(item.item_id, item.quantity);
      setError(null);

      return true;
    } catch (error) {
      console.error("Error deleting loading list item:", error);
      setError("Failed to move item. Please try again.");
      return false;
    }
  };

  const handleAddToLoadingList = async (draggedItemId) => {
    const item = items.find((i) => i.id === draggedItemId);

    if (!item) {
      setError("Error: Item not found.");
      return false;
    }

    const itemExists = loadingList.loading_list_items.some(
      (loadingListItem) => loadingListItem.item_id === item.id
    );

    if (itemExists) {
      setError("This item is already on the loading list.");
      return false;
    }

    setError(null);
    return await createLoadingListItem(item);
  };

  const onDragEnd = async (result) => {
    const { source, destination } = result;

    // If there's no destination, or the item was dropped in its original location
    if (
      !destination ||
      (source.droppableId === destination.droppableId &&
        source.index === destination.index)
    ) {
      return;
    }

    // Moving from loading list to available items
    if (
      source.droppableId === "loadingListItems" &&
      destination.droppableId === "availableItems"
    ) {
      await handleRemoveFromLoadingList(source.index);
    }

    // Moving from available items to loading list
    if (
      source.droppableId === "availableItems" &&
      destination.droppableId === "loadingListItems"
    ) {
      const itemId = getItemIdFromDraggable(result.draggableId);
      if (itemId === null) {
        setError("Invalid item ID");
        return;
      }
      await handleAddToLoadingList(itemId, destination.index);
    }
  };

  return (
    <Container maxWidth="xl">
      <LoadingListHeader
        loadingList={loadingList}
        handleDelete={handleDelete}
        handleEdit={() => setOpenEditForm(true)}
        handleCopy={handleCopyList}
        error={error}
        today={today}
        formattedTomorrow={formattedTomorrow}
      />
      {/* Edit Dialog */}
      <LoadingListDialog
        openEditForm={openEditForm}
        onClose={() => setOpenEditForm(false)}
        formData={editForm}
        setFormData={setEditForm}
        handleSubmit={handleSubmit}
        handleDelete={handleDelete}
        teams={teams}
      />
      {/* Copy List Dialog */}
      <CopyListDialog
        copyDialogOpen={copyDialogOpen}
        setCopyDialogOpen={setCopyDialogOpen}
        copyFormData={copyFormData}
        setCopyFormData={setCopyFormData}
        handleCopySubmit={handleCopySubmit}
        teams={teams}
        loadingList={loadingList}
        setLoadingLists={setLoadingLists}
        navigate={navigate}
        formData={editForm}
        setFormData={setEditForm}
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
}

export default LoadingListEditor;

import { useParams, useNavigate } from "react-router-dom";
import { useContext, useState, useEffect } from "react";
import { DragDropContext } from "react-beautiful-dnd";
import { Box, Container } from "@mui/material";
import { ItemsContext } from "../contexts/ItemsContext";
import { LoadingListsContext } from "../contexts/LoadingListsContext";
import { format } from "date-fns";
import { UserContext } from "../contexts/UserContext";
import { TeamsContext } from "../contexts/TeamsContext";
import Error from "../components/Error";
import LoadingListHeader from "../components/LoadingListEditor/LoadingListHeader";
import LoadingListDialog from "../components/LoadingListEditor/LoadingListDialog";
import LoadingListItems from "../components/LoadingListEditor/LoadingListItems";
import AvailableItems from "../components/LoadingListEditor/AvailableItems";
import ToggleButton from "../components/LoadingListEditor/ToggleButton";
import CopyListDialog from "../components/LoadingListEditor/CopyListDialog";
import "./LoadingListEditor.css";

function LoadingListEditor() {
  const navigate = useNavigate();
  const { id } = useParams();

  const { items, setItems } = useContext(ItemsContext);
  const { loadingLists, setLoadingLists } = useContext(LoadingListsContext);
  const { teams } = useContext(TeamsContext);
  const { user } = useContext(UserContext);

  const [isExpanded, setIsExpanded] = useState(true);
  const [open, setOpen] = useState(false);
  const [copyDialogOpen, setCopyDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [error, setError] = useState(null);
  const [copyError, setCopyError] = useState(null);

  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const formattedTomorrow = tomorrow.toISOString().split("T")[0];

  const [formData, setFormData] = useState({
    site_name: "",
    date: "",
    return_date: "",
    notes: "",
    team_id: "",
    user_id: user.id,
  });
  const [copyFormData, setCopyFormData] = useState({
    site_name: "",
    date: "",
    return_date: "",
    notes: "",
    team_id: "",
    user_id: user.id,
  });

  let loadingList = loadingLists.find(
    (loadingList) => loadingList.id === parseInt(id)
  );

  useEffect(() => {
    if (loadingList) {
      setFormData({
        site_name: loadingList.site_name || "",
        date: loadingList.date || "",
        return_date: loadingList.return_date || "",
        notes: loadingList.notes || "",
        team_id: loadingList.team_id || "",
        user_id: user.id,
      });
    }
  }, [loadingList, user.id]);

  if (!loadingList) {
    return <div></div>;
  }

  const handleCopyList = () => {
    setCopyFormData({
      ...formData,
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

  const handleDelete = async (e) => {
    e.preventDefault();
    try {
      await fetch(`/api/loading_lists/${parseInt(id)}`, {
        method: "DELETE",
      });

      setLoadingLists((prevLists) =>
        prevLists.filter((list) => list.id !== parseInt(id))
      );

      const [itemsResponse, itemsError] = await settlePromise(
        fetch("/api/items")
      );

      if (itemsError)
        return console.error("Error fetching updated items:", itemsError);

      const updatedItems = await itemsResponse.json();
      setItems(updatedItems);
      navigate("/");
    } catch (error) {
      console.error("Error deleting loading list:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const [response, error] = await settlePromise(
      fetch(`/api/loading_lists/${parseInt(id)}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })
    );

    if (error) return console.error("Error submitting loading list:", error);

    const updatedList = await response.json();
    setLoadingLists(
      loadingLists.map((list) =>
        list.id === parseInt(id) ? updatedList : list
      )
    );
    setOpen(false);
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

  const settlePromise = (promise) =>
    Promise.allSettled([promise]).then(([{ value, reason }]) => [
      value,
      reason,
    ]);

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
          loading_list_id: parseInt(id),
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

  const deleteLoadingListItem = async (id) => {
    try {
      // Find the loading list item before deleting it
      const loadingListItem = loadingList.loading_list_items.find(
        (item) => item.id === id
      );

      await fetch(`/api/loading_list_items/${id}`, { method: "DELETE" });

      // If we reach here, the delete was successful
      setLoadingLists((prev) =>
        prev.map((list) =>
          list.id === loadingList.id
            ? {
                ...list,
                loading_list_items: list.loading_list_items.filter(
                  (item) => item.id !== id
                ),
              }
            : list
        )
      );

      // Update the available item quantity
      if (loadingListItem) {
        setItems((prev) =>
          prev.map((item) =>
            item.id === loadingListItem.item_id
              ? { ...item, quantity: item.quantity + loadingListItem.quantity }
              : item
          )
        );
      }
    } catch (error) {
      console.error("Error deleting loading list item:", error);
    }
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

    if (
      source.droppableId === "loadingListItems" &&
      destination.droppableId === "availableItems"
    ) {
      const item = loadingList.loading_list_items[source.index];
      if (!item) return; // Guard against undefined item

      setError(null);

      try {
        // First delete the item from the API
        const response = await fetch(`/api/loading_list_items/${item.id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Failed to delete item");
        }

        // Then update both states together
        setLoadingLists((prev) =>
          prev.map((list) =>
            list.id === loadingList.id
              ? {
                  ...list,
                  loading_list_items: list.loading_list_items.filter(
                    (_, index) => index !== source.index
                  ),
                }
              : list
          )
        );

        setItems((prev) =>
          prev.map((availableItem) =>
            availableItem.id === item.item_id
              ? {
                  ...availableItem,
                  quantity: availableItem.quantity + item.quantity,
                }
              : availableItem
          )
        );
      } catch (error) {
        console.error("Error deleting loading list item:", error);
        setError("Failed to move item. Please try again.");
      }
    }

    if (
      source.droppableId === "availableItems" &&
      destination.droppableId === "loadingListItems"
    ) {
      const draggedItemId = parseInt(result.draggableId, 10);
      const item = items.find((i) => i.id === draggedItemId);

      if (!item) {
        setError("Error: Item not found.");
        return;
      }

      const itemExists = loadingList.loading_list_items.some(
        (loadingListItem) => loadingListItem.item_id === item.id
      );

      if (itemExists) {
        setError("This item is already on the loading list.");
        return;
      }

      setError(null);
      await createLoadingListItem(item);
    }
  };

  return (
    <Container maxWidth="xl">
      <LoadingListHeader
        loadingList={loadingList}
        handleDelete={handleDelete}
        handleEdit={() => setOpen(true)}
        handleCopy={handleCopyList}
        error={error}
        today={today}
        formattedTomorrow={formattedTomorrow}
      />
      {/* Edit Dialog */}
      <LoadingListDialog
        open={open}
        handleClose={() => setOpen(false)}
        formData={formData}
        setFormData={setFormData}
        handleSubmit={handleSubmit}
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
        formData={formData}
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

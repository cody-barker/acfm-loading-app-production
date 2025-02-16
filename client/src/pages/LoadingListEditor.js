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
  const [selectedCategory, setSelectedCategory] = useState("");
  const [error, setError] = useState(null);

  const uniqueCategories = [...new Set(items.map((item) => item.category))];
  const filteredItems = selectedCategory
    ? items.filter((item) => item.category === selectedCategory)
    : items;

  const today = format(new Date(), "yyyy-MM-dd");

  let loadingList = loadingLists.find(
    (loadingList) => loadingList.id === parseInt(id)
  );

  const [formData, setFormData] = useState({
    site_name: "",
    date: "",
    return_date: "",
    notes: "",
    team_id: "",
    user_id: user.id,
  });

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

    if (error)
      return console.error(
        "Error decreasing loading list item quantity:",
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
    increaseItemQuantity(updatedItem.item);
  };

  const deleteLoadingListItem = async (id) => {
    try {
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
    } catch (error) {
      console.error("Error deleting loading list item:", error);
    }
  };

  const onDragEnd = (result) => {
    const { source, destination } = result;

    if (!destination) return;

    if (
      source.droppableId === "loadingListItems" &&
      destination.droppableId === "availableItems"
    ) {
      const item = loadingList.loading_list_items[source.index];
      setError(null);
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

      deleteLoadingListItem(item.id);
    }

    if (
      source.droppableId === "availableItems" &&
      destination.droppableId === "loadingListItems"
    ) {
      const draggedItemId = parseInt(result.draggableId, 10); // Get ID from draggableId
      const item = items.find((i) => i.id === draggedItemId); // Find item by ID

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
      createLoadingListItem(item);
    }
  };

  return (
    <>
      <Container>
        <LoadingListHeader
          loadingList={loadingList}
          onOpenDialog={() => setOpen(true)}
        />

        <LoadingListDialog
          open={open}
          onClose={() => setOpen(false)}
          formData={formData}
          setFormData={setFormData}
          teams={teams}
          handleSubmit={handleSubmit}
          handleDelete={handleDelete}
        />

        {error ? <Error error={error} /> : null}
      </Container>

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
            uniqueCategories={uniqueCategories}
            filteredItems={filteredItems}
            returningTodayCount={returningTodayCount}
          />
          <ToggleButton isExpanded={isExpanded} setIsExpanded={setIsExpanded} />
          <LoadingListItems
            loadingList={loadingList}
            decreaseLoadingListItemQuantity={decreaseLoadingListItemQuantity}
            increaseLoadingListItemQuantity={increaseLoadingListItemQuantity}
          />
        </Box>
      </DragDropContext>
    </>
  );
}

export default LoadingListEditor;

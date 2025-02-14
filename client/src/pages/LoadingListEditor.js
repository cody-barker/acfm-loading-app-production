import { useParams, useNavigate } from "react-router-dom";
import { useContext, useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import {
  Box,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
  Button,
  Container,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
} from "@mui/material";
import { ItemsContext } from "../contexts/ItemsContext";
import { LoadingListsContext } from "../contexts/LoadingListsContext";
import { format, addDays } from "date-fns";
import { UserContext } from "../contexts/UserContext";
import { TeamsContext } from "../contexts/TeamsContext";
import Error from "../components/Error";
import "./LoadingListEditor.css";
import LoadingListHeader from "../components/LoadingListEditor/LoadingListHeader";
import LoadingListDialog from "../components/LoadingListEditor/LoadingListDialog";

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
  const tomorrow = format(addDays(new Date(), 1), "yyyy-MM-dd");

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
      const response = await fetch(`/api/loading_lists/${parseInt(id)}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setLoadingLists((prevLists) =>
          prevLists.filter((list) => list.id !== parseInt(id))
        );

        const itemsResponse = await fetch("/api/items");
        if (itemsResponse.ok) {
          const updatedItems = await itemsResponse.json();
          setItems(updatedItems);
        }

        navigate("/");
      }
    } catch (error) {
      console.log("Error deleting loading list:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/loading_lists/${parseInt(id)}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const updatedList = await response.json();
        setLoadingLists(
          loadingLists.map((list) =>
            list.id === parseInt(id) ? updatedList : list
          )
        );
        setOpen(false);
      }
    } catch (error) {
      console.error("Error submitting loading list:", error);
    }
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
    try {
      const response = await fetch(`/api/items/${item.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quantity: item.quantity - 1,
        }),
      });
      const updatedItem = await response.json();
      setItems((prev) =>
        prev.map((i) =>
          i.id === updatedItem.id ? { ...i, quantity: updatedItem.quantity } : i
        )
      );
    } catch (error) {
      console.error("Error decreasing item quantity:", error);
    }
  };

  const increaseItemQuantity = async (item) => {
    try {
      const response = await fetch(`/api/items/${item.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quantity: item.quantity + 1,
        }),
      });
      const updatedItem = await response.json();
      setItems((prev) =>
        prev.map((i) =>
          i.id === updatedItem.id ? { ...i, quantity: updatedItem.quantity } : i
        )
      );
    } catch (error) {
      console.error("Error increasing item quantity:", error);
    }
  };

  const createLoadingListItem = async (item) => {
    try {
      const response = await fetch("/api/loading_list_items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          loading_list_id: parseInt(id),
          item_id: item.id,
          quantity: 1,
        }),
      });
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
    } catch (error) {
      console.error("Error creating loading list item:", error);
    }
  };

  const increaseLoadingListItemQuantity = async (loadingListItem) => {
    try {
      const response = await fetch(
        `/api/loading_list_items/${loadingListItem.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            loading_list_id: parseInt(id),
            item_id: loadingListItem.item_id,
            quantity: loadingListItem.quantity + 1,
          }),
        }
      );
      const updatedLoadingListItem = await response.json();

      setLoadingLists((prev) =>
        prev.map((list) =>
          list.id === updatedLoadingListItem.loading_list_id
            ? {
                ...list,
                loading_list_items: list.loading_list_items.map((item) =>
                  item.id === updatedLoadingListItem.id
                    ? updatedLoadingListItem
                    : item
                ),
              }
            : list
        )
      );
      decreaseItemQuantity(updatedLoadingListItem.item);
    } catch (error) {
      console.error("Error increasing loading list item quantity:", error);
    }
  };

  const decreaseLoadingListItemQuantity = async (loadingListItem) => {
    try {
      if (loadingListItem.quantity <= 1) {
        await fetch(`/api/loading_list_items/${loadingListItem.id}`, {
          method: "DELETE",
        });

        setLoadingLists((prev) =>
          prev.map((list) =>
            list.id === loadingList.id
              ? {
                  ...list,
                  loading_list_items: list.loading_list_items.filter(
                    (item) => item.id !== loadingListItem.id
                  ),
                }
              : list
          )
        );
        increaseItemQuantity(
          items.find((i) => i.id === loadingListItem.item_id)
        );
      } else {
        const response = await fetch(
          `/api/loading_list_items/${loadingListItem.id}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              quantity: loadingListItem.quantity - 1,
            }),
          }
        );
        const updatedLoadingListItem = await response.json();

        // Update the loading list state with the new quantity
        setLoadingLists((prev) =>
          prev.map((list) =>
            list.id === updatedLoadingListItem.loading_list_id
              ? {
                  ...list,
                  loading_list_items: list.loading_list_items.map((item) =>
                    item.id === updatedLoadingListItem.id
                      ? updatedLoadingListItem
                      : item
                  ),
                }
              : list
          )
        );

        increaseItemQuantity(
          items.find((i) => i.id === updatedLoadingListItem.item_id)
        );
      }
    } catch (error) {
      console.error("Error decreasing loading list item quantity:", error);
    }
  };

  const deleteLoadingListItem = async (id) => {
    try {
      await fetch(`/api/loading_list_items/${id}`, { method: "DELETE" });

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
      const item = items[source.index];
      const itemExists = loadingList.loading_list_items.some(
        (loadingListItem) => loadingListItem.item_id === item.id
      );
      if (itemExists) {
        setError("This item is already on the loading list.");
        return;
      }
      if (!itemExists) {
        setError(null);
      }

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

        {error ? <Error sx={{ paddingTop: 5 }} error={error} /> : null}
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
          {/* Available Items Column */}
          <Droppable droppableId="availableItems">
            {(provided) => (
              <Box
                ref={provided.innerRef}
                {...provided.droppableProps}
                sx={{
                  width: isExpanded ? "45%" : "0%",
                  transition: "width 0.3s ease",
                  backgroundColor: "#e0f7fa",
                  padding: isExpanded ? 2 : 0,
                  borderRadius: 2,
                  boxShadow: 2,
                  maxHeight: "70vh",
                  overflowY: "auto",
                  marginRight: 0,
                }}
              >
                {isExpanded && (
                  <>
                    {/* Category Select Dropdown */}
                    <FormControl
                      fullWidth
                      sx={{ marginBottom: 2, maxWidth: "96%" }}
                    >
                      <InputLabel shrink>Filter by Category</InputLabel>
                      <Select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        displayEmpty
                        notched
                        sx={{ maxHeight: 40, marginTop: 1.5 }}
                      >
                        <MenuItem value="">All Categories</MenuItem>
                        {uniqueCategories.map((category) => (
                          <MenuItem key={category} value={category}>
                            {category}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <Typography variant="h6" sx={{ marginBottom: 2 }}>
                      Available Items
                    </Typography>

                    {filteredItems.map((item, index) => {
                      const returningCount = returningTodayCount(item.id);
                      const inStockCount = item.quantity;
                      const inStockColor =
                        returningCount + inStockCount < 0 ? "red" : "black";

                      return (
                        <Draggable
                          key={`item-${item.id}`}
                          draggableId={`item-${item.id}`}
                          index={index}
                        >
                          {(provided) => (
                            <Card
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              sx={{
                                marginBottom: 1,
                                borderRadius: 2,
                                boxShadow: 1,
                                maxWidth: "95%",
                                transition: "0.3s",
                                "&:hover": { boxShadow: 3 },
                              }}
                            >
                              <CardContent>
                                <Typography variant="body1">
                                  {item.name}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  sx={{ color: inStockColor }}
                                >
                                  In Stock: {item.quantity}
                                </Typography>
                                <Typography variant="body2">
                                  Returning today: {returningCount}
                                </Typography>
                                <Typography variant="body2">
                                  Available: {returningCount + inStockCount}
                                </Typography>
                              </CardContent>
                            </Card>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                  </>
                )}
              </Box>
            )}
          </Droppable>
          {/* Toggle Button */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              maxHeight: "72vh",
              minWidth: "auto",
            }}
          >
            <Button
              variant="contained"
              color="primary"
              onClick={() => setIsExpanded(!isExpanded)}
              sx={{
                height: "100%",
                writingMode: "vertical-rl",
                transform: "rotate(180deg)",
                padding: "4px",
                minWidth: "auto",
              }}
            >
              {isExpanded ? "▶ Collapse Inventory" : "◀ Expand Inventory"}
            </Button>
          </Box>
          {/* Loading List Items Column */}
          <Droppable droppableId="loadingListItems">
            {(provided) => (
              <Box
                ref={provided.innerRef}
                {...provided.droppableProps}
                sx={{
                  width: "55%",
                  backgroundColor: "#e0f7fa",
                  padding: 2,
                  borderRadius: 2,
                  boxShadow: 2,
                  maxHeight: "70vh",
                  overflowY: "auto",
                  marginLeft: 4,
                }}
              >
                <Typography variant="h6" sx={{ marginBottom: 2 }}>
                  Loading List Items
                </Typography>
                {loadingList.loading_list_items.map(
                  (loadingListItem, index) => (
                    <Draggable
                      key={`loading-${loadingListItem.id}`}
                      draggableId={`loading-${loadingListItem.id}`}
                      index={index}
                    >
                      {(provided) => (
                        <Card
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          sx={{
                            marginBottom: 1,
                            borderRadius: 2,
                            boxShadow: 1,
                            transition: "0.3s",
                            "&:hover": { boxShadow: 3 },
                          }}
                        >
                          <CardContent>
                            <Typography variant="body1">
                              {loadingListItem.item
                                ? loadingListItem.item.name
                                : "Item not found"}
                            </Typography>
                            <Typography variant="body2">
                              Quantity: {loadingListItem.quantity}
                            </Typography>
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <Button
                                variant="outlined"
                                onClick={() =>
                                  decreaseLoadingListItemQuantity(
                                    loadingListItem
                                  )
                                }
                              >
                                -
                              </Button>
                              <Button
                                variant="outlined"
                                onClick={() =>
                                  increaseLoadingListItemQuantity(
                                    loadingListItem
                                  )
                                }
                              >
                                +
                              </Button>
                            </Box>
                          </CardContent>
                        </Card>
                      )}
                    </Draggable>
                  )
                )}
                {provided.placeholder}
              </Box>
            )}
          </Droppable>
        </Box>
      </DragDropContext>
    </>
  );
}

export default LoadingListEditor;

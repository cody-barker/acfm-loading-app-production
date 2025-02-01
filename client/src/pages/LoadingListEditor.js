import React, { useContext, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Box, Card, CardContent, Typography, Button } from "@mui/material";
import { ItemsContext } from "../contexts/ItemsContext"; // Adjust the import based on your context structure
import { LoadingListsContext } from "../contexts/LoadingListsContext"; // Adjust the import based on your context structure
import "./LoadingListEditor.css"; // Import custom styles

function LoadingListEditor() {
  const { id } = useParams();
  const { items } = useContext(ItemsContext); // Fetch items from context
  const { loadingLists } = useContext(LoadingListsContext); // Fetch loading lists from context

  const [availableItems, setAvailableItems] = useState(items);
  const [loadingListItems, setLoadingListItems] = useState([]); // Initialize as an empty array
  const [loading, setLoading] = useState(true); // Loading state

  useEffect(() => {
    const fetchLoadingList = async () => {
      try {
        const response = await fetch(`/api/loading_lists/${id}`);
        const loadingList = await response.json();

        // Set loading list items and available items
        setLoadingListItems(loadingList.loading_list_items || []); // Set items or an empty array if undefined
        setAvailableItems(
          items.map((item) => {
            const loadingItem = loadingList.loading_list_items.find(
              (loadingItem) => loadingItem.item_id === item.id
            );
            return {
              ...item,
              quantity: loadingItem
                ? item.quantity - loadingItem.quantity
                : item.quantity, // Adjust quantity based on loading list
            };
          })
        );
      } catch (error) {
        console.error("Error fetching loading list:", error);
      } finally {
        setLoading(false); // Set loading to false after fetching data
      }
    };

    fetchLoadingList();
  }, [id, items]);

  const createLoadingListItem = async (item) => {
    try {
      const response = await fetch(`/api/loading_list_items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          loading_list_id: id,
          item_id: item.id,
          quantity: 1,
        }),
      });
      const newLoadingListItem = await response.json();
      setLoadingListItems((prev) => [...prev, newLoadingListItem]);
      // Update available item quantity
      setAvailableItems((prev) =>
        prev.map((availableItem) =>
          availableItem.id === item.id
            ? { ...availableItem, quantity: availableItem.quantity - 1 }
            : availableItem
        )
      );
    } catch (error) {
      console.error("Error creating loading list item:", error);
    }
  };

  const updateLoadingListItemQuantity = async (
    loadingListItemId,
    quantity,
    adjustAvailable
  ) => {
    try {
      const loadingListItem = loadingListItems.find(
        (item) => item.id === loadingListItemId
      );
      const itemId = loadingListItem.item_id;

      if (quantity > 0) {
        await fetch(`/api/loading_list_items/${loadingListItemId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ quantity }),
        });

        if (adjustAvailable === "decrease") {
          // Update available item quantity
          setAvailableItems((prev) =>
            prev.map((availableItem) =>
              availableItem.id === itemId
                ? { ...availableItem, quantity: availableItem.quantity - 1 }
                : availableItem
            )
          );
        } else if (adjustAvailable === "increase") {
          // Update available item quantity
          setAvailableItems((prev) =>
            prev.map((availableItem) =>
              availableItem.id === itemId
                ? { ...availableItem, quantity: availableItem.quantity + 1 }
                : availableItem
            )
          );
        }
      } else {
        await fetch(`/api/loading_list_items/${loadingListItemId}`, {
          method: "DELETE",
        });

        if (adjustAvailable === "decrease") {
          // Update available item quantity
          setAvailableItems((prev) =>
            prev.map((availableItem) =>
              availableItem.id === itemId
                ? {
                    ...availableItem,
                    quantity: availableItem.quantity + loadingListItem.quantity,
                  }
                : availableItem
            )
          );
        } else if (adjustAvailable === "increase") {
          // Update available item quantity
          setAvailableItems((prev) =>
            prev.map((availableItem) =>
              availableItem.id === itemId
                ? {
                    ...availableItem,
                    quantity: availableItem.quantity + 1,
                  }
                : availableItem
            )
          );
        }
      }
    } catch (error) {
      console.error("Error updating loading list item quantity:", error);
    }
  };

  const onDragEnd = (result) => {
    const { source, destination } = result;

    if (!destination) {
      return;
    }

    if (
      source.droppableId === "availableItems" &&
      destination.droppableId === "loadingListItems"
    ) {
      const item = availableItems[source.index];
      const itemExists = loadingListItems.some(
        (loadingItem) => loadingItem.item_id === item.id
      );
      if (itemExists) {
        return; // Prevent adding the same item again
      }

      // Create loading list item
      createLoadingListItem(item);
    }

    if (
      source.droppableId === "loadingListItems" &&
      destination.droppableId === "availableItems"
    ) {
      const item = loadingListItems[source.index];
      setLoadingListItems((prev) =>
        prev.filter((_, index) => index !== source.index)
      );
      setAvailableItems((prev) =>
        prev.map((availableItem) =>
          availableItem.id === item.item_id
            ? {
                ...availableItem,
                quantity: availableItem.quantity + item.quantity,
              }
            : availableItem
        )
      );

      // Update the database after removing the item
      updateLoadingListItemQuantity(item.id, 0, "decrease");
    }
  };

  const increaseQuantity = (loadingListItemId) => {
    setLoadingListItems((prev) => {
      const updatedItems = prev.map((item) =>
        item.id === loadingListItemId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );

      // Update loading list item quantity and adjust available item quantity
      updateLoadingListItemQuantity(
        loadingListItemId,
        updatedItems.find((item) => item.id === loadingListItemId).quantity,
        "decrease"
      );

      return updatedItems;
    });
  };

  const decreaseQuantity = (loadingListItemId) => {
    setLoadingListItems((prevLoadingListItems) => {
      const updatedItems = prevLoadingListItems
        .map((item) => {
          if (item.id === loadingListItemId && item.quantity > 0) {
            return { ...item, quantity: item.quantity - 1 };
          }
          return item;
        })
        .filter((item) => item.quantity > 0); // Remove items with quantity 0

      // Update loading list item quantity and adjust available item quantity
      updateLoadingListItemQuantity(
        loadingListItemId,
        updatedItems.find((item) => item.id === loadingListItemId)?.quantity ||
          0,
        "increase"
      );

      return updatedItems;
    });
  };

  if (loading) {
    return <Typography variant="h6">Loading...</Typography>; // Show loading state
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Box
        sx={{ display: "flex", justifyContent: "space-between", padding: 5 }}
      >
        <Droppable droppableId="availableItems">
          {(provided) => (
            <Box
              ref={provided.innerRef}
              {...provided.droppableProps}
              sx={{
                width: "45%",
                backgroundColor: "#f0f0f0",
                padding: 2,
                borderRadius: 2,
                boxShadow: 2,
              }}
            >
              <Typography variant="h6" sx={{ marginBottom: 2 }}>
                Available Items
              </Typography>
              {availableItems.map((item, index) => (
                <Draggable
                  key={item.id}
                  draggableId={String(item.id)}
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
                        <Typography variant="body1">{item.name}</Typography>
                        <Typography variant="body2">
                          Quantity: {item.quantity}
                        </Typography>
                        <Typography variant="body2">
                          Category: {item.category}
                        </Typography>
                      </CardContent>
                    </Card>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </Box>
          )}
        </Droppable>

        <Droppable droppableId="loadingListItems">
          {(provided) => (
            <Box
              ref={provided.innerRef}
              {...provided.droppableProps}
              sx={{
                width: "45%",
                backgroundColor: "#e0f7fa",
                padding: 2,
                borderRadius: 2,
                boxShadow: 2,
              }}
            >
              <Typography variant="h6" sx={{ marginBottom: 2 }}>
                Loading List Items
              </Typography>
              {loadingListItems.map((item, index) => (
                <Draggable
                  key={`loading-${item.id}`}
                  draggableId={`loading-${item.id}`}
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
                          {item.item ? item.item.name : "Item not found"}
                        </Typography>
                        <Typography variant="body2">
                          Quantity: {item.quantity}
                        </Typography>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Button
                            variant="outlined"
                            onClick={() => decreaseQuantity(item.id)}
                          >
                            -
                          </Button>
                          <Button
                            variant="outlined"
                            onClick={() => increaseQuantity(item.id)}
                          >
                            +
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </Box>
          )}
        </Droppable>
      </Box>
    </DragDropContext>
  );
}

export default LoadingListEditor;

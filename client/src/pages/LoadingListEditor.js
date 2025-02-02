import React, { useContext, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Box, Card, CardContent, Typography, Button } from "@mui/material";
import { ItemsContext } from "../contexts/ItemsContext"; // Adjust the import based on your context structure
import { LoadingListsContext } from "../contexts/LoadingListsContext"; // Adjust the import based on your context structure
import "./LoadingListEditor.css"; // Import custom styles

/**
 * Case 1 (success)
 * -drag to loading list
 * -subtract 1
 * -both item and loading list item are correct quantity
 *
 * Case 2
 * -drag to loading list
 * -add 3
 * -subtract 1 is fine
 * -subtract 1 more is fine for loading list item but it decreases the item quantity by 1 instead of increasing it by 1
 * -subtract 1 more is fine for loading list item and item quantity (it increases as it should)
 * -qty is now 1, subtract 1 is fine for loading list item now at 0, but item decreases quantity again by 1
 */

function LoadingListEditor() {
  const { id } = useParams();
  const { items, setItems } = useContext(ItemsContext);
  const { loadingLists, setLoadingLists } = useContext(LoadingListsContext);

  let loadingList = loadingLists.find(
    (loadingList) => loadingList.id === parseInt(id)
  );

  const [loadingListItems, setLoadingListItems] = useState(
    loadingList ? loadingList.loading_list_items : []
  );

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
        prev.map((item) =>
          item.id === updatedItem.id
            ? { ...item, quantity: updatedItem.quantity }
            : item
        )
      );
    } catch (error) {
      console.error("Error decreasing item quantity:", error);
    }
  };

  const increaseItemQuantity = async (item) => {
    if (!item) return; // Prevent calling with undefined/null
    console.log("Before Update:", item);
    try {
      const response = await fetch(`/api/items/${item.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quantity: item.quantity + 1, // ✅ Explicitly incrementing
        }),
      });

      const updatedItem = await response.json();
      console.log("After Update:", updatedItem);

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
      setLoadingListItems((prev) => [...prev, newLoadingListItem]);
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

      //do I need to update loadingLists as well if I'm updating loadingList property in state and db?
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
      const item = updatedLoadingListItem.item;
      setLoadingListItems((prev) =>
        prev.map((item) =>
          item.id === updatedLoadingListItem.id ? updatedLoadingListItem : item
        )
      );
      decreaseItemQuantity(item);
    } catch (error) {
      console.error("Error creating loading list item:", error);
    }
  };

  const decreaseLoadingListItemQuantity = async (loadingListItem) => {
    console.log("Before Decrease:", loadingListItem);

    try {
      if (loadingListItem.quantity <= 1) {
        // If the quantity is 1, delete the item
        await fetch(`/api/loading_list_items/${loadingListItem.id}`, {
          method: "DELETE",
        });

        // Update state
        setLoadingListItems((prev) =>
          prev.filter((item) => item.id !== loadingListItem.id)
        );

        setLoadingLists((prev) =>
          prev.map((list) =>
            list.id === loadingListItem.loading_list_id
              ? {
                  ...list,
                  loading_list_items: list.loading_list_items.filter(
                    (item) => item.id !== loadingListItem.id
                  ),
                }
              : list
          )
        );

        // 🔥 Ensure we're passing the correct item reference
        increaseItemQuantity(
          items.find((i) => i.id === loadingListItem.item_id)
        );
      } else {
        // If quantity is greater than 1, decrease quantity
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

        setLoadingListItems((prev) =>
          prev.map((item) =>
            item.id === updatedLoadingListItem.id
              ? updatedLoadingListItem
              : item
          )
        );

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

        // 🔥 Fix by ensuring the correct item is passed
        increaseItemQuantity(
          items.find((i) => i.id === loadingListItem.item_id)
        );
      }
    } catch (error) {
      console.error("Error decreasing loading list item quantity:", error);
    }
  };

  const deleteLoadingListItem = async (id) => {
    try {
      await fetch(`/api/loading_list_items/${id}`, { method: "DELETE" });
      setLoadingListItems((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Error deleting loading list item:", error);
    }
  };

  const onDragEnd = (result) => {
    const { source, destination } = result;
    console.log(source, destination, result);
    if (!destination) {
      return;
    }

    if (
      source.droppableId === "availableItems" &&
      destination.droppableId === "loadingListItems"
    ) {
      //this is a regular item
      const item = items[source.index];
      const itemExists = loadingListItems.some(
        (loadingListItem) => loadingListItem.item_id === item.id
      );
      console.log(item);
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

      // Remove from state
      setLoadingListItems((prev) =>
        prev.filter((_, index) => index !== source.index)
      );

      // Update availableItems state
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

      // Delete from DB
      deleteLoadingListItem(item.id);
    }
  };

  if (!loadingList) {
    return <div>"Loading..."</div>;
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
              {items.map((item, index) => (
                <Draggable
                  key={`available-${item.id}`}
                  draggableId={`available-${item.id}`}
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
              {loadingListItems.map((loadingListItem, index) => (
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
                              decreaseLoadingListItemQuantity(loadingListItem)
                            }
                          >
                            -
                          </Button>
                          <Button
                            variant="outlined"
                            onClick={() =>
                              increaseLoadingListItemQuantity(loadingListItem)
                            }
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

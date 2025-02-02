import React, { useContext, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Box, Card, CardContent, Typography, Button } from "@mui/material";
import { ItemsContext } from "../contexts/ItemsContext"; // Adjust the import based on your context structure
import { LoadingListsContext } from "../contexts/LoadingListsContext"; // Adjust the import based on your context structure
import "./LoadingListEditor.css"; // Import custom styles
import { format } from "date-fns"; // Import date-fns for formatting

function LoadingListEditor() {
  const { id } = useParams();
  const { items, setItems } = useContext(ItemsContext);
  const { loadingLists, setLoadingLists } = useContext(LoadingListsContext);

  const today = format(new Date(), "yyyy-MM-dd");

  let loadingList = loadingLists.find(
    (loadingList) => loadingList.id === parseInt(id)
  );

  if (!loadingList) {
    return <div>"Loading..."</div>;
  }

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

        // Update the state and remove the deleted item from the list
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
        // Restore the quantity of the item in the available items list
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

        // Also update the quantity of the item in the available items list
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
      if (itemExists) return; // Prevent adding the same item again

      createLoadingListItem(item);
    }
  };

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
                backgroundColor: "#e0f7fa",
                padding: 2,
                borderRadius: 2,
                boxShadow: 2,
              }}
            >
              <Typography variant="h6" sx={{ marginBottom: 2 }}>
                Available Items
              </Typography>
              {items.map((item, index) => {
                // Calculate how many of this item will be returning today

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
                          transition: "0.3s",
                          "&:hover": { boxShadow: 3 },
                        }}
                      >
                        <CardContent>
                          <Typography variant="body1">{item.name}</Typography>
                          <Typography variant="body2" sx={{ marginTop: 1 }}>
                            In Stock: {item.quantity}
                          </Typography>
                          {/* Display the returning today count for each item */}
                          <Typography variant="body2" sx={{ marginTop: 1 }}>
                            Returning today: {returningTodayCount(item.id)}
                          </Typography>
                        </CardContent>
                      </Card>
                    )}
                  </Draggable>
                );
              })}
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
              {loadingList.loading_list_items.map((loadingListItem, index) => (
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

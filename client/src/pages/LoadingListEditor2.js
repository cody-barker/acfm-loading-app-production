import React, { useContext, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Box, Card, CardContent, Typography, Button } from "@mui/material";
import { ItemsContext } from "../contexts/ItemsContext"; // Adjust the import based on your context structure
import { LoadingListsContext } from "../contexts/LoadingListsContext"; // Adjust the import based on your context structure
import "./LoadingListEditor.css"; // Import custom styles

function LoadingListEditor2() {
  const { id } = useParams();
  const { items, setItems } = useContext(ItemsContext);
  const { loadingLists, setLoadingLists } = useContext(LoadingListsContext);

  let loadingList = loadingLists.find(
    (loadingList) => loadingList.id === parseInt(id)
  );

  const [loadingListItems, setLoadingListItems] = useState(
    loadingList ? loadingList.loading_list_items : []
  );

  console.log(loadingListItems);

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
      setLoadingListItems((prev) =>
        prev.map((item) =>
          item.id === updatedLoadingListItem.id ? updatedLoadingListItem : item
        )
      );
      const item = updatedLoadingListItem.item;
      //do I need to update loadingLists as well if I'm updating loadingList property in state and db?
      decreaseItemQuantity(item);
    } catch (error) {
      console.error("Error creating loading list item:", error);
    }
  };

  const decreaseLoadingListItemQuantity = async (loadingListItem) => {
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
            quantity: loadingListItem.quantity - 1,
          }),
        }
      );
      const updatedLoadingListItem = await response.json();
      setLoadingListItems((prev) =>
        prev.map((item) =>
          item.id === updatedLoadingListItem.id ? updatedLoadingListItem : item
        )
      );
      console.log(updatedLoadingListItem);
      const item = updatedLoadingListItem.item;
      //do I need to update loadingLists as well if I'm updating loadingList property in state and db?
      increaseItemQuantity(item);
    } catch (error) {
      console.error("Error creating loading list item:", error);
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
      const item = items[source.index];
      const itemExists = loadingListItems.some(
        (loadingListItem) => loadingListItem.item_id === item.id
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
      setItems((prev) =>
        prev.map((availableItem) =>
          availableItem.id === item.item_id
            ? {
                ...item,
                quantity: availableItem.quantity + item.quantity,
              }
            : item
        )
      );
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

export default LoadingListEditor2;

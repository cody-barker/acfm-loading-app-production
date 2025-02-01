import React, { useContext, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Box, Card, CardContent, Typography, Button } from "@mui/material";
import { ItemsContext } from "../contexts/ItemsContext"; // Adjust the import based on your context structure
import { LoadingListsContext } from "../contexts/LoadingListsContext"; // Adjust the import based on your context structure

function LoadingListEditor() {
  const { id } = useParams();
  const { items } = useContext(ItemsContext); // Fetch items from context
  const { loadingLists } = useContext(LoadingListsContext); // Fetch loading lists from context

  const [availableItems, setAvailableItems] = useState(items);
  const [loadingListItems, setLoadingListItems] = useState([]);

  useEffect(() => {
    // Find the loading list by ID and set the available items accordingly
    const loadingList = loadingLists.find((list) => list.id === parseInt(id));
    if (loadingList) {
      // Initialize available items based on the loading list or other logic
      setAvailableItems(items); // You can customize this based on your requirements
    }
  }, [id, items, loadingLists]);

  const onDragEnd = (result) => {
    const { source, destination } = result;

    // If dropped outside the list
    if (!destination) {
      return;
    }

    // If the item is dropped in the loading list
    if (
      source.droppableId === "availableItems" &&
      destination.droppableId === "loadingListItems"
    ) {
      const item = availableItems[source.index];
      setLoadingListItems((prev) => [
        ...prev,
        { ...item, quantity: 1 }, // Start with quantity 1 in the loading list
      ]);
      // Update available items
      setAvailableItems((prev) =>
        prev.map((availableItem) =>
          availableItem.id === item.id
            ? { ...availableItem, quantity: availableItem.quantity - 1 }
            : availableItem
        )
      );
    }

    // If the item is dropped back to the available items
    if (
      source.droppableId === "loadingListItems" &&
      destination.droppableId === "availableItems"
    ) {
      const item = loadingListItems[source.index];

      // Remove the item from loading list items
      setLoadingListItems((prev) =>
        prev.filter((_, index) => index !== source.index)
      );

      // Update the available items to reflect the returned quantity
      setAvailableItems((prev) =>
        prev.map((availableItem) =>
          availableItem.id === item.id
            ? {
                ...availableItem,
                quantity: availableItem.quantity + item.quantity,
              }
            : availableItem
        )
      );
    }
  };

  const increaseQuantity = (itemId) => {
    setLoadingListItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
    setAvailableItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, quantity: item.quantity - 1 } : item
      )
    );
  };

  const decreaseQuantity = (itemId) => {
    setLoadingListItems((prev) =>
      prev.map((item) =>
        item.id === itemId && item.quantity > 0
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
    );
    setAvailableItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Box
        sx={{ display: "flex", justifyContent: "space-between", padding: 2 }}
      >
        <Droppable droppableId="availableItems">
          {(provided) => (
            <Box
              ref={provided.innerRef}
              {...provided.droppableProps}
              sx={{ width: "45%", backgroundColor: "#f0f0f0", padding: 2 }}
            >
              <Typography variant="h6">Available Items</Typography>
              {availableItems.map((item, index) => (
                <Draggable
                  key={String(item.id)}
                  draggableId={String(item.id)}
                  index={index}
                >
                  {(provided) => (
                    <Card
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      sx={{ marginBottom: 1 }}
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
              sx={{ width: "45%", backgroundColor: "#e0f7fa", padding: 2 }}
            >
              <Typography variant="h6">Loading List Items</Typography>
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
                      sx={{ marginBottom: 1 }}
                    >
                      <CardContent>
                        <Typography variant="body1">{item.name}</Typography>
                        <Typography variant="body2">
                          Quantity: {item.quantity}
                        </Typography>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Button
                            onClick={() => decreaseQuantity(item.id)}
                            disabled={item.quantity <= 0}
                          >
                            -
                          </Button>
                          <Button onClick={() => increaseQuantity(item.id)}>
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

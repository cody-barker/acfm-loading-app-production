import React from "react";
import { Droppable, Draggable } from "react-beautiful-dnd";
import { Box, Card, CardContent, Typography, Button } from "@mui/material";

const LoadingListItems = ({
  loadingList,
  increaseLoadingListItemQuantity,
  decreaseLoadingListItemQuantity,
}) => (
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
          maxHeight: "65vh",
          overflowY: "auto",
          marginLeft: 4,
        }}
      >
        <Typography variant="h6" sx={{ marginBottom: 2 }}>
          Loading List Items
        </Typography>
        {loadingList.loading_list_items.map((loadingListItem, index) => (
          <Draggable
            key={loadingListItem.id}
            draggableId={String(loadingListItem.id)}
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
                      sx={{ minWidth: 0.1 }}
                      variant="outlined"
                      onClick={() =>
                        decreaseLoadingListItemQuantity(loadingListItem)
                      }
                    >
                      -
                    </Button>
                    <Button
                      sx={{ minWidth: 0.1 }}
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
);

export default LoadingListItems;

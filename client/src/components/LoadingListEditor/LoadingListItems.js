import React from "react";
import { Droppable, Draggable } from "react-beautiful-dnd";
import { Box, Card, CardContent, Typography } from "@mui/material";

const LoadingListItems = ({ loadingListItems }) => (
  <Droppable droppableId="loadingListItems">
    {(provided) => (
      <Box
        ref={provided.innerRef}
        {...provided.droppableProps}
        sx={{
          flex: 1,
          backgroundColor: "#fff",
          p: 2,
          borderRadius: 2,
          boxShadow: 2,
        }}
      >
        <Typography variant="h6" sx={{ mb: 2 }}>
          Loading List Items
        </Typography>
        {loadingListItems.map((item, index) => (
          <Draggable
            key={item.id}
            draggableId={`item-${item.id}`}
            index={index}
          >
            {(provided) => (
              <Card
                ref={provided.innerRef}
                {...provided.draggableProps}
                {...provided.dragHandleProps}
                sx={{ mb: 1, p: 2, boxShadow: 1 }}
              >
                <Typography variant="body1">{item.name}</Typography>
                <Typography variant="body2">
                  Quantity: {item.quantity}
                </Typography>
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

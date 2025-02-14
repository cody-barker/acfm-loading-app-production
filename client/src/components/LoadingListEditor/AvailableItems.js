import React from "react";
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  Typography,
} from "@mui/material";
import { Droppable, Draggable } from "react-beautiful-dnd";

const AvailableItems = ({
  isExpanded,
  setIsExpanded,
  selectedCategory,
  setSelectedCategory,
  uniqueCategories,
  filteredItems,
}) => (
  <Droppable droppableId="availableItems">
    {(provided) => (
      <Box
        ref={provided.innerRef}
        {...provided.droppableProps}
        sx={{
          width: isExpanded ? "45%" : "0%",
          transition: "width 0.3s",
          backgroundColor: "#e0f7fa",
          p: isExpanded ? 2 : 0,
          borderRadius: 2,
          boxShadow: 2,
          overflow: "hidden",
        }}
      >
        {isExpanded && (
          <>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel shrink>Filter by Category</InputLabel>
              <Select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <MenuItem value="">All Categories</MenuItem>
                {uniqueCategories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {filteredItems.map((item, index) => (
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
                      In Stock: {item.quantity}
                    </Typography>
                  </Card>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </>
        )}
      </Box>
    )}
  </Droppable>
);

export default AvailableItems;

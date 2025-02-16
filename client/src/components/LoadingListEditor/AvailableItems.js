import React from "react";
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Typography,
} from "@mui/material";
import { Droppable, Draggable } from "react-beautiful-dnd";

const AvailableItems = ({
  isExpanded,
  selectedCategory,
  setSelectedCategory,
  uniqueCategories,
  filteredItems,
  returningTodayCount,
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
          padding: isExpanded ? 2 : 0,
          borderRadius: 2,
          boxShadow: 2,
          maxHeight: "65vh",
          overflowY: "auto",
          paddingBottom: 2
        }}
      >
        {isExpanded && (
          <>
            <Typography variant="h6" sx={{ marginBottom: 2 }}>
              Available Items
            </Typography>
            <FormControl variant="outlined" fullWidth sx={{ mb: 2 }}>
              <InputLabel shrink>Filter by Category</InputLabel>
              <Select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                label="Filter by Category"
                displayEmpty
              >
                <MenuItem value="">All Categories</MenuItem>
                {uniqueCategories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {filteredItems.map((item, index) => {
              const returningCount = returningTodayCount(item.id);
              const inStockCount = item.quantity;
              const inStockColor =
                returningCount + inStockCount < 0 ? "red" : "black";

              return (
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
                        maxWidth: "95%",
                        transition: "0.3s",
                        "&:hover": { boxShadow: 3 },
                      }}
                    >
                      <CardContent>
                        <Typography variant="body1">{item.name}</Typography>
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
);

export default AvailableItems;

import React, { memo } from "react";
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Typography,
  TextField,
} from "@mui/material";
import { Droppable, Draggable } from "react-beautiful-dnd";

// Memoized item card component
const ItemCard = memo(({ item, returningCount, provided }) => {
  const inStockCount = item.quantity;
  const inStockColor = returningCount + inStockCount < 0 ? "red" : "black";

  return (
    <Card
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      sx={{
        marginBottom: 1,
        borderRadius: 2,
        boxShadow: 1,
        maxWidth: "95%",
        "&:hover": {
          transform: "translateY(-2px)",
        },
      }}
    >
      <CardContent>
        <Typography variant="body1">{item.name}</Typography>
        <Typography variant="body2" sx={{ color: inStockColor }}>
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
  );
});

const AvailableItems = ({
  isExpanded,
  selectedCategory,
  setSelectedCategory,
  nameFilter,
  setNameFilter,
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
          paddingBottom: 2,
        }}
      >
        {isExpanded && (
          <>
            <Typography variant="h6" sx={{ marginBottom: 2 }}>
              Available Items
            </Typography>
            <TextField
              fullWidth
              label="Search by name"
              variant="outlined"
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              sx={{ mb: 2, width: "95%"}}
            />
            <FormControl variant="outlined" fullWidth sx={{ mb: 2 }}>
              <InputLabel shrink>Filter by Category</InputLabel>
              <Select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                label="Filter by Category"
                displayEmpty
                sx={{width: "95%"}}
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
                draggableId={String(item.id)}
                index={index}
              >
                {(provided) => (
                  <ItemCard
                    item={item}
                    returningCount={returningTodayCount(item.id)}
                    provided={provided}
                  />
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

export default memo(AvailableItems);

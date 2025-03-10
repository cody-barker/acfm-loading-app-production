import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  TextField,
} from "@mui/material";
import { Droppable, Draggable } from "react-beautiful-dnd";
import { useItemFiltering } from "../../hooks/useItemFiltering";
import { ItemCard } from "./ItemCard";

export const AvailableItems = ({
  isExpanded,
  selectedCategory,
  setSelectedCategory,
  returningTodayCount,
  items,
}) => {
  const { itemNameFilter, setItemNameFilter, uniqueCategories, filteredItems } =
    useItemFiltering(items, selectedCategory);

  return (
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
                value={itemNameFilter}
                onChange={(e) => setItemNameFilter(e.target.value)}
                sx={{ mb: 2, width: "95%" }}
              />
              <FormControl variant="outlined" fullWidth sx={{ mb: 2 }}>
                <InputLabel shrink>Filter by Category</InputLabel>
                <Select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  label="Filter by Category"
                  displayEmpty
                  sx={{ width: "95%" }}
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
};

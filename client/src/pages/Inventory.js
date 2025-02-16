import React, { useState, useContext, useMemo, useEffect } from "react";
import {
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { ItemsContext } from "../contexts/ItemsContext";
import { LoadingListsContext } from "../contexts/LoadingListsContext";
import { format } from "date-fns";

const Inventory = () => {
  const { items, setItems } = useContext(ItemsContext);
  const { loadingLists } = useContext(LoadingListsContext);
  const [open, setOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [error, setError] = useState(null);

  const uniqueCategories = useMemo(
    () => [...new Set(items.map((item) => item.category))],
    [items]
  );

  const sortedItems = useMemo(
    () => [...items].sort((a, b) => a.name.localeCompare(b.name)),
    [items]
  );

  const today = format(new Date(), "yyyy-MM-dd");

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

  const handleEdit = (item) => {
    setSelectedItem({
      ...item,
      quantity: item.quantity,
      repair_quantity: item.repair_quantity || 0,
    });
    setOpen(true);
  };

  const handleNumberInput = (value, field) => {
    // Allow empty value
    if (value === "") {
      setSelectedItem((prev) => ({
        ...prev,
        [field]: "",
      }));
      return;
    }

    // Convert to integer and validate
    const number = parseInt(value);

    // Only update if it's a valid non-negative integer
    if (Number.isInteger(number) && number >= 0) {
      setSelectedItem((prev) => ({
        ...prev,
        [field]: number,
      }));
    }
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedItem(null);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Convert empty strings to 0
      const quantity = selectedItem.quantity === "" ? 0 : selectedItem.quantity;
      const repair_quantity =
        selectedItem.repair_quantity === "" ? 0 : selectedItem.repair_quantity;

      const response = await fetch(`/api/items/${selectedItem.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: selectedItem.name,
          category: selectedItem.category,
          quantity,
          repair_quantity,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.errors || "Failed to update item");
      }

      const updatedItem = await response.json();
      setItems((prev) =>
        prev.map((item) => (item.id === updatedItem.id ? updatedItem : item))
      );
      handleClose();
    } catch (error) {
      console.error("Error updating item:", error);
      setError(error.message);
    }
  };

  return (
    <Container maxWidth="xl">
      <Typography variant="h4" sx={{ my: 4 }}>
        Inventory
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell width="10%"></TableCell>
              <TableCell width="20%">Name</TableCell>
              <TableCell width="15%">Category</TableCell>
              <TableCell width="10%" align="right">
                At Facilities
              </TableCell>
              <TableCell width="15%" align="right">
                In Repair
              </TableCell>
              <TableCell width="10%" align="right">
                Returns Today
              </TableCell>
              <TableCell width="15%" align="right">
                Available to Load
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedItems.map((item) => {
              const returningCount = returningTodayCount(item.id);
              const availableCount =
                item.quantity + returningCount - (item.repair_quantity || 0);

              return (
                <TableRow key={item.id}>
                  <TableCell>
                    <IconButton onClick={() => handleEdit(item)}>
                      <EditIcon />
                    </IconButton>
                  </TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell align="right">{item.quantity}</TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      color: item.repair_quantity > 0 ? "red" : "black",
                    }}
                  >
                    {item.repair_quantity || 0}
                  </TableCell>
                  <TableCell align="right">{returningCount}</TableCell>
                  <TableCell align="right">{availableCount}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose}>
        <form onSubmit={handleSubmit}>
          <DialogTitle>Edit Item</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="Name"
              value={selectedItem?.name || ""}
              onChange={(e) =>
                setSelectedItem((prev) => ({
                  ...prev,
                  name: e.target.value,
                }))
              }
              margin="normal"
            />
            <TextField
              select
              fullWidth
              label="Category"
              value={selectedItem?.category || ""}
              onChange={(e) =>
                setSelectedItem((prev) => ({
                  ...prev,
                  category: e.target.value,
                }))
              }
              margin="normal"
            >
              {uniqueCategories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              label="Quantity at Facilities"
              type="number"
              InputProps={{
                inputProps: {
                  min: 0,
                  step: 1,
                  onKeyDown: (e) => {
                    if (e.key === "." || e.key === "-" || e.key === "e") {
                      e.preventDefault();
                    }
                  },
                },
              }}
              value={selectedItem?.quantity ?? ""}
              onChange={(e) => handleNumberInput(e.target.value, "quantity")}
              margin="normal"
            />
            <TextField
              fullWidth
              label="In Repair"
              type="number"
              InputProps={{
                inputProps: {
                  min: 0,
                  step: 1,
                  onKeyDown: (e) => {
                    if (e.key === "." || e.key === "-" || e.key === "e") {
                      e.preventDefault();
                    }
                  },
                },
              }}
              value={selectedItem?.repair_quantity ?? ""}
              onChange={(e) =>
                handleNumberInput(e.target.value, "repair_quantity")
              }
              margin="normal"
            />
            {error && (
              <Typography color="error" sx={{ mt: 2 }}>
                {error}
              </Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              Save
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
};

export default Inventory;

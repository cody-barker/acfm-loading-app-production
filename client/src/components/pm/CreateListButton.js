import React, { useState } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";

const CreateListButton = ({ onListCreated }) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    site_name: "",
    date: null,
    return_date: null,
    notes: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/loading_lists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setOpen(false);
        onListCreated();
      }
    } catch (error) {
      console.error("Error creating list:", error);
    }
  };

  return (
    <>
      <Button
        variant="contained"
        onClick={() => setOpen(true)}
        sx={{ alignSelf: "flex-end", mb: 2 }}
      >
        Create New List
      </Button>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create New Loading List</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField
              label="Site Name"
              fullWidth
              value={formData.site_name}
              onChange={(e) =>
                setFormData({ ...formData, site_name: e.target.value })
              }
            />
            <DatePicker
              label="Date"
              value={formData.date}
              onChange={(newValue) =>
                setFormData({ ...formData, date: newValue })
              }
            />
            <DatePicker
              label="Return Date"
              value={formData.return_date}
              onChange={(newValue) =>
                setFormData({ ...formData, return_date: newValue })
              }
            />
            <TextField
              label="Notes"
              fullWidth
              multiline
              rows={4}
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CreateListButton;

import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Stack,
  Box,
} from "@mui/material";

const LoadingListDialog = ({
  open,
  onClose,
  formData,
  setFormData,
  teams,
  handleSubmit,
  handleDelete,
}) => {
  const handleChange = (field) => (event) => {
    setFormData((prev) => ({ ...prev, [field]: event.target.value }));
  };

  

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Update Loading List Details</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 2 }}>
          <TextField
            label="Site Name"
            fullWidth
            value={formData.site_name}
            onChange={handleChange("site_name")}
          />
          <TextField
            label="Work Starts"
            type="date"
            fullWidth
            value={formData.date}
            onChange={handleChange("date")}
          />
          <TextField
            label="Return Date"
            type="date"
            fullWidth
            value={formData.return_date}
            onChange={handleChange("return_date")}
          />
          <FormControl fullWidth variant="outlined">
            <InputLabel id="team-selector-label">Team</InputLabel>
            <Select
              labelId="team-selector-label"
              value={formData.team_id}
              onChange={handleChange("team_id")}
              label="Team"
            >
              {teams.map(({ id, name }) => (
                <MenuItem key={id} value={id}>
                  {name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Notes"
            fullWidth
            multiline
            rows={4}
            value={formData.notes}
            onChange={handleChange("notes")}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ justifyContent: "space-between", mx: 2, mb: 2 }}>
        <Button onClick={handleDelete} variant="contained" color="error">
          Delete
        </Button>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            Update
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default LoadingListDialog;

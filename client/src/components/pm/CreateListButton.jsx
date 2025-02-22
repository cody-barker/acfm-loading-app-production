import React, { useState, useContext } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { UserContext } from "../../contexts/UserContext";
import { TeamsContext } from "../../contexts/TeamsContext";
import { LoadingListsContext } from "../../contexts/LoadingListsContext";

function CreateListButton({ onListCreated }) {
  const [open, setOpen] = useState(false);
  const { user } = useContext(UserContext);
  const { teams } = useContext(TeamsContext);
  const { loadingLists, setLoadingLists } = useContext(LoadingListsContext);
  const [formData, setFormData] = useState({
    site_name: "",
    date: "",
    return_date: "",
    notes: "",
    team_id: "",
    user_id: user.id,
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
        const newList = await response.json();
        setLoadingLists([...loadingLists, newList]);
        setOpen(false);
        onListCreated(newList);
        setFormData({
          site_name: "",
          date: "",
          return_date: "",
          notes: "",
          team_id: "",
          user_id: user.id,
        });
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
            <TextField
              label="Work Starts"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
            />
            <TextField
              label="Return Date"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={formData.return_date}
              onChange={(e) =>
                setFormData({ ...formData, return_date: e.target.value })
              }
            />
            <FormControl fullWidth>
              <InputLabel id="team__selector--label">Team</InputLabel>
              <Select
                labelId="team__selector--label"
                id="team__selector"
                value={formData.team_id}
                label="Team"
                onChange={(e) =>
                  setFormData({ ...formData, team_id: e.target.value })
                }
              >
                {teams.map((team) => {
                  return (
                    <MenuItem key={team.id} value={team.id}>
                      {team.name}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
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
}

export default CreateListButton;

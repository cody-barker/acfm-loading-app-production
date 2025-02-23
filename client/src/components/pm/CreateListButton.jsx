import React, { useState, useContext } from "react";
import Error from "../Error";
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
import { useLoadingListOperations } from "../../hooks/useLoadingListOperations";

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

  const { error, isLoading, handleCreate } = useLoadingListOperations(
    loadingLists,
    setLoadingLists
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const newList = await handleCreate(formData);
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
    } catch (error) {
      // Error is handled by the hook
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
              <InputLabel id="team-selector-label">Team</InputLabel>
              <Select
                labelId="team-selector-label"
                value={formData.team_id}
                onChange={(e) =>
                  setFormData({ ...formData, team_id: e.target.value })
                }
                label="Team"
              >
                {teams.map((team) => (
                  <MenuItem key={team.id} value={team.id}>
                    {team.name}
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
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
            />
            {error && <Error error={error} />}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={isLoading}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default CreateListButton;

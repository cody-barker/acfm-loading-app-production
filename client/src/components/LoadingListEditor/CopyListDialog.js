import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import Error from "../Error";

function CopyListDialog({ ...props }) {
  const {
    copyDialogOpen,
    setCopyDialogOpen,
    copyFormData,
    setCopyFormData,
    teams,
    handleCopySubmit,
    copyError,
    setCopyError,
  } = props;

  return (
    <Dialog open={copyDialogOpen} onClose={() => setCopyDialogOpen(false)}>
      <DialogTitle>Copy Loading List</DialogTitle>
      <DialogContent>
        <Box component="form" onSubmit={handleCopySubmit} sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Site Name"
            value={copyFormData.site_name}
            onChange={(e) =>
              setCopyFormData((prev) => ({
                ...prev,
                site_name: e.target.value,
              }))
            }
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Work Starts"
            type="date"
            value={copyFormData.date}
            onChange={(e) =>
              setCopyFormData((prev) => ({
                ...prev,
                date: e.target.value,
              }))
            }
            margin="normal"
            required
            InputLabelProps={{
              shrink: true,
            }}
          />
          <TextField
            fullWidth
            label="Return Date"
            type="date"
            value={copyFormData.return_date}
            onChange={(e) =>
              setCopyFormData((prev) => ({
                ...prev,
                return_date: e.target.value,
              }))
            }
            margin="normal"
            InputLabelProps={{
              shrink: true,
            }}
          />
          <TextField
            fullWidth
            label="Notes"
            value={copyFormData.notes}
            onChange={(e) =>
              setCopyFormData((prev) => ({
                ...prev,
                notes: e.target.value,
              }))
            }
            margin="normal"
            multiline
            rows={4}
          />
          <FormControl fullWidth margin="normal" required>
            <InputLabel>Team</InputLabel>
            <Select
              value={copyFormData.team_id}
              onChange={(e) =>
                setCopyFormData((prev) => ({
                  ...prev,
                  team_id: e.target.value,
                }))
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
          {copyError && <Error error={copyError} />}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            setCopyDialogOpen(false);
            setCopyError(null);
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={() => handleCopySubmit(copyFormData)}
          variant="contained"
          color="primary"
        >
          Create Copy
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default CopyListDialog;

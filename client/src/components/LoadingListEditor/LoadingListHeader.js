import { Box, Typography, Button, Stack } from "@mui/material";
import { format } from "date-fns";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

const getLoadText = (date, tomorrow) => {
  if (date < tomorrow) return "Loaded";
  return "Load";
};

const formatDate = (date, today, tomorrow) => {
  if (date === tomorrow) return "Today";
  if (date === today) return "Yesterday";
  return format(date, "MM-dd-yyyy");
};

const formatReturnDate = (returnDate, today, tomorrow) => {
  if (returnDate === today) return "Today";
  if (returnDate === tomorrow) return "Tomorrow";
  return format(returnDate, "MM-dd-yyyy");
};

const LoadingListHeader = ({
  loadingList,
  handleEdit,
  handleDelete,
  handleCopy,
}) => {
  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const formattedTomorrow = tomorrow.toISOString().split("T")[0];

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: 2,
        borderBottom: "2px solid #ccc",
        backgroundColor: "#f5f5f5",
        borderRadius: 2,
        boxShadow: 2,
        marginTop: 4,
        marginBottom: 4,
      }}
    >
      <Typography variant="h4" fontWeight="bold">
        {loadingList.site_name}
      </Typography>
      <Typography variant="h5" fontWeight="bold">
        {loadingList.team?.name || "Loading..."}
      </Typography>
      <Typography variant="h6">
        {getLoadText(loadingList.date, today, formattedTomorrow)}:{" "}
        {formatDate(loadingList.date, today, formattedTomorrow)}
      </Typography>
      <Typography variant="h6">
        Returns:{" "}
        {formatReturnDate(loadingList.return_date, today, formattedTomorrow)}
      </Typography>
      <Typography variant="h6">{loadingList.notes}</Typography>
      <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<EditIcon />}
          onClick={handleEdit}
        >
          Edit
        </Button>
        <Button
          variant="contained"
          color="secondary"
          startIcon={<ContentCopyIcon />}
          onClick={handleCopy}
        >
          Copy List
        </Button>
        <Button
          variant="contained"
          color="error"
          startIcon={<DeleteIcon />}
          onClick={handleDelete}
        >
          Delete
        </Button>
      </Stack>
    </Box>
  );
};

export default LoadingListHeader;

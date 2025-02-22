import { Box, Typography, Button, Stack, Alert } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { getLoadText, formatDate, formatReturnDate } from "../../utils/helpers";

const LoadingListHeader = ({
  loadingList,
  handleEdit,
  handleDelete,
  handleCopy,
  error,
  today,
  formattedTomorrow,
}) => {
  return (
    <Box sx={{ mb: 4 }}>
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
        {error && (
          <Alert severity="error" sx={{ width: "20%", mt: 2 }}>
            {error}
          </Alert>
        )}
      </Box>
    </Box>
  );
};

export default LoadingListHeader;

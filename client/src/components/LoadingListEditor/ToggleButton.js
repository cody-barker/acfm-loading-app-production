import { Box, Button } from "@mui/material";

function ToggleButton({ isExpanded, setIsExpanded }) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        maxHeight: "72vh",
        minWidth: "auto"
      }}
    >
      <Button
        variant="contained"
        color="primary"
        onClick={() => setIsExpanded(!isExpanded)}
        sx={{
          height: "100%",
          writingMode: "vertical-rl",
          transform: "rotate(180deg)",
          padding: "4px",
          minWidth: "auto"
        }}
      >
        {isExpanded ? "▶ Collapse Inventory" : "◀ Expand Inventory"}
      </Button>
    </Box>
  );
}

export default ToggleButton;

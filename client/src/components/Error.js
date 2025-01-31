import React from "react";
import { Alert } from "@mui/material";

function Error({ error }) {
  return (
    <Alert severity="error" sx={{ mb: 2 }}>
      {error}
    </Alert>
  );
}

export default Error;

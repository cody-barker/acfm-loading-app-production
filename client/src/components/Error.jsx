import React from "react";
import { Alert, Stack } from "@mui/material";

function Error({ error }) {
  const errors = Array.isArray(error) ? error : [error];

  return (
    <Stack spacing={1} sx={{ width: "100%", mb: 2 }}>
      {errors.map((err, index) => (
        <Alert key={index} severity="error">
          {err}
        </Alert>
      ))}
    </Stack>
  );
}

export default Error;

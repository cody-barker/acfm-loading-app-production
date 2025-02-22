import React from "react";
import { Box, Paper, Typography } from "@mui/material";
import { Droppable } from "react-beautiful-dnd";
import PMListCard from "./PMListCard";

const KanbanColumn = ({ title, lists, columnId }) => (
  <Box
    sx={{
      minWidth: 300,
      width: { xs: "85vw", md: "33%" },
      height: "calc(100vh - 140px)", // Account for header and margins
    }}
  >
    <Paper
      elevation={2}
      sx={{
        height: "95%",
        backgroundColor: "grey.100",
        p: 2,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Typography variant="h6" sx={{ mb: 2 }}>
        {title}
      </Typography>
      <Droppable droppableId={columnId}>
        {(provided, snapshot) => (
          <Box
            ref={provided.innerRef}
            {...provided.droppableProps}
            sx={{
              flexGrow: 1,
              minHeight: "100px",
              backgroundColor: snapshot.isDraggingOver
                ? "grey.200"
                : "transparent",
              transition: "background-color 0.2s ease",
              overflowY: "auto",
              "&::-webkit-scrollbar": {
                width: "8px",
              },
              "&::-webkit-scrollbar-track": {
                backgroundColor: "rgba(0,0,0,0.1)",
                borderRadius: "4px",
              },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: "rgba(0,0,0,0.2)",
                borderRadius: "4px",
                "&:hover": {
                  backgroundColor: "rgba(0,0,0,0.3)",
                },
              },
            }}
          >
            {lists.map((list, index) => (
              <PMListCard key={list.id} list={list} index={index} />
            ))}
            {provided.placeholder}
          </Box>
        )}
      </Droppable>
    </Paper>
  </Box>
);

const PMKanbanBoard = ({ lists }) => {
  return (
    <Box
      sx={{
        display: "flex",
        gap: 2,
        height: "100%",
        width: "100%",
        overflowX: "auto",
        pb: 2,
        "&::-webkit-scrollbar": {
          height: "8px",
        },
        "&::-webkit-scrollbar-track": {
          backgroundColor: "rgba(0,0,0,0.1)",
          borderRadius: "4px",
        },
        "&::-webkit-scrollbar-thumb": {
          backgroundColor: "rgba(0,0,0,0.2)",
          borderRadius: "4px",
          "&:hover": {
            backgroundColor: "rgba(0,0,0,0.3)",
          },
        },
      }}
    >
      <KanbanColumn
        title="Past Lists"
        lists={lists.previous}
        columnId="previous"
      />
      <KanbanColumn
        title="Loaded Yesterday"
        lists={lists.today}
        columnId="today"
      />
      <KanbanColumn
        title="Loading Today"
        lists={lists.tomorrow}
        columnId="tomorrow"
      />
      <KanbanColumn
        title="Future Lists"
        lists={lists.future}
        columnId="future"
      />
    </Box>
  );
};

export default PMKanbanBoard;

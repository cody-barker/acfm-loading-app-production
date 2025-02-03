import React from "react";
import { Box, Paper, Typography } from "@mui/material";
import { Droppable } from "react-beautiful-dnd";
import PMListCard from "./PMListCard";

const KanbanColumn = ({ title, lists, columnId }) => (
  <Box
    sx={{
      minWidth: 300,
      width: { xs: "85vw", md: "33%" },
      height: "100%",
    }}
  >
    <Paper
      elevation={2}
      sx={{
        height: "100%",
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

const PMKanbanBoard = ({ lists, onListUpdate }) => {
  return (
    <Box
      sx={{
        display: "flex",
        gap: 2,
        height: "100%",
        width: "100%",
        overflowX: "auto",
        pb: 2, // Padding bottom for mobile scrollbar
      }}
    >
      <KanbanColumn
        title="Previous"
        lists={lists.previous}
        columnId="previous"
      />
      <KanbanColumn
        title="Loaded Yesterday"
        lists={lists.today}
        columnId="today"
      />
      <KanbanColumn
        title="Load Today"
        lists={lists.tomorrow}
        columnId="tomorrow"
      />
    </Box>
  );
};

export default PMKanbanBoard;

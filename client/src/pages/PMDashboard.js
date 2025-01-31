import React, { useState, useEffect } from "react";
import { Box, Container } from "@mui/material";
import { DragDropContext } from "react-beautiful-dnd";
import PMKanbanBoard from "../components/pm/PMKanbanBoard";
import CreateListButton from "../components/pm/CreateListButton";

const PMDashboard = () => {
  const [lists, setLists] = useState({
    previous: [],
    today: [],
    tomorrow: [],
  });

  const fetchLoadingLists = async () => {
    try {
      const response = await fetch("/api/loading_lists");
      const data = await response.json();
      categorizeLists(data);
    } catch (error) {
      console.error("Error fetching lists:", error);
    }
  };

  useEffect(() => {
    fetchLoadingLists();
  }, []);

  const categorizeLists = (lists) => {
    // Start of today in user's timezone
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const categorized = lists.reduce(
      (acc, list) => {
        // Convert the list date to start of day in user's timezone
        const listDate = new Date(list.date);
        listDate.setHours(0, 0, 0, 0);

        if (listDate < today) {
          acc.previous.push(list);
        } else if (listDate.getTime() === today.getTime()) {
          acc.today.push(list);
        } else if (listDate.getTime() === tomorrow.getTime()) {
          acc.tomorrow.push(list);
        }
        return acc;
      },
      { previous: [], today: [], tomorrow: [] }
    );

    setLists(categorized);
  };

  const handleDragEnd = (result) => {
    // Implement drag and drop logic between columns
  };

  return (
    <Container maxWidth="xl">
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          padding: 2,
        }}
      >
        <CreateListButton onListCreated={fetchLoadingLists} />
        <DragDropContext onDragEnd={handleDragEnd}>
          <Box
            sx={{
              display: "flex",
              gap: 2,
              flexGrow: 1,
              overflowX: { xs: "auto", md: "hidden" },
              padding: 2,
            }}
          >
            <PMKanbanBoard lists={lists} onListUpdate={fetchLoadingLists} />
          </Box>
        </DragDropContext>
      </Box>
    </Container>
  );
};

export default PMDashboard;

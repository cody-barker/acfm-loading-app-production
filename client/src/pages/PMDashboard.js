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
    // Get start of today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get start of tomorrow
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get date from 7 days ago
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const categorized = lists.reduce(
      (acc, list) => {
        // Convert list date to local date at midnight
        const listDate = new Date(list.date + "T00:00:00");

        // Compare dates
        const isToday = listDate.toDateString() === today.toDateString();
        const isTomorrow = listDate.toDateString() === tomorrow.toDateString();
        const isWithinPastWeek = listDate >= sevenDaysAgo && listDate < today;

        if (isToday) {
          acc.today.push(list);
        } else if (isTomorrow) {
          acc.tomorrow.push(list);
        } else if (isWithinPastWeek) {
          acc.previous.push(list);
        }
        return acc;
      },
      { previous: [], today: [], tomorrow: [] }
    );

    // Sort today and tomorrow lists by team_id ascending
    categorized.today.sort((a, b) => a.team_id - b.team_id);
    categorized.tomorrow.sort((a, b) => a.team_id - b.team_id);

    // Sort previous lists by date descending
    categorized.previous.sort((a, b) => new Date(b.date) - new Date(a.date));

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

import React, {
  useState,
  useEffect,
  useContext,
  useCallback,
  useMemo,
} from "react";
import {
  Box,
  Container,
  TextField,
  Stack,
  IconButton,
  InputAdornment,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import { DragDropContext } from "react-beautiful-dnd";
import PMKanbanBoard from "../components/pm/PMKanbanBoard";
import CreateListButton from "../components/pm/CreateListButton";
import { LoadingListsContext } from "../contexts/LoadingListsContext";
import { TeamsContext } from "../contexts/TeamsContext";

const useDateRanges = () => {
  return useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const daysAhead = new Date(today);
    daysAhead.setDate(daysAhead.getDate() + 30);

    return {
      today,
      tomorrow,
      sevenDaysAgo,
      daysAhead,
      isSameDay: (date1, date2) =>
        date1.toDateString() === date2.toDateString(),
    };
  }, []);
};

const PMDashboard = () => {
  const [lists, setLists] = useState({
    previous: [],
    today: [],
    tomorrow: [],
    future: [],
  });
  const [filters, setFilters] = useState({
    siteNameFilter: "",
    dateFilter: "",
    teamFilter: "",
  });

  const { loadingLists } = useContext(LoadingListsContext);
  const { teams } = useContext(TeamsContext);
  const dateRanges = useDateRanges();

  const filterLists = useCallback(
    (lists) => {
      return lists.filter((list) => {
        const matchesSiteName = filters.siteNameFilter
          ? list.site_name
              .toLowerCase()
              .includes(filters.siteNameFilter.toLowerCase())
          : true;

        const matchesDate = filters.dateFilter
          ? list.date === filters.dateFilter
          : true;

        const matchesTeam = filters.teamFilter
          ? list.team_id === filters.teamFilter
          : true;

        return matchesSiteName && matchesDate && matchesTeam;
      });
    },
    [filters]
  );

  const categorizeLists = useCallback(
    (lists) => {
      const filteredLists = filterLists(lists);

      const categorized = filteredLists.reduce(
        (acc, list) => {
          const listDate = new Date(list.date + "T00:00:00");

          const isToday = dateRanges.isSameDay(listDate, dateRanges.today);
          const isTomorrow = dateRanges.isSameDay(
            listDate,
            dateRanges.tomorrow
          );
          const isWithinPastWeek =
            listDate >= dateRanges.sevenDaysAgo && listDate < dateRanges.today;
          const isInFuture =
            listDate <= dateRanges.daysAhead && listDate > dateRanges.tomorrow;

          if (isToday) {
            acc.today.unshift(list);
          } else if (isTomorrow) {
            acc.tomorrow.unshift(list);
          } else if (isWithinPastWeek) {
            acc.previous.unshift(list);
          } else if (isInFuture) {
            acc.future.unshift(list);
          }
          return acc;
        },
        { previous: [], today: [], tomorrow: [], future: [] }
      );

      categorized.today.sort((a, b) => a.team_id - b.team_id);
      categorized.tomorrow.sort((a, b) => a.team_id - b.team_id);
      categorized.previous.sort((a, b) => new Date(b.date) - new Date(a.date));
      categorized.future.sort((a, b) => new Date(a.date) - new Date(b.date));

      setLists(categorized);
    },
    [filterLists, dateRanges]
  );

  useEffect(() => {
    categorizeLists(loadingLists);
  }, [categorizeLists, loadingLists]);

  const handleNewList = (newList) => {
    const listDate = new Date(newList.date + "T00:00:00");

    if (dateRanges.isSameDay(listDate, dateRanges.today)) {
      setLists((prev) => ({
        ...prev,
        today: [...prev.today, newList].sort((a, b) => a.team_id - b.team_id),
      }));
    } else if (dateRanges.isSameDay(listDate, dateRanges.tomorrow)) {
      setLists((prev) => ({
        ...prev,
        tomorrow: [...prev.tomorrow, newList].sort(
          (a, b) => a.team_id - b.team_id
        ),
      }));
    } else if (
      listDate >= dateRanges.sevenDaysAgo &&
      listDate < dateRanges.today
    ) {
      setLists((prev) => ({
        ...prev,
        previous: [...prev.previous, newList].sort(
          (a, b) => new Date(b.date) - new Date(a.date)
        ),
      }));
    } else if (
      listDate <= dateRanges.daysAhead &&
      listDate > dateRanges.tomorrow
    ) {
      setLists((prev) => ({
        ...prev,
        future: [...prev.future, newList].sort(
          (a, b) => new Date(b.date) + new Date(a.date)
        ),
      }));
    }
  };

  return (
    <Container
      maxWidth="xl"
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <Box sx={{ mb: 4, mt: 4 }}>
        <Stack
          direction="row"
          spacing={2}
          sx={{ mb: 2, ml: 2 }}
          alignItems="center"
        >
          <TextField
            label="Filter by Site Name"
            value={filters.siteNameFilter}
            onChange={(e) => {
              setFilters((prev) => ({
                ...prev,
                siteNameFilter: e.target.value,
              }));
            }}
            size="small"
            InputProps={{
              endAdornment: filters.siteNameFilter && (
                <InputAdornment position="end">
                  <Tooltip title="Clear filter">
                    <IconButton
                      size="small"
                      onClick={() => {
                        setFilters((prev) => ({ ...prev, siteNameFilter: "" }));
                      }}
                    >
                      <ClearIcon />
                    </IconButton>
                  </Tooltip>
                </InputAdornment>
              ),
            }}
          />
          <TextField
            label="Filter by Date"
            type="date"
            value={filters.dateFilter}
            onChange={(e) => {
              setFilters((prev) => ({ ...prev, dateFilter: e.target.value }));
            }}
            size="small"
            InputLabelProps={{
              shrink: true,
            }}
            InputProps={{
              endAdornment: filters.dateFilter && (
                <InputAdornment position="end">
                  <Tooltip title="Clear filter">
                    <IconButton
                      size="small"
                      onClick={() => {
                        setFilters((prev) => ({ ...prev, dateFilter: "" }));
                      }}
                    >
                      <ClearIcon />
                    </IconButton>
                  </Tooltip>
                </InputAdornment>
              ),
            }}
          />
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Filter by Team</InputLabel>
            <Select
              value={filters.teamFilter}
              onChange={(e) => {
                setFilters((prev) => ({
                  ...prev,
                  teamFilter: e.target.value,
                }));
              }}
              label="Filter by Team"
              endAdornment={
                filters.teamFilter && (
                  <InputAdornment position="end" sx={{ mr: 2 }}>
                    <Tooltip title="Clear filter">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFilters((prev) => ({ ...prev, teamFilter: "" }));
                        }}
                      >
                        <ClearIcon />
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                )
              }
            >
              {teams.map((team) => (
                <MenuItem key={team.id} value={team.id}>
                  {team.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <CreateListButton onNewList={handleNewList} />
        </Stack>
        <DragDropContext>
          <Box sx={{ flexGrow: 1, overflow: "hidden" }}>
            <PMKanbanBoard lists={lists} />
          </Box>
        </DragDropContext>
      </Box>
    </Container>
  );
};

export default PMDashboard;

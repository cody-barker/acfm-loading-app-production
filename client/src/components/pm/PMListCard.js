import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  Typography,
  CardActionArea,
  Box,
  Chip,
} from "@mui/material";
import { Draggable } from "react-beautiful-dnd";

const PMListCard = ({ list, index }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/loading-lists/${list.id}`);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString + "T00:00:00");
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    });
  };

  return (
    <Draggable draggableId={String(list.id)} index={index}>
      {(provided, snapshot) => (
        <Card
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          sx={{
            mb: 2,
            transform: snapshot.isDragging ? "rotate(3deg)" : "none",
            transition: "transform 0.2s ease",
            "&:hover": {
              boxShadow: 3,
            },
          }}
        >
          <CardActionArea onClick={handleClick}>
            <CardContent>
              <Typography variant="h6" component="div" gutterBottom>
                {list.site_name}
              </Typography>
              <Typography
                variant="h6"
                component="div"
                gutterBottom
                sx={{ mb: 1 }}
              >
                {`${list.team.name}`}
              </Typography>

              <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
                <Chip
                  label={formatDate(list.date)}
                  size="small"
                  color="primary"
                />
                {list.return_date && (
                  <Chip
                    label={`Return: ${formatDate(list.return_date)}`}
                    size="small"
                    variant="outlined"
                  />
                )}
              </Box>

              {list.notes && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {list.notes}
                </Typography>
              )}

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  mt: 1,
                }}
              >
                {/* <Typography variant="caption" color="text.secondary">
                  Items: {list.count || 0}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Total Qty: {list.total_quantity || 0}
                </Typography> */}
              </Box>
            </CardContent>
          </CardActionArea>
        </Card>
      )}
    </Draggable>
  );
};

export default PMListCard;

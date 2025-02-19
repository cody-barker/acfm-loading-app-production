import { memo } from "react";
import { Card, CardContent, Typography } from "@mui/material";

export const ItemCard = memo(({ item, returningCount, provided }) => {
  const inStockCount = item.quantity;
  const repairCount = item.repair_quantity || 0;
  const availableCount = inStockCount + returningCount - repairCount;
  const inStockColor = availableCount < 0 ? "red" : "black";

  return (
    <Card
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      sx={{
        marginBottom: 1,
        borderRadius: 2,
        boxShadow: 1,
        maxWidth: "95%",
        "&:hover": {
          transform: "translateY(-2px)",
        },
      }}
    >
      <CardContent>
        <Typography variant="body1">{item.name}</Typography>
        <Typography variant="body2" sx={{ color: inStockColor }}>
          In Stock: {inStockCount}
        </Typography>
        <Typography variant="body2">
          Returning today: {returningCount}
        </Typography>
        <Typography variant="body2">In Repair: {repairCount}</Typography>
        <Typography variant="body2" sx={{ color: inStockColor }}>
          Available: {availableCount}
        </Typography>
      </CardContent>
    </Card>
  );
});

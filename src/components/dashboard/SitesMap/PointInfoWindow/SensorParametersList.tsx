import { FC, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Stack,
  Select,
  MenuItem,
  IconButton,
  FormControl,
  useTheme,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";

interface SensorParametersListProps {
  status: Record<string, any>;
  onStatusClick: (keys: string[]) => void;
  appliedFilter?: {
    startDateTime: string | null;
    endDateTime: string | null;
  };
}

const labelMapping: Record<string, string> = {
  vibrationAngle: "Vibration Angle",
  vibrationDisplacement: "Vibration Displacement",
  vibrationFrequency: "Vibration Frequency",
  vibrationRollAngle: "Vibration Roll Angle",
  vibrationPitchAngle: "Vibration Pitch Angle",
  vibrationSpeed: "Vibration Speed",
  windDirection: "Wind Direction",
  windHumidity: "Humidity",
  windSpeed: "Wind Speed",
  windTemperature: "Temperature",
};

export const SensorParametersList: FC<SensorParametersListProps> = ({
  status,
  onStatusClick,
}) => {
  const theme = useTheme();
  const [rows, setRows] = useState<string[]>([""]);

  const availableKeys = Object.keys(status);

  const handleRowChange = (index: number, value: string) => {
    setRows((prev) => prev.map((r, i) => (i === index ? value : r)));
  };

  const handleAdd = () => {
    setRows((prev) => [...prev, ""]);
  };

  const handleRemove = (index: number) => {
    setRows((prev) => {
      const next = prev.filter((_, i) => i !== index);
      return next.length === 0 ? [""] : next;
    });
  };

  const handleConfirm = () => {
    const selected = rows.filter((r) => r !== "");
    if (selected.length > 0) {
      onStatusClick(selected);
      setRows([""]);
    }
  };

  const selectedKeys = rows.filter((r) => r !== "");
  const allSelected = availableKeys.every((k) => rows.includes(k));
  const hasEmptyRow = rows.some((r) => r === "");
  const canAdd = !hasEmptyRow && !allSelected;

  return (
    <Box sx={{ p: 1 }}>
      <Typography
        variant="overline"
        sx={{
          color: "text.secondary",
          fontWeight: 600,
          letterSpacing: 0.5,
          fontSize: "0.65rem",
          display: "block",
          mb: 1,
        }}
      >
        PARAMETERS
      </Typography>

      <Stack spacing={0.75}>
        {rows.map((row, index) => (
          <Stack key={index} direction="row" spacing={0.5} alignItems="center">
            <FormControl fullWidth size="small">
              <Select
                value={row}
                onChange={(e) => handleRowChange(index, e.target.value as string)}
                displayEmpty
                sx={{
                  fontSize: "0.75rem",
                  "& .MuiSelect-select": { py: 0.6 },
                }}
              >
                <MenuItem value="" disabled sx={{ fontSize: "0.75rem", color: "text.disabled" }}>
                  Select parameter…
                </MenuItem>
                {availableKeys
                  .filter((k) => !rows.includes(k) || k === row)
                  .map((k) => (
                    <MenuItem key={k} value={k} sx={{ fontSize: "0.75rem" }}>
                      {labelMapping[k] ?? k}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>

            <IconButton
              size="small"
              onClick={() => handleRemove(index)}
              disabled={rows.length === 1 && row === ""}
              sx={{
                flexShrink: 0,
                color: "text.secondary",
                "&:hover": { color: "error.main" },
              }}
            >
              <CloseIcon sx={{ fontSize: "0.9rem" }} />
            </IconButton>
          </Stack>
        ))}
      </Stack>

      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mt: 1 }}
      >
        <Button
          size="small"
          startIcon={<AddIcon sx={{ fontSize: "0.85rem !important" }} />}
          onClick={handleAdd}
          disabled={!canAdd}
          sx={{
            fontSize: "0.7rem",
            textTransform: "none",
            color: theme.palette.primary.main,
            px: 0.5,
          }}
        >
          Add
        </Button>

        <Button
          variant="contained"
          size="small"
          onClick={handleConfirm}
          disabled={selectedKeys.length === 0}
          disableElevation
          sx={{
            textTransform: "none",
            px: 1.5,
            py: 0.4,
            fontSize: "0.7rem",
            minWidth: 0,
          }}
        >
          Ok
        </Button>
      </Stack>
    </Box>
  );
};

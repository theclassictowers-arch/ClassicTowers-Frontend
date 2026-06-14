import { Dispatch, FC } from "react";
import { Box, Button, Typography, useTheme } from "@mui/material";

interface SensorParametersListProps {
  status: Record<string, any>;
  onStatusClick: Dispatch<string[]>;
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
  windHumidity: "Humidity",
  windSpeed: "Wind Speed",
  windTemperature: "Temperature",
};

const hiddenParameters = new Set(["windDirection"]);

export const SensorParametersList: FC<SensorParametersListProps> = ({
  status,
  onStatusClick,
}) => {
  const theme = useTheme();
  const availableKeys = Object.keys(status).filter(
    (key) => !hiddenParameters.has(key)
  );

  return (
    <Box sx={{ p: 1, backgroundColor: theme.palette.background.default }}>
      <Typography
        variant="overline"
        sx={{
          color: "text.secondary",
          fontWeight: 600,
          letterSpacing: 0.5,
          fontSize: "0.65rem",
          display: "block",
          mb: 0.75,
        }}
      >
        PARAMETERS
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: 0.6,
        }}
      >
        {availableKeys.map((key) => (
          <Button
            key={key}
            size="small"
            variant="outlined"
            onClick={() => onStatusClick([key])}
            sx={{
              minWidth: 0,
              justifyContent: "flex-start",
              textAlign: "left",
              textTransform: "none",
              fontSize: "0.68rem",
              lineHeight: 1.1,
              px: 0.75,
              py: 0.55,
              borderColor: theme.palette.divider,
              color: "text.secondary",
              bgcolor: "background.paper",
              whiteSpace: "normal",
              wordBreak: "break-word",
              "&:hover": {
                borderColor: theme.palette.primary.main,
                color: theme.palette.primary.main,
                bgcolor: theme.palette.action.hover,
              },
            }}
          >
            {labelMapping[key] ?? key}
          </Button>
        ))}

        {availableKeys.length === 0 && (
          <Typography
            sx={{
              gridColumn: "1 / -1",
              color: "text.secondary",
              fontSize: "0.72rem",
              textAlign: "center",
              py: 0.75,
            }}
          >
            No parameters available
          </Typography>
        )}
      </Box>
    </Box>
  );
};

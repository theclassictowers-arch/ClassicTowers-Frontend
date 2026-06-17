// @ts-nocheck
import { Dispatch, FC } from "react";
import { Button, Typography, useTheme } from "@mui/material";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import ThreeDRotationIcon from "@mui/icons-material/ThreeDRotation";

interface SensorParametersListProps {
  status: Record<string, any>;
  onStatusClick: Dispatch<string[]>;
  onViewChange?: Dispatch<"graph" | "3d">;
  appliedFilter?: {
    startDateTime: string | null;
    endDateTime: string | null;
  };
  selectedParameters?: string[];
  activeView?: "graph" | "3d";
}

const labelMapping: Record<string, string> = {
  vibrationAngle: "Yaw Angle",
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
  onViewChange,
  selectedParameters = [],
  activeView = "graph",
}) => {
  const theme = useTheme();
  const availableKeys = Object.keys(status).filter(
    (key) => !hiddenParameters.has(key)
  );

  return (
    <div style={{ padding: 8, backgroundColor: theme.palette.background.default }}>
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

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: 5,
        }}
      >
        {availableKeys.map((key) => {
          const isSelected = selectedParameters.includes(key);

          return (
            <Button
              key={key}
              size="small"
              variant={isSelected ? "contained" : "outlined"}
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
                borderColor: isSelected
                  ? theme.palette.primary.main
                  : theme.palette.divider,
                color: isSelected
                  ? theme.palette.primary.contrastText
                  : "text.secondary",
                bgcolor: isSelected
                  ? theme.palette.primary.main
                  : "background.paper",
                whiteSpace: "normal",
                wordBreak: "break-word",
                "&:hover": {
                  borderColor: theme.palette.primary.main,
                  color: isSelected
                    ? theme.palette.primary.contrastText
                    : theme.palette.primary.main,
                  bgcolor: isSelected
                    ? theme.palette.primary.dark
                    : theme.palette.action.hover,
                },
              }}
            >
              {labelMapping[key] ?? key}
            </Button>
          );
        })}

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
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1.15fr)",
          gap: 5,
          marginTop: 6,
        }}
      >
        {(["graph", "3d"] as const).map((mode) => {
          const isActive = activeView === mode;
          const isGraphMode = mode === "graph";
          const label = isGraphMode ? "Graph" : "3D Tower";
          const Icon = isGraphMode ? ShowChartIcon : ThreeDRotationIcon;

          return (
            <Button
              key={mode}
              size="small"
              variant={isActive ? "contained" : "outlined"}
              onClick={() => onViewChange?.(mode)}
              disabled={isGraphMode && selectedParameters.length === 0}
              sx={{
                alignItems: "center",
                display: "inline-flex",
                gap: 0.5,
                textTransform: "none",
                fontSize: "0.7rem",
                fontWeight: 700,
                py: 0.25,
                borderRadius: 0.75,
                borderColor: isActive
                  ? theme.palette.success.main
                  : theme.palette.success.main,
                color: isActive
                  ? theme.palette.success.contrastText
                  : theme.palette.success.main,
                bgcolor: isActive
                  ? theme.palette.success.main
                  : "background.paper",
                "&:hover": {
                  borderColor: theme.palette.success.dark,
                  bgcolor: isActive
                    ? theme.palette.success.dark
                    : theme.palette.action.hover,
                },
              }}
            >
              <Icon sx={{ fontSize: "0.92rem" }} />
              {label}
            </Button>
          );
        })}
      </div>
    </div>
  );
};

import { FC, useMemo } from "react";
import { DataVisualizationHeader } from "./RealTimeDataVisualization/DataVisualizationHeader";
import { Box, CircularProgress, Portal, Typography } from "@mui/material";
import { RealTimeLineChart } from "./RealTimeDataVisualization/RealTimeLineChart";
import { Tower3DView } from "./Tower3DView";

interface SensorDataModalProps {
  open: boolean;
  onClose: () => void;
  sensorData: any;
  isSensorDataLoading: boolean;
  sensorDataError: any;
  sensorParameters: string[];
  refetchLatestData: () => void;
  siteName: string;
  viewMode: "graph" | "3d";
}

const labelMapping: Record<string, string> = {
  vibrationAngle: "Yaw Angle",
  vibrationDisplacement: "Vibration Displacement",
  vibrationFrequency: "Vibration Frequency",
  vibrationRollAngle: "Vibration Roll Angle",
  vibrationPitchAngle: "Vibration Pitch Angle",
  vibrationSpeed: "Vibration Speed",
  windSpeed: "Wind Speed",
  windHumidity: "Humidity",
  windTemperature: "Temperature",
};

const trendColors = [
  "#2563eb",
  "#16a34a",
  "#f97316",
  "#dc2626",
  "#7c3aed",
  "#0891b2",
  "#ca8a04",
  "#db2777",
  "#4f46e5",
  "#059669",
];

const toNumericValue = (value: any) => {
  const numericValue = parseFloat(value);
  return Number.isFinite(numericValue) ? numericValue : undefined;
};

export const SensorDataModal: FC<SensorDataModalProps> = ({
  open,
  onClose,
  sensorData,
  isSensorDataLoading,
  sensorDataError,
  sensorParameters,
  refetchLatestData,
  siteName,
  viewMode,
}) => {
  const rawDataArray = useMemo(
    () => (Array.isArray(sensorData) ? sensorData : [sensorData]),
    [sensorData]
  );
  const limits = rawDataArray[0]?.limits;
  const allProcessedData = useMemo(
    () => rawDataArray.flatMap((item) => item?.processedSensorData || []),
    [rawDataArray]
  );

  const sensorDataForGraphs = useMemo(
    () =>
      allProcessedData?.map((data: any) => {
        const timestamp = data.createdAt || `${data.date}T${data.time}Z`;
        const dateObj = new Date(timestamp);
        const formattedTime = dateObj.toLocaleTimeString("en-GB", {
          hour12: false,
        });

        return {
          ...data,
          date: data.date,
          time: formattedTime,
        };
      }),
    [allProcessedData]
  );

  const unifiedChartData = useMemo(() => {
    const timeMap: Record<string, any> = {};

    sensorDataForGraphs?.forEach((item: any) => {
      const timeKey = `${item.date} ${item.time}`;
      if (!timeMap[timeKey]) {
        timeMap[timeKey] = { date: item.date, time: item.time };
      }

      const paramKey = item.parameter || "unknown";
      const singleValue = toNumericValue(item.value);

      if (singleValue !== undefined) {
        timeMap[timeKey][paramKey] = singleValue;
      } else {
        (["x", "y", "z"] as const).forEach((axis) => {
          const axisValue = toNumericValue(item[axis]);
          if (axisValue !== undefined) {
            timeMap[timeKey][`${paramKey}_${axis}`] = axisValue;
          }
        });
      }
    });

    return Object.values(timeMap).sort((a: any, b: any) =>
      `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`)
    );
  }, [sensorDataForGraphs]);

  const selectedTrendKeys = useMemo(() => {
    let colorIndex = 0;

    return sensorParameters.flatMap((param) => {
      const samples = sensorDataForGraphs?.filter(
        (data: any) => data.parameter === param
      );
      const label = labelMapping[param] || param;
      const getNextColor = () => trendColors[colorIndex++ % trendColors.length];
      const hasSingleValue = samples?.some(
        (data: any) => toNumericValue(data.value) !== undefined
      );
      const availableAxes = (["x", "y", "z"] as const).filter((axis) =>
        samples?.some((data: any) => toNumericValue(data[axis]) !== undefined)
      );

      if (hasSingleValue || availableAxes.length === 0) {
        return [{ key: param, color: getNextColor(), label }];
      }

      return availableAxes.map((axis) => ({
        key: `${param}_${axis}`,
        color: getNextColor(),
        label: `${label} (${axis.toUpperCase()})`,
      }));
    });
  }, [sensorDataForGraphs, sensorParameters]);

  const latestAngles = useMemo(() => {
    const latest = [...unifiedChartData]
      .reverse()
      .find((item: any) =>
        ["vibrationRollAngle", "vibrationPitchAngle", "vibrationAngle"].some(
          (key) => typeof item[key] === "number"
        )
      ) as any;

    return {
      roll: latest?.vibrationRollAngle,
      pitch: latest?.vibrationPitchAngle,
      yaw: latest?.vibrationAngle,
    };
  }, [unifiedChartData]);

  if (!open) return null;

  const panelSx = {
    position: "fixed",
    top: { xs: 72, md: 64 },
    right: { xs: 8, md: 12 },
    bottom: { xs: 8, md: 12 },
    width: { xs: "calc(100vw - 16px)", sm: 480, md: 560, lg: 640 },
    maxWidth: { xs: "calc(100vw - 16px)", sm: "calc(100vw - 24px)" },
    zIndex: 1301,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    border: "1px solid",
    borderColor: "divider",
    borderRadius: 2,
    bgcolor: "background.default",
    boxShadow: "0 18px 42px rgba(15, 23, 42, 0.28)",
    pointerEvents: "auto",
  } as const;

  const bodySx = {
    flex: 1,
    minHeight: 0,
    p: 1,
    display: "flex",
    flexDirection: "column",
  } as const;

  const renderBody = () => {
    if (viewMode === "3d") {
      return <Tower3DView {...latestAngles} />;
    }

    if (isSensorDataLoading) {
      return (
        <Box display="flex" alignItems="center" justifyContent="center" flex={1}>
          <CircularProgress />
        </Box>
      );
    }

    if (sensorDataError) {
      return (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          flex={1}
          px={2}
        >
          <Typography variant="body1" fontFamily="monospace" color="error">
            SYSTEM ERROR: Check connection
          </Typography>
        </Box>
      );
    }

    if (unifiedChartData.length === 0) {
      return (
        <Box display="flex" alignItems="center" justifyContent="center" flex={1}>
          <Typography
            variant="body2"
            color="text.disabled"
            sx={{ fontStyle: "italic", textAlign: "center" }}
          >
            No correlated data found for the selected time range.
          </Typography>
        </Box>
      );
    }

    return (
      <>
        <Typography
          variant="subtitle2"
          sx={{ mb: 0.75, fontWeight: "bold", color: "text.secondary" }}
        >
          Selected Trends ({selectedTrendKeys.length})
        </Typography>
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 1.25,
            bgcolor: "background.paper",
            overflow: "hidden",
          }}
        >
          <Box sx={{ flex: 1, minHeight: 0, p: 0.35 }}>
            <RealTimeLineChart
              sensorData={unifiedChartData}
              dataKeys={selectedTrendKeys}
              sensorParameter={sensorParameters.join(",")}
              yAxisLabel="Value"
              limits={limits}
              compact
            />
          </Box>
        </Box>
      </>
    );
  };

  return (
    <Portal>
      <Box sx={panelSx}>
        <DataVisualizationHeader
          isLoading={viewMode === "graph" && isSensorDataLoading}
          refetchLatestData={refetchLatestData}
          onClose={onClose}
          siteName={siteName}
        />
        <Box sx={bodySx}>{renderBody()}</Box>
      </Box>
    </Portal>
  );
};

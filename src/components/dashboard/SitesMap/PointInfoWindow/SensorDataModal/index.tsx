import { FC, useMemo } from "react";
import { DataVisualizationHeader } from "./RealTimeDataVisualization/DataVisualizationHeader";
import { Box, CircularProgress, Portal, Typography } from "@mui/material";
import { RealTimeLineChart } from "./RealTimeDataVisualization/RealTimeLineChart";

interface SensorDataModalProps {
  open: boolean;
  onClose: () => void;
  sensorData: any;
  isSensorDataLoading: boolean;
  sensorDataError: any;
  sensorParameters: string[];
  refetchLatestData: () => void;
  siteName: string;
}

const labelMapping: Record<string, string> = {
  vibrationAngle: "Vibration Angle",
  vibrationDisplacement: "Vibration Displacement",
  vibrationFrequency: "Vibration Frequency",
  vibrationRollAngle: "Vibration Roll Angle",
  vibrationPitchAngle: "Vibration Pitch Angle",
  vibrationSpeed: "Vibration Speed",
  windSpeed: "Wind Speed",
  windHumidity: "Humidity",
  windTemperature: "Temperature",
};

const trendColors = ["#2563eb", "#16a34a", "#f97316"];

export const SensorDataModal: FC<SensorDataModalProps> = ({
  open,
  onClose,
  sensorData,
  isSensorDataLoading,
  sensorDataError,
  sensorParameters,
  refetchLatestData,
  siteName,
}) => {
  const rawDataArray = Array.isArray(sensorData) ? sensorData : [sensorData];
  const limits = rawDataArray[0]?.limits;
  const allProcessedData = rawDataArray.flatMap(
    (item) => item?.processedSensorData || []
  );

  const sensorDataForGraphs = allProcessedData?.map((data: any) => {
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
  });

  const unifiedChartData = useMemo(() => {
    const timeMap: Record<string, any> = {};

    sensorDataForGraphs?.forEach((item: any) => {
      const timeKey = `${item.date} ${item.time}`;
      if (!timeMap[timeKey]) {
        timeMap[timeKey] = { date: item.date, time: item.time };
      }

      const paramKey = item.parameter || "unknown";
      if (item.value !== undefined) {
        timeMap[timeKey][paramKey] = parseFloat(item.value);
      } else {
        timeMap[timeKey][`${paramKey}_x`] = parseFloat(item.x);
        timeMap[timeKey][`${paramKey}_y`] = parseFloat(item.y);
        timeMap[timeKey][`${paramKey}_z`] = parseFloat(item.z);
      }
    });

    return Object.values(timeMap).sort((a: any, b: any) =>
      `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`)
    );
  }, [sensorDataForGraphs]);

  const splitChartConfigs = useMemo(() => {
    return sensorParameters.map((param, index) => {
      const sample = sensorDataForGraphs?.find(
        (data: any) => data.parameter === param
      );
      const label = labelMapping[param] || param;
      const baseColor = trendColors[index % trendColors.length];

      const dataKeys =
        sample && sample.value !== undefined
          ? [{ key: param, color: baseColor, label }]
          : [
              { key: `${param}_x`, color: "#f87171", label: `${label} (X)` },
              { key: `${param}_y`, color: "#fbbf24", label: `${label} (Y)` },
              { key: `${param}_z`, color: "#34d399", label: `${label} (Z)` },
            ];

      return {
        param,
        label,
        dataKeys,
      };
    });
  }, [sensorDataForGraphs, sensorParameters]);

  if (!open) return null;

  const panelSx = {
    position: "fixed",
    top: { xs: 72, md: 64 },
    right: { xs: 8, md: 12 },
    bottom: { xs: 8, md: 12 },
    width: { xs: "calc(100vw - 16px)", sm: 360, md: 390 },
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
          Last 1 Hour Trends
        </Typography>
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            display: "grid",
            gridTemplateRows: `repeat(${Math.max(
              splitChartConfigs.length,
              1
            )}, minmax(0, 1fr))`,
            gap: 0.75,
          }}
        >
          {splitChartConfigs.map((chart) => (
            <Box
              key={chart.param}
              sx={{
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
              <Typography
                sx={{
                  px: 1,
                  py: 0.45,
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  color: "text.primary",
                  borderBottom: "1px solid",
                  borderColor: "divider",
                }}
              >
                {chart.label}
              </Typography>
              <Box sx={{ flex: 1, minHeight: 0, p: 0.35 }}>
                <RealTimeLineChart
                  sensorData={unifiedChartData}
                  dataKeys={chart.dataKeys}
                  sensorParameter={chart.param}
                  yAxisLabel={chart.label}
                  limits={limits}
                  compact
                />
              </Box>
            </Box>
          ))}
        </Box>
      </>
    );
  };

  return (
    <Portal>
      <Box sx={panelSx}>
        <DataVisualizationHeader
          isLoading={isSensorDataLoading}
          refetchLatestData={refetchLatestData}
          onClose={onClose}
          siteName={siteName}
        />
        <Box sx={bodySx}>{renderBody()}</Box>
      </Box>
    </Portal>
  );
};

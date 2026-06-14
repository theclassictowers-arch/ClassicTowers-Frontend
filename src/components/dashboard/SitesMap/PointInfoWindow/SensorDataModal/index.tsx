import { FC, useMemo } from "react";
import { PLCDialog } from "./PLCDialog";
import { useTheme } from "@mui/material/styles";
import { DataVisualizationHeader } from "./RealTimeDataVisualization/DataVisualizationHeader";
import { Box, CircularProgress, Typography } from "@mui/material";
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
  const allProcessedData = rawDataArray.flatMap(item => item?.processedSensorData || []);

  const theme = useTheme();

  const sensorDataForGraphs = allProcessedData?.map((data: any) => {
    // Safe date parsing: Use createdAt if available, otherwise construct from date/time
    const timestamp = data.createdAt || `${data.date}T${data.time}Z`;
    const dateObj = new Date(timestamp);
    const formattedTime = dateObj.toLocaleTimeString("en-GB", { hour12: false });

    return {
      ...data,
      date: data.date,
      time: formattedTime,
    };
  });

  // Professional Unified Data Aggregation
  const unifiedChartData = useMemo(() => {
    const timeMap: Record<string, any> = {};

    sensorDataForGraphs?.forEach((item: any) => {
      const timeKey = `${item.date} ${item.time}`;
      if (!timeMap[timeKey]) {
        timeMap[timeKey] = { date: item.date, time: item.time };
      }

      const paramKey = item.parameter || "unknown";
      // Map values using parameter name as prefix to allow overlapping keys (x,y,z)
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

  // Dynamic Multi-Line Key Generation
  const unifiedDataKeys = useMemo(() => {
    const distinctPalette = [
      "#3bf68cff", // Bright Blue
      "#9aef44ff", // Bright Red
      "#10b981", // Emerald Green
      "#42f50bff", // Amber
    ];

    return sensorParameters.flatMap((param, index) => {
      const sample = sensorDataForGraphs?.find((d: any) => d.parameter === param);
      if (!sample) return [];

      const baseColor = distinctPalette[index % distinctPalette.length];
      const label = labelMapping[param] || param;

      if (sample.value !== undefined) {
        return [{ key: param, color: baseColor, label: label }];
      } else {
        // For multi-axis parameters, we use distinct shades
        return [
          { key: `${param}_x`, color: "#f87171", label: `${label} (X)` },
          { key: `${param}_y`, color: "#fbbf24", label: `${label} (Y)` },
          { key: `${param}_z`, color: "#34d399", label: `${label} (Z)` },
        ];
      }
    });
  }, [sensorParameters, sensorDataForGraphs, theme]);

  const splitChartConfigs = useMemo(() => {
    return sensorParameters.map((param, index) => {
      const sample = sensorDataForGraphs?.find((d: any) => d.parameter === param);
      const label = labelMapping[param] || param;
      const baseColor = ["#2563eb", "#16a34a", "#f97316"][index % 3];

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

  const shouldShowSplitCharts = sensorParameters.length > 1;

  if (isSensorDataLoading) {
    return (
      <PLCDialog open={open} onClose={onClose}>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          height="100%"
          width="100%"
        >
          <CircularProgress />
        </Box>
      </PLCDialog>
    );
  }

  if (sensorDataError) {
    return (
      <PLCDialog open={open} onClose={onClose}>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          height="100%"
          width="100%"
        >
          <Typography variant="body1" fontFamily="monospace" color="error">
            SYSTEM ERROR: Check connection
          </Typography>
        </Box>
      </PLCDialog>
    );
  }

  return (
    <PLCDialog open={open} onClose={onClose}>
      <DataVisualizationHeader
        isLoading={isSensorDataLoading}
        refetchLatestData={refetchLatestData}
        onClose={onClose}
        siteName={siteName}
      />
      <Box sx={{ flex: 1, p: 1.5, display: "flex", flexDirection: "column", minHeight: 0 }}>
        <Typography variant="subtitle2" sx={{ mb: 1.25, fontWeight: "bold", color: "text.secondary" }}>
          {shouldShowSplitCharts
            ? "Last 1 Hour Trends"
            : `Trend Analysis: ${sensorParameters.map(p => labelMapping[p] || p).join(" vs ")}`}
        </Typography>
        
        {unifiedChartData.length > 0 ? (
          shouldShowSplitCharts ? (
            <Box
              sx={{
                flex: 1,
                minHeight: 0,
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  md: "repeat(3, minmax(0, 1fr))",
                },
                gap: 1,
              }}
            >
              {splitChartConfigs.map((chart) => (
                <Box
                  key={chart.param}
                  sx={{
                    minHeight: { xs: 190, md: 0 },
                    height: { xs: 210, md: "100%" },
                    minWidth: 0,
                    display: "flex",
                    flexDirection: "column",
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 1.5,
                    bgcolor: "background.paper",
                    overflow: "hidden",
                  }}
                >
                  <Typography
                    sx={{
                      px: 1,
                      py: 0.65,
                      fontSize: "0.78rem",
                      fontWeight: 700,
                      color: "text.primary",
                      borderBottom: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    {chart.label}
                  </Typography>
                  <Box sx={{ flex: 1, minHeight: 0, p: 0.5 }}>
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
          ) : (
            <Box sx={{ flex: 1, width: "100%", minHeight: "400px" }}>
              <RealTimeLineChart
                sensorData={unifiedChartData}
                dataKeys={unifiedDataKeys}
                sensorParameter="unified_view"
                yAxisLabel={sensorParameters.map(p => labelMapping[p] || p).join(" / ")}
                limits={limits}
              />
            </Box>
          )
        ) : (
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            flex={1}
          >
            <Typography variant="h6" color="text.disabled" sx={{ fontStyle: "italic" }}>
              No correlated data found for the selected time range.
            </Typography>
          </Box>
        )}
      </Box>
    </PLCDialog>
  );
};

// @ts-nocheck
import { CSSProperties, FC, useMemo } from "react";
import { DataVisualizationHeader } from "./RealTimeDataVisualization/DataVisualizationHeader";
import { CircularProgress, Portal, Typography } from "@mui/material";
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
        [
          "vibrationRollAngle",
          "vibrationPitchAngle",
          "vibrationAngle",
          "windSpeed",
          "windDirection",
          "vibrationSpeed_x",
          "vibrationSpeed_y",
          "vibrationSpeed_z",
        ].some(
          (key) => typeof item[key] === "number"
        )
      ) as any;

    const vibrationValues = [
      latest?.vibrationSpeed_x,
      latest?.vibrationSpeed_y,
      latest?.vibrationSpeed_z,
    ].filter((value) => typeof value === "number");

    return {
      roll: latest?.vibrationRollAngle,
      pitch: latest?.vibrationPitchAngle,
      yaw: latest?.vibrationAngle,
      windSpeed: latest?.windSpeed,
      windDirection: latest?.windDirection,
      vibration:
        vibrationValues.length > 0
          ? vibrationValues.reduce((total, value) => total + Math.abs(value), 0) /
            vibrationValues.length
          : undefined,
    };
  }, [unifiedChartData]);

  if (!open) return null;

  const panelStyle: CSSProperties = {
    position: "fixed",
    top: 64,
    right: 8,
    bottom: 8,
    width: "min(640px, calc(100vw - 16px))",
    maxWidth: "calc(100vw - 16px)",
    zIndex: 1301,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    border: "1px solid rgba(148, 163, 184, 0.28)",
    borderRadius: 16,
    backgroundColor: "var(--app-bg-color, #f5f7fb)",
    boxShadow: "0 18px 42px rgba(15, 23, 42, 0.28)",
    pointerEvents: "auto",
  };

  const bodyStyle: CSSProperties = {
    flex: 1,
    minHeight: 0,
    padding: 8,
    display: "flex",
    flexDirection: "column",
  };
  const centeredStateStyle: CSSProperties = {
    alignItems: "center",
    display: "flex",
    flex: 1,
    justifyContent: "center",
  };
  const chartCardStyle: CSSProperties = {
    backgroundColor: "#fff",
    border: "1px solid rgba(148, 163, 184, 0.28)",
    borderRadius: 10,
    display: "flex",
    flex: 1,
    flexDirection: "column",
    minHeight: 0,
    minWidth: 0,
    overflow: "hidden",
  };
  const chartInnerStyle: CSSProperties = {
    flex: 1,
    minHeight: 0,
    padding: 3,
  };

  const renderBody = () => {
    if (viewMode === "3d") {
      return (
        <Tower3DView
          {...latestAngles}
          history={unifiedChartData}
          siteName={siteName}
        />
      );
    }

    if (isSensorDataLoading) {
      return (
        <div style={centeredStateStyle}>
          <CircularProgress />
        </div>
      );
    }

    if (sensorDataError) {
      return (
        <div style={{ ...centeredStateStyle, paddingInline: 16 }}>
          <Typography variant="body1" fontFamily="monospace" color="error">
            SYSTEM ERROR: Check connection
          </Typography>
        </div>
      );
    }

    if (unifiedChartData.length === 0) {
      return (
        <div style={centeredStateStyle}>
          <Typography
            variant="body2"
            color="text.disabled"
            sx={{ fontStyle: "italic", textAlign: "center" }}
          >
            No correlated data found for the selected time range.
          </Typography>
        </div>
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
        <div style={chartCardStyle}>
          <div style={chartInnerStyle}>
            <RealTimeLineChart
              sensorData={unifiedChartData}
              dataKeys={selectedTrendKeys}
              sensorParameter={sensorParameters.join(",")}
              yAxisLabel="Value"
              limits={limits}
              compact
            />
          </div>
        </div>
      </>
    );
  };

  return (
    <Portal>
      <div style={panelStyle}>
        <DataVisualizationHeader
          isLoading={viewMode === "graph" && isSensorDataLoading}
          refetchLatestData={refetchLatestData}
          onClose={onClose}
          siteName={siteName}
        />
        <div style={bodyStyle}>{renderBody()}</div>
      </div>
    </Portal>
  );
};

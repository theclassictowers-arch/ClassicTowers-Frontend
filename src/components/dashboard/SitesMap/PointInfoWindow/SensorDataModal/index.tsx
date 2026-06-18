// @ts-nocheck
import { CSSProperties, FC } from "react";
import { DataVisualizationHeader } from "./RealTimeDataVisualization/DataVisualizationHeader";
import { CircularProgress, Portal, Typography } from "@mui/material";
import { RealTimeLineChart } from "./RealTimeDataVisualization/RealTimeLineChart";
import { Tower3DView } from "./Tower3DView";
import { useSensorVisualizationData } from "./visualizationUtils";

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
  const { limits, unifiedChartData, selectedTrendKeys, latestAngles } =
    useSensorVisualizationData({ sensorData, sensorParameters });

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

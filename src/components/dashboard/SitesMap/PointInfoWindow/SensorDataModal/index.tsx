// @ts-nocheck
import { CSSProperties, FC, useState } from "react";
import { DataVisualizationHeader } from "./RealTimeDataVisualization/DataVisualizationHeader";
import { CircularProgress, Portal, Typography } from "@mui/material";
import { RealTimeLineChart } from "./RealTimeDataVisualization/RealTimeLineChart";
import { Tower3DView } from "./Tower3DView";
import { useSensorVisualizationData } from "./visualizationUtils";
import { MovableForm } from "../../../../movable-form";

interface SensorDataModalProps {
  open: boolean;
  onClose: () => void;
  sensorData: any;
  isSensorDataLoading: boolean;
  sensorDataError: any;
  sensorParameters: string[];
  refetchLatestData: () => void;
  reservedLeft?: number;
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
  reservedLeft = 12,
  siteName,
  viewMode,
}) => {
  const [isFullPage, setIsFullPage] = useState(false);
  const { limits, unifiedChartData, selectedTrendKeys, latestAngles } =
    useSensorVisualizationData({ sensorData, sensorParameters });

  if (!open) return null;

  const panelStyle: CSSProperties = {
    display: "flex",
    flexDirection: "column",
    height: "100%",
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
      <MovableForm
        panelId={`sensor-${viewMode}-window-v2`}
        initialWidth={viewMode === "3d" ? 780 : 680}
        initialHeight={viewMode === "3d" ? 680 : 560}
        minWidth={380}
        minHeight={360}
        maxWidth={1200}
        maxHeight={900}
        initialPosition={{ x: Math.max(470, window.innerWidth - 720), y: 64 }}
        isFullPage={isFullPage}
        onFullPageChange={setIsFullPage}
        reservedLeft={reservedLeft}
        zIndex={1210}
      >
        <div style={panelStyle}>
          <DataVisualizationHeader
            isLoading={viewMode === "graph" && isSensorDataLoading}
            refetchLatestData={refetchLatestData}
            onClose={onClose}
            onOpenFullPage={() => setIsFullPage((current) => !current)}
            isFullPage={isFullPage}
            siteName={siteName}
          />
          <div style={bodyStyle}>{renderBody()}</div>
        </div>
      </MovableForm>
    </Portal>
  );
};

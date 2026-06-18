// @ts-nocheck
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useList } from "@refinedev/core";
import { ThemedLayoutContext } from "@refinedev/mui";
import {
  Box,
  Button,
  CircularProgress,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import ThreeDRotationIcon from "@mui/icons-material/ThreeDRotation";
import RefreshIcon from "@mui/icons-material/Refresh";
import FitScreenIcon from "@mui/icons-material/FitScreen";
import { useSearchParams } from "react-router-dom";
import dayjs from "dayjs";
import { RealTimeLineChart } from "../../components/dashboard/SitesMap/PointInfoWindow/SensorDataModal/RealTimeDataVisualization/RealTimeLineChart";
import { Tower3DView } from "../../components/dashboard/SitesMap/PointInfoWindow/SensorDataModal/Tower3DView";
import {
  DEFAULT_TOWER_PARAMETERS,
  useSensorVisualizationData,
} from "../../components/dashboard/SitesMap/PointInfoWindow/SensorDataModal/visualizationUtils";

type ViewMode = "graph" | "3d";
type VisualizationSize = {
  width: number;
  height: number;
} | null;

export const VisualizationPage = () => {
  const theme = useTheme();
  const { siderCollapsed } = useContext(ThemedLayoutContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const resizeStateRef = useRef<any>(null);
  const [visualizationSize, setVisualizationSize] =
    useState<VisualizationSize>(null);
  const mode = (searchParams.get("mode") === "3d" ? "3d" : "graph") as ViewMode;
  const imei = searchParams.get("imei") || "";
  const siteName = searchParams.get("siteName") || "Tower Visualization";
  const endDateTime = searchParams.get("endDateTime") || dayjs().toISOString();
  const startDateTime =
    searchParams.get("startDateTime") ||
    dayjs(endDateTime).subtract(1, "hour").toISOString();
  const sensorParameters = useMemo(() => DEFAULT_TOWER_PARAMETERS, []);

  const filters = [
    ...(imei ? [{ field: "imei", operator: "eq", value: imei }] : []),
    { field: "parameter", operator: "in", value: sensorParameters },
    { field: "startDateTime", operator: "gte", value: startDateTime },
    { field: "endDateTime", operator: "lte", value: endDateTime },
  ];

  const {
    data: sensorData,
    isLoading,
    error,
    refetch,
  } = useList({
    resource: "sensors",
    dataProviderName: "sensors",
    filters,
    queryOptions: {
      enabled: Boolean(imei),
    },
  });

  const { limits, unifiedChartData, selectedTrendKeys, latestAngles } =
    useSensorVisualizationData({
      sensorData: sensorData?.data,
      sensorParameters,
    });

  const handleModeChange = (_event: any, nextMode: ViewMode | null) => {
    if (!nextMode) return;
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("mode", nextMode);
    setSearchParams(nextParams);
  };

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const resizeState = resizeStateRef.current;
      if (!resizeState) return;

      const nextWidth = Math.max(
        420,
        Math.min(
          resizeState.startWidth + event.clientX - resizeState.startX,
          window.innerWidth - (siderCollapsed ? 92 : 280)
        )
      );
      const nextHeight = Math.max(
        360,
        Math.min(
          resizeState.startHeight + event.clientY - resizeState.startY,
          window.innerHeight - 112
        )
      );

      setVisualizationSize({ width: nextWidth, height: nextHeight });
    };

    const handleMouseUp = () => {
      resizeStateRef.current = null;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [siderCollapsed]);

  const startResize = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const currentTarget = event.currentTarget.parentElement;
    const rect = currentTarget?.getBoundingClientRect();

    resizeStateRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      startWidth: rect?.width ?? window.innerWidth - (siderCollapsed ? 92 : 280),
      startHeight: rect?.height ?? window.innerHeight - 112,
    };
  };

  const renderContent = () => {
    if (mode === "3d") {
      return (
        <Tower3DView
          {...latestAngles}
          history={unifiedChartData}
          siteName={siteName}
        />
      );
    }

    if (isLoading) {
      return (
        <Box sx={{ alignItems: "center", display: "flex", flex: 1, justifyContent: "center" }}>
          <CircularProgress />
        </Box>
      );
    }

    if (error) {
      return (
        <Box sx={{ alignItems: "center", display: "flex", flex: 1, justifyContent: "center" }}>
          <Typography color="error" fontFamily="monospace">
            SYSTEM ERROR: Check connection
          </Typography>
        </Box>
      );
    }

    if (!imei || unifiedChartData.length === 0) {
      return (
        <Box sx={{ alignItems: "center", display: "flex", flex: 1, justifyContent: "center", px: 2 }}>
          <Typography color="text.secondary" sx={{ textAlign: "center" }}>
            Select a tower from the dashboard and open full page graph to view live trends.
          </Typography>
        </Box>
      );
    }

    return (
      <RealTimeLineChart
        sensorData={unifiedChartData}
        dataKeys={selectedTrendKeys}
        sensorParameter={sensorParameters.join(",")}
        yAxisLabel="Value"
        limits={limits}
      />
    );
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "calc(100dvh - 16px)",
        overflow: "hidden",
        pb: 1,
        pl: { xs: 1, md: siderCollapsed ? "64px" : "calc(var(--sidebar-width, 240px) + 12px)" },
        pr: 1,
        pt: 1,
        position: "relative",
        transition: "padding-left 220ms ease",
      }}
    >
      <Box
        sx={{
          alignItems: { xs: "stretch", sm: "center" },
          bgcolor: alpha(theme.palette.background.paper, 0.92),
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 1,
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          flexShrink: 0,
          gap: 1,
          mb: 1,
          px: 1.25,
          py: 1,
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ color: "text.secondary", fontSize: "0.72rem", fontWeight: 700, lineHeight: 1 }}>
            FULL PAGE VIEW
          </Typography>
          <Typography sx={{ fontSize: "1rem", fontWeight: 800, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {siteName}
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} sx={{ ml: { sm: "auto" } }}>
          <ToggleButtonGroup
            exclusive
            size="small"
            value={mode}
            onChange={handleModeChange}
            sx={{ "& .MuiToggleButton-root": { gap: 0.5, textTransform: "none" } }}
          >
            <ToggleButton value="graph">
              <ShowChartIcon fontSize="small" />
              Graph
            </ToggleButton>
            <ToggleButton value="3d">
              <ThreeDRotationIcon fontSize="small" />
              3D
            </ToggleButton>
          </ToggleButtonGroup>
          <Button
            size="small"
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => refetch()}
            disabled={!imei || isLoading}
            sx={{ textTransform: "none" }}
          >
            Refresh
          </Button>
          <Button
            size="small"
            variant="outlined"
            startIcon={<FitScreenIcon />}
            onClick={() => setVisualizationSize(null)}
            sx={{ textTransform: "none" }}
          >
            Fit
          </Button>
        </Stack>
      </Box>

      <Box
        sx={{
          bgcolor: "background.paper",
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 1,
          display: "flex",
          flex: visualizationSize ? "0 0 auto" : 1,
          height: visualizationSize?.height ?? "auto",
          minHeight: 0,
          overflow: "hidden",
          position: "relative",
          width: visualizationSize?.width ?? "100%",
          maxHeight: "100%",
          maxWidth: "100%",
        }}
      >
        {renderContent()}
        <Box
          onMouseDown={startResize}
          sx={{
            borderBottom: `2px solid ${alpha(theme.palette.text.secondary, 0.38)}`,
            borderRight: `2px solid ${alpha(theme.palette.text.secondary, 0.38)}`,
            bottom: 8,
            cursor: "nwse-resize",
            height: 18,
            position: "absolute",
            right: 8,
            width: 18,
            zIndex: 4,
          }}
        />
      </Box>
    </Box>
  );
};

// @ts-nocheck
import { useMemo } from "react";
import { useList } from "@refinedev/core";
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
import { useSearchParams } from "react-router-dom";
import dayjs from "dayjs";
import { RealTimeLineChart } from "../../components/dashboard/SitesMap/PointInfoWindow/SensorDataModal/RealTimeDataVisualization/RealTimeLineChart";
import { Tower3DView } from "../../components/dashboard/SitesMap/PointInfoWindow/SensorDataModal/Tower3DView";
import {
  DEFAULT_TOWER_PARAMETERS,
  useSensorVisualizationData,
} from "../../components/dashboard/SitesMap/PointInfoWindow/SensorDataModal/visualizationUtils";

type ViewMode = "graph" | "3d";

export const VisualizationPage = () => {
  const theme = useTheme();
  const [searchParams, setSearchParams] = useSearchParams();
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
        p: 1,
        position: "relative",
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
        </Stack>
      </Box>

      <Box
        sx={{
          bgcolor: "background.paper",
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 1,
          display: "flex",
          flex: 1,
          minHeight: 0,
          overflow: "hidden",
        }}
      >
        {renderContent()}
      </Box>
    </Box>
  );
};

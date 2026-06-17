// @ts-nocheck
import { CSSProperties, Dispatch, FC, useContext, useState, useEffect } from "react";
import { Divider, IconButton, Portal, Typography, useTheme } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { useList } from "@refinedev/core";
import { ThemedLayoutContext } from "@refinedev/mui";
import dayjs, { Dayjs } from "dayjs";

import { SensorDataModal } from "./SensorDataModal";
import { InfoWindowContentProps } from "./types";
import { SensorFilterPanel } from "./SensorFilterPanel";
import { SensorParametersList } from "./SensorParametersList";

interface ExtendedInfoWindowContentProps extends InfoWindowContentProps {
  onModalStateChange?: Dispatch<boolean>;
  onClose?: () => void;
}

type SensorViewMode = "graph" | "3d";

const DEFAULT_TOWER_PARAMETERS = [
  "vibrationRollAngle",
  "vibrationPitchAngle",
  "vibrationAngle",
  "vibrationSpeed",
  "windSpeed",
  "windDirection",
];

const PointInfoWindow: FC<ExtendedInfoWindowContentProps> = ({
  point,
  onModalStateChange,
  onClose,
}) => {
  const theme = useTheme();
  const { siderCollapsed } = useContext(ThemedLayoutContext);
  const [sensorParameters, setSensorParameters] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<SensorViewMode>("graph");

  // Date and time state for filters - without default values
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [startTime, setStartTime] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  const [endTime, setEndTime] = useState<Dayjs | null>(null);
  const [filterError, setFilterError] = useState<string | null>(null);
  const [appliedFilter, setAppliedFilter] = useState<{
    startDateTime: string | null;
    endDateTime: string | null;
  }>({
    startDateTime: null,
    endDateTime: null,
  });

  useEffect(() => {
    const end = dayjs();
    const start = end.subtract(1, "hour");

    setStartDate(start);
    setStartTime(start);
    setEndDate(end);
    setEndTime(end);
    setAppliedFilter({
      startDateTime: start.toISOString(),
      endDateTime: end.toISOString(),
    });
    setSensorParameters(DEFAULT_TOWER_PARAMETERS);
    setViewMode("graph");
    setIsModalOpen(true);
  }, [point.key, point.status]);

  const filters = [
    { field: "imei", operator: "eq", value: Array.isArray(point.imei) ? String(point.imei[0]) : String(point.imei || "") },
    { field: "parameter", operator: "in", value: sensorParameters },
    ...(appliedFilter.startDateTime
      ? [
          {
            field: "startDateTime",
            operator: "gte",
            value: appliedFilter.startDateTime,
          },
        ]
      : []),
    ...(appliedFilter.endDateTime
      ? [
          {
            field: "endDateTime",
            operator: "lte",
            value: appliedFilter.endDateTime,
          },
        ]
      : []),
  ];

  const {
    data: sensorData,
    isLoading: isSensorDataLoading,
    error: sensorDataError,
    refetch: refetchSensorData,
  } = useList({
    resource: "sensors",
    dataProviderName: "sensors",
    // @ts-ignore
    filters,
    queryOptions: {
      enabled: sensorParameters.length > 0,
      onError: () => {
        setFilterError("Unable to load sensor data. Please try again.");
      },
    },
  });

  const handleParameterSelected = (keys: string[]) => {
    setFilterError(null);
    setSensorParameters((currentKeys) => {
      const nextKeys = new Set(currentKeys);

      keys.forEach((key) => {
        if (nextKeys.has(key)) {
          nextKeys.delete(key);
        } else {
          nextKeys.add(key);
        }
      });

      const selectedKeys = Array.from(nextKeys);
      setViewMode("graph");
      setIsModalOpen(selectedKeys.length > 0);
      return selectedKeys;
    });
  };

  const handleViewModeChange = (mode: SensorViewMode) => {
    setViewMode(mode);
    setIsModalOpen(mode === "3d" || sensorParameters.length > 0);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSensorParameters([]);
  };

  // Notify parent component about modal state changes
  useEffect(() => {
    if (onModalStateChange) {
      onModalStateChange(isModalOpen);
    }
  }, [isModalOpen, onModalStateChange]);

  // Validate and apply the filter
  const handleApplyFilter = () => {
    setFilterError(null);

    // Check if all required date-time fields are present
    if (!startDate || !startTime || !endDate || !endTime) {
      // Don't show an error if it's a preset filter being applied directly
      // The preset handler in SensorFilterPanel already sets all values
      return;
    }

    // Combine date from DatePicker and time from TimePicker
    const startDateTime = dayjs(startDate)
      .hour(startTime?.hour() || 0)
      .minute(startTime?.minute() || 0)
      .second(startTime?.second() || 0);

    const endDateTime = dayjs(endDate)
      .hour(endTime?.hour() || 0)
      .minute(endTime?.minute() || 0)
      .second(endTime?.second() || 0);

    if (startDateTime.isAfter(endDateTime)) {
      setFilterError("Start date/time must be before end date/time");
      return;
    }

    const startISO = startDateTime.toISOString();
    const endISO = endDateTime.toISOString();

    const newFilter = {
      startDateTime: startISO,
      endDateTime: endISO,
    };

    setAppliedFilter(newFilter);

    if (sensorParameters.length > 0) {
      refetchSensorData();
    }
  };

  // This function will be called from the SensorFilterPanel for preset filters
  const handleApplyPresetFilter = (start: Dayjs, end: Dayjs) => {
    setFilterError(null);

    const startISO = start.toISOString();
    const endISO = end.toISOString();

    const newFilter = {
      startDateTime: startISO,
      endDateTime: endISO,
    };

    setAppliedFilter(newFilter);

    if (sensorParameters.length > 0) {
      refetchSensorData();
    }
  };

  const handleResetFilter = () => {
    setStartDate(null);
    setStartTime(null);
    setEndDate(null);
    setEndTime(null);
    setAppliedFilter({ startDateTime: null, endDateTime: null });
    setFilterError(null);

    if (sensorParameters.length > 0) {
      refetchSensorData();
    }
  };

  const refetchLatestData = () => {
    if (sensorParameters.length > 0) {
      refetchSensorData();
    }
  };
  const panelStyle: CSSProperties = {
    position: "fixed",
    top: 76,
    left: siderCollapsed ? 64 : "calc(var(--sidebar-width, 240px) + 12px)",
    width: "min(330px, calc(100vw - 16px))",
    maxHeight: "calc(100dvh - 92px)",
    zIndex: 1302,
    background:
      "color-mix(in srgb, var(--app-bg-color, #f5f7fb) 88%, transparent)",
    backgroundColor: theme.palette.background.default,
    borderRadius: 16,
    overflow: "auto",
    maxWidth: "calc(100vw - 16px)",
    boxShadow: "0 10px 28px rgba(15, 23, 42, 0.16)",
  };
  const headerStyle: CSSProperties = {
    alignItems: "center",
    backgroundColor: theme.palette.primary.main,
    display: "flex",
    gap: 6,
    padding: "6px 12px",
  };

  return (
    <Portal>
    <div
      className="dashboard-parameter-panel"
      onMouseDown={(event) => event.stopPropagation()}
      onPointerDown={(event) => event.stopPropagation()}
      style={panelStyle}
    >
      {/* Header: primary color, location icon + site name, close button */}
      <div style={headerStyle}>
        <LocationOnIcon sx={{ color: "#fff", fontSize: "1rem", flexShrink: 0 }} />
        <Typography
          sx={{
            flex: 1,
            color: "#fff",
            fontSize: "0.82rem",
            fontWeight: 700,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {point.display_name}
        </Typography>
        <IconButton size="small" onClick={onClose} sx={{ color: "#fff", p: 0.25, flexShrink: 0 }}>
          <CloseIcon sx={{ fontSize: "1rem" }} />
        </IconButton>
      </div>

      <SensorFilterPanel
        startDate={startDate}
        startTime={startTime}
        endDate={endDate}
        endTime={endTime}
        onStartDateChange={setStartDate}
        onStartTimeChange={setStartTime}
        onEndDateChange={setEndDate}
        onEndTimeChange={setEndTime}
        onApplyFilter={handleApplyFilter}
        onApplyPresetFilter={handleApplyPresetFilter}
        onResetFilter={handleResetFilter}
        filterError={filterError}
        appliedFilter={appliedFilter}
        siteName={point.display_name}
        region={point.region}
        infrastructureId={point.infrastructure_id}
        lat={point.location?.lat}
        lng={point.location?.lng}
      />

      <Divider sx={{ borderColor: theme.palette.grey[300] }} />

      <SensorParametersList
        status={point.status}
        onStatusClick={handleParameterSelected}
        selectedParameters={sensorParameters}
        activeView={viewMode}
        onViewChange={handleViewModeChange}
        appliedFilter={appliedFilter}
      />

      {isModalOpen && (viewMode === "3d" || sensorParameters.length > 0) && (
        <SensorDataModal
          open={isModalOpen}
          onClose={handleCloseModal}
          sensorData={sensorData?.data}
          isSensorDataLoading={isSensorDataLoading}
          sensorDataError={sensorDataError}
          sensorParameters={sensorParameters}
          refetchLatestData={refetchLatestData}
          siteName={point.display_name}
          viewMode={viewMode}
        />
      )}
    </div>
    </Portal>
  );
};

export default PointInfoWindow;

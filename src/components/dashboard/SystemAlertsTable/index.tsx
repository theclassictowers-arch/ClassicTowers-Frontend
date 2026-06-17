// @ts-nocheck
import React, { useEffect, useRef, useState } from "react";
import {
  useTheme,
  Paper,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography,
  IconButton,
  Tooltip,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import KeyboardDoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeft";
import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";

interface SystemAlertsTableProps {
  latestStatus: any[];
  lastUpdateTime: string;
  allowResize?: boolean;
}

const CLOSED_WIDTH_PERCENT = 0;
const DEFAULT_WIDTH_PERCENT = 40;
const FULL_WIDTH_PERCENT = 90;
const WIDTH_STEP_PERCENT = 20;
const ALERT_BACKGROUND_OPACITY = 0.02;

export const SystemAlertsTable: React.FC<SystemAlertsTableProps> = ({
  latestStatus,
  allowResize = false,
}) => {
  const theme = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);
  const [widthPercent, setWidthPercent] = useState(DEFAULT_WIDTH_PERCENT);
  const [expandedHeight, setExpandedHeight] = useState(250);
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isFullWidth = widthPercent === FULL_WIDTH_PERCENT;
  const isClosedWidth = widthPercent === CLOSED_WIDTH_PERCENT;
  const isCompactWidth = widthPercent < DEFAULT_WIDTH_PERCENT;
  const visibleStatus =
    latestStatus && latestStatus.length > 0
      ? isExpanded
        ? latestStatus
        : latestStatus.slice(0, 1)
      : [];

  useEffect(() => {
    if (!isResizing) return;

    const getClientY = (event: MouseEvent | TouchEvent) => {
      if ("touches" in event) {
        return event.touches[0]?.clientY ?? event.changedTouches[0]?.clientY ?? 0;
      }
      return event.clientY;
    };

    const handleResize = (event: MouseEvent | TouchEvent) => {
      const top = containerRef.current?.getBoundingClientRect().top ?? 0;
      const maxHeight = Math.max(160, window.innerHeight - top - 16);
      const nextHeight = Math.min(Math.max(getClientY(event) - top, 90), maxHeight);
      setExpandedHeight(nextHeight);
    };

    const stopResize = () => setIsResizing(false);

    window.addEventListener("mousemove", handleResize);
    window.addEventListener("mouseup", stopResize);
    window.addEventListener("touchmove", handleResize, { passive: false });
    window.addEventListener("touchend", stopResize);

    return () => {
      window.removeEventListener("mousemove", handleResize);
      window.removeEventListener("mouseup", stopResize);
      window.removeEventListener("touchmove", handleResize);
      window.removeEventListener("touchend", stopResize);
    };
  }, [isResizing]);

  const renderTableRows = (data: any[]) => {
    return data.map((status: any, index: number) => {
      const timestamp = `${status.date}T${status.time}Z`;
      const utcDate = new Date(timestamp);
      const formattedTime = utcDate.toLocaleTimeString("en-GB", { hour12: false });
      const formattedDate = utcDate.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      const formattedDateTime = `${formattedTime} / ${formattedDate}`;

      return (
        <TableRow
          key={index}
          sx={{
            backgroundColor:
              status.status === "danger"
                ? theme.palette.error.light
                : status.status === "warning"
                ? theme.palette.warning.light
                : theme.palette.success.light,
            color: "#fff",
          }}
        >
          <TableCell sx={{ borderRight: "1px solid #444", color: "#111" }}>
            {formattedDateTime}
          </TableCell>
          <TableCell sx={{ borderRight: "1px solid #444", color: "#111" }}>
            <Typography variant="body2" noWrap sx={{ maxWidth: 300 }}>
              {status.message?.split(" at ")[0] || "System Status: " + status.status}
            </Typography>
          </TableCell>
          <TableCell sx={{ color: "#111" }}>{status.display_name}</TableCell>
        </TableRow>
      );
    });
  };

  const handleMinWidthClick = () => {
    setIsExpanded(false);
    setWidthPercent(CLOSED_WIDTH_PERCENT);
  };

  const handleDecreaseWidthClick = () => {
    setWidthPercent((current) => {
      const nextWidth = Math.max(current - WIDTH_STEP_PERCENT, CLOSED_WIDTH_PERCENT);
      if (nextWidth < FULL_WIDTH_PERCENT) setIsExpanded(false);
      return nextWidth;
    });
  };

  const handleIncreaseWidthClick = () => {
    setWidthPercent((current) => Math.min(current + WIDTH_STEP_PERCENT, FULL_WIDTH_PERCENT));
  };

  const handleFullWidthClick = () => {
    setWidthPercent(FULL_WIDTH_PERCENT);
  };

  const iconBtnSx = {
    width: 30,
    height: 30,
    color: theme.palette.primary.main,
    border: `1px solid ${theme.palette.primary.main}`,
    bgcolor: "background.paper",
    boxShadow: "0 6px 14px rgba(15, 23, 42, 0.14)",
    transition:
      "background-color 180ms ease, color 180ms ease, transform 180ms ease, box-shadow 180ms ease",
    "&:hover": {
      color: theme.palette.primary.dark,
      bgcolor: "action.hover",
      boxShadow: "0 9px 18px rgba(15, 23, 42, 0.18)",
      transform: "scale(1.06)",
    },
    "&:active": { transform: "scale(0.94)" },
    "&.Mui-disabled": { opacity: 0.42 },
  };

  return (
    <div
      ref={containerRef}
      style={{
        width: `${widthPercent}%`,
        marginLeft: 0,
        marginRight: 0,
        marginTop: 0,
        position: "relative",
        overflow: "visible",
        zIndex: 4,
        minHeight: isClosedWidth ? 38 : "auto",
        transition: "width 320ms cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      {/* Alert bar */}
      <Paper
        elevation={8}
        sx={{
          display: isClosedWidth ? "none" : "block",
          bgcolor: alpha(theme.palette.background.paper, ALERT_BACKGROUND_OPACITY),
          borderRadius: 0,
          overflow: "hidden",
          border: `1px solid ${theme.palette.divider}`,
          boxShadow: "0 14px 38px rgba(15, 23, 42, 0.22)",
          "& .MuiTableCell-root": {
            fontSize: isCompactWidth ? "0.68rem" : "0.8125rem",
            px: isCompactWidth ? 0.65 : 1,
            py: 0,
            lineHeight: 1.15,
            transition: "font-size 220ms ease, padding 220ms ease",
          },
          "& .MuiTypography-root": {
            fontSize: isCompactWidth ? "0.68rem" : "0.8125rem",
            transition: "font-size 220ms ease",
          },
        }}
      >
        <div style={{ alignItems: "stretch", display: "flex" }}>
          {/* Table content */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <TableContainer
              sx={{
                maxHeight: isExpanded ? expandedHeight : 34,
                minHeight: 34,
                position: "relative",
                overflowY: isExpanded ? "auto" : "hidden",
                transition: isResizing
                  ? "none"
                  : "max-height 360ms cubic-bezier(0.2, 0.8, 0.2, 1)",
                scrollBehavior: "smooth",
              }}
            >
              <Table stickyHeader size="small">
                <TableBody>
                  {visibleStatus.length > 0 ? (
                    renderTableRows(visibleStatus)
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <Typography>All systems are operating normally</Typography>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </div>

          {/* Inline buttons — only when full width */}
          {isFullWidth && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                paddingLeft: 4,
                paddingRight: 4,
                flexShrink: 0,
                borderLeft: `1px solid ${theme.palette.divider}`,
                backgroundColor: alpha(theme.palette.background.paper, 0.72),
                backdropFilter: "blur(8px)",
              }}
            >
              <Tooltip title="Close alerts">
                <span>
                  <IconButton
                    onClick={handleMinWidthClick}
                    aria-label="Close alerts"
                    size="small"
                    sx={iconBtnSx}
                  >
                    <KeyboardDoubleArrowLeftIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>

              <Tooltip
                title={`Decrease width to ${Math.max(
                  widthPercent - WIDTH_STEP_PERCENT,
                  CLOSED_WIDTH_PERCENT
                )}%`}
              >
                <span>
                  <IconButton
                    onClick={handleDecreaseWidthClick}
                    aria-label="Decrease alerts width"
                    size="small"
                    sx={iconBtnSx}
                  >
                    <KeyboardArrowLeftIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>

              <Tooltip title={isExpanded ? "Collapse height" : "Increase height"}>
                <IconButton
                  onClick={() => setIsExpanded((c) => !c)}
                  aria-label={isExpanded ? "Collapse alerts height" : "Increase alerts height"}
                  size="small"
                  sx={{
                    width: 30,
                    height: 30,
                    color: theme.palette.primary.main,
                    transition:
                      "color 180ms ease, transform 360ms cubic-bezier(0.2, 0.8, 0.2, 1)",
                    transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                    "&:hover": { color: theme.palette.primary.dark, bgcolor: "action.hover" },
                    "&:active": {
                      transform: isExpanded
                        ? "rotate(180deg) scale(0.94)"
                        : "rotate(0deg) scale(0.94)",
                    },
                  }}
                >
                  <KeyboardArrowDownIcon fontSize="medium" />
                </IconButton>
              </Tooltip>
            </div>
          )}
        </div>

        {allowResize && isFullWidth && isExpanded && (
          <div
            onMouseDown={(event) => {
              event.preventDefault();
              setIsResizing(true);
            }}
            onTouchStart={(event) => {
              event.preventDefault();
              setIsResizing(true);
            }}
            style={{
              height: 12,
              cursor: "ns-resize",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: isResizing
                ? theme.palette.action.selected
                : theme.palette.background.paper,
              borderTop: `1px solid ${theme.palette.divider}`,
              transition: "background-color 180ms ease",
              touchAction: "none",
            }}
          >
            <span
              style={{
                width: 48,
                height: 4,
                borderRadius: 99,
                backgroundColor: theme.palette.text.disabled,
              }}
            />
          </div>
        )}
      </Paper>

      {/* Floating buttons — only when NOT full width */}
      {!isFullWidth && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "100%",
            right: "auto",
            transform: isClosedWidth
              ? "translate(-6px, -50%)"
              : "translate(10px, -50%)",
            zIndex: 20,
            display: "flex",
            alignItems: "center",
            gap: 4,
            padding: "3px 4px",
            borderRadius: "999px",
            backgroundColor: "rgba(255, 255, 255, 0.72)",
            border: `1px solid ${theme.palette.divider}`,
            backdropFilter: "blur(8px)",
            boxShadow: "0 10px 24px rgba(15, 23, 42, 0.18)",
          }}
        >
          {!isClosedWidth && (
            <Tooltip title="Close alerts">
              <span>
                <IconButton
                  onClick={handleMinWidthClick}
                  aria-label="Close alerts"
                  size="small"
                  sx={iconBtnSx}
                >
                  <KeyboardDoubleArrowLeftIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          )}
          {!isClosedWidth && (
            <Tooltip
              title={`Decrease width to ${Math.max(
                widthPercent - WIDTH_STEP_PERCENT,
                CLOSED_WIDTH_PERCENT
              )}%`}
            >
              <span>
                <IconButton
                  onClick={handleDecreaseWidthClick}
                  aria-label="Decrease alerts width"
                  size="small"
                  sx={iconBtnSx}
                >
                  <KeyboardArrowLeftIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          )}
          <Tooltip
            title={
              isClosedWidth
                ? "Show alerts"
                : `Increase width to ${Math.min(
                    widthPercent + WIDTH_STEP_PERCENT,
                    FULL_WIDTH_PERCENT
                  )}%`
            }
          >
            <span>
              <IconButton
                onClick={handleIncreaseWidthClick}
                aria-label={isClosedWidth ? "Show alerts" : "Increase alerts width"}
                size="small"
                sx={iconBtnSx}
              >
                <KeyboardArrowRightIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          {!isClosedWidth && (
            <Tooltip title="Set width to 100%">
              <IconButton
                onClick={handleFullWidthClick}
                aria-label="Set alerts width to 100 percent"
                size="small"
                sx={iconBtnSx}
              >
                <KeyboardDoubleArrowRightIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </div>
      )}
    </div>
  );
};

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
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardDoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeft";
import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";

interface SystemAlertsTableProps {
  latestStatus: any[];
  lastUpdateTime: string;
  allowResize?: boolean;
}

export const SystemAlertsTable: React.FC<SystemAlertsTableProps> = ({
  latestStatus,
  allowResize = false,
}) => {
  const theme = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);
  const [widthPercent, setWidthPercent] = useState(40);
  const [expandedHeight, setExpandedHeight] = useState(250);
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isFullWidth = widthPercent === 100;

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
            {status.date}
          </TableCell>
          <TableCell sx={{ borderRight: "1px solid #444", color: "#111" }}>
            {formattedTime}
          </TableCell>
          <TableCell sx={{ borderRight: "1px solid #444", color: "#111" }}>
            {status.display_name}
          </TableCell>
          <TableCell sx={{ color: "#111" }}>
            <Typography variant="body2" noWrap sx={{ maxWidth: 300 }}>
              {status.message?.split(" at ")[0] || "System Status: " + status.status}
            </Typography>
          </TableCell>
        </TableRow>
      );
    });
  };

  const handleWidthClick = () => {
    setWidthPercent((current) => {
      if (current >= 100) {
        setIsExpanded(false);
        return 40;
      }

      return Math.min(current + 20, 100);
    });
  };

  return (
    <Box
      ref={containerRef}
      sx={{
        width: {
          xs: "100%",
          md: `${widthPercent}%`,
        },
        mx: 0,
        mt: 0,
        position: "relative",
        overflow: "visible",
        zIndex: 4,
        transition: "width 320ms cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      <Paper
        elevation={8}
        sx={{
          bgcolor: theme.palette.background.paper,
          borderRadius: 0,
          overflow: "hidden",
          border: `1px solid ${theme.palette.divider}`,
          boxShadow: "0 14px 38px rgba(15, 23, 42, 0.22)",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "stretch" }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <TableContainer
              sx={{
                maxHeight: isExpanded ? expandedHeight : 33,
                position: "relative",
                overflowY: isExpanded ? "auto" : "hidden",
                transition:
                  isResizing
                    ? "none"
                    : "max-height 360ms cubic-bezier(0.2, 0.8, 0.2, 1)",
                scrollBehavior: "smooth",
              }}
            >
              <Table stickyHeader size="small">
                <TableBody>
                  {latestStatus && latestStatus.length > 0 ? (
                    renderTableRows(latestStatus)
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 1,
                          }}
                        >
                          <Typography>
                            All systems are operating normally
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Box>
        {allowResize && isFullWidth && isExpanded && (
          <Box
            onMouseDown={(event) => {
              event.preventDefault();
              setIsResizing(true);
            }}
            onTouchStart={(event) => {
              event.preventDefault();
              setIsResizing(true);
            }}
            sx={{
              height: 12,
              cursor: "ns-resize",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: isResizing ? "action.selected" : "background.paper",
              borderTop: `1px solid ${theme.palette.divider}`,
              transition: "background-color 180ms ease",
              touchAction: "none",
              "&::before": {
                content: "\"\"",
                width: 48,
                height: 4,
                borderRadius: 99,
                bgcolor: "text.disabled",
              },
              "&:hover": {
                bgcolor: "action.hover",
              },
            }}
          />
        )}
      </Paper>

      <Box
        sx={{
          position: "absolute",
          top: 2,
          left: {
            xs: "auto",
            md: isFullWidth ? "auto" : "100%",
          },
          right: {
            xs: 6,
            md: isFullWidth ? 8 : "auto",
          },
          transform: {
            xs: "none",
            md: isFullWidth ? "none" : "translateX(10px)",
          },
          zIndex: 20,
          display: "flex",
          alignItems: "center",
          gap: 0.5,
          px: 0.5,
          py: 0.35,
          borderRadius: "999px",
          backgroundColor: "rgba(255, 255, 255, 0.72)",
          border: `1px solid ${theme.palette.divider}`,
          backdropFilter: "blur(8px)",
          boxShadow: "0 10px 24px rgba(15, 23, 42, 0.18)",
        }}
      >
        <Tooltip
          title={
            isFullWidth
              ? "Back to 40% width"
              : `Increase width to ${widthPercent + 20}%`
          }
        >
          <IconButton
            onClick={handleWidthClick}
            aria-label={
              isFullWidth
                ? "Set alerts to 40 percent width"
                : "Increase alerts width"
            }
            size="small"
            sx={{
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
              "&:active": {
                transform: "scale(0.94)",
              },
            }}
          >
            {isFullWidth ? (
              <KeyboardDoubleArrowLeftIcon fontSize="small" />
            ) : (
              <KeyboardDoubleArrowRightIcon fontSize="small" />
            )}
          </IconButton>
        </Tooltip>
        {isFullWidth && (
          <Tooltip title={isExpanded ? "Collapse height" : "Increase height"}>
            <IconButton
              onClick={() => setIsExpanded((current) => !current)}
              aria-label={
                isExpanded
                  ? "Collapse alerts height"
                  : "Increase alerts height"
              }
              size="small"
              sx={{
                width: 30,
                height: 30,
                color: theme.palette.primary.main,
                transition:
                  "color 180ms ease, transform 360ms cubic-bezier(0.2, 0.8, 0.2, 1)",
                transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                "&:hover": {
                  color: theme.palette.primary.dark,
                  bgcolor: "action.hover",
                },
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
        )}
      </Box>
    </Box>
  );
};

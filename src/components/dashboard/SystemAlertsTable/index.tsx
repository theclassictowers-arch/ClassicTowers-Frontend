import React, { useState } from "react";
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

interface SystemAlertsTableProps {
  latestStatus: any[];
  lastUpdateTime: string;
}

export const SystemAlertsTable: React.FC<SystemAlertsTableProps> = ({
  latestStatus,
}) => {
  const theme = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);

  const renderTableRows = (data: any[]) => {
    return data.map((status: any, index: number) => {
      const timestamp = `${status.date}T${status.time}Z`;
      const utcDate = new Date(timestamp);
      const formattedTime = utcDate.toLocaleTimeString('en-GB', { hour12: false });
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

  return (
    <Box
      sx={{
        width: "min(980px, calc(100vw - 96px))",
        mx: "auto",
        mt: 1,
      }}
    >
      <Paper
        elevation={8}
        sx={{
          bgcolor: theme.palette.background.paper,
          borderRadius: 1,
          overflow: "hidden",
          border: `1px solid ${theme.palette.divider}`,
          boxShadow: "0 14px 38px rgba(15, 23, 42, 0.22)",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "stretch" }}>
          <Box sx={{ flex: 1 }}>
            <TableContainer
              sx={{
                maxHeight: isExpanded ? 250 : 33,
                position: "relative",
                overflowY: isExpanded ? "auto" : "hidden",
                transition:
                  "max-height 360ms cubic-bezier(0.2, 0.8, 0.2, 1)",
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
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              px: 0.5,
              borderLeft: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Tooltip title={isExpanded ? "Collapse" : "Expand"}>
              <IconButton
                onClick={() => setIsExpanded((current) => !current)}
                aria-label={isExpanded ? "Collapse alerts" : "Expand alerts"}
                size="small"
                sx={{
                  color: theme.palette.primary.main,
                  transition:
                    "color 180ms ease, transform 360ms cubic-bezier(0.2, 0.8, 0.2, 1)",
                  transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                  "&:hover": {
                    color: theme.palette.primary.dark,
                    bgcolor: "transparent",
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
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

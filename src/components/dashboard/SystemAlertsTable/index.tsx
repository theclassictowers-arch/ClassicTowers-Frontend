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
} from "@mui/material";
import LaunchIcon from "@mui/icons-material/Launch";
import { ArchivesModal } from "./ArchivesModal";

interface SystemAlertsTableProps {
  latestStatus: any[];
  lastUpdateTime: string;
}

export const SystemAlertsTable: React.FC<SystemAlertsTableProps> = ({
  latestStatus,
}) => {
  const theme = useTheme();
  const [openArchives, setOpenArchives] = useState(false);

  const handleOpenArchives = () => {
    setOpenArchives(true);
  };

  const handleCloseArchives = () => {
    setOpenArchives(false);
  };

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
    <>
      <Paper
        elevation={3}
        sx={{
          bgcolor: theme.palette.background.paper,
          borderRadius: 1,
          overflow: "hidden",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "stretch" }}>
          <Box sx={{ flex: 1 }}>
            <TableContainer sx={{ maxHeight: "33px", position: "relative" }}>
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
              px: 1,
            }}
          >
            <LaunchIcon
              onClick={handleOpenArchives}
              aria-label="Open Archives"
              sx={{
                cursor: "pointer",
                color: theme.palette.primary.main,
                fontSize: theme.spacing(3), // Scales better
                transition:
                  "color 0.2s ease-in-out, transform 0.2s ease-in-out",
                "&:hover": {
                  color: theme.palette.primary.dark,
                  transform: "scale(1.1)",
                },
                "&:active": {
                  transform: "scale(0.95)",
                },
              }}
            />
          </Box>
        </Box>
      </Paper>
      <ArchivesModal open={openArchives} onClose={handleCloseArchives} />
    </>
  );
};

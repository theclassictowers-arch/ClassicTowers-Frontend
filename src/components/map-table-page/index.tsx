import type { ReactNode } from "react";
import { Box } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { MapBackgroundPage } from "../map-background-page";

export const MapTablePage = ({ children }: { children: ReactNode }) => {
  const theme = useTheme();

  return (
    <MapBackgroundPage>
      <Box
        className="map-table-page-shell"
        sx={{
          width: "100%",
          minHeight: "100dvh",
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          px: { xs: 1.5, sm: 2.5, md: 3 },
          pl: { xs: 1.5, sm: 2.5, md: "76px" },
          py: { xs: 1.5, md: 3 },
          pointerEvents: "none",
        }}
      >
        <Box
          sx={{
            width: {
              xs: "100%",
              md: "100%",
            },
            maxWidth: "1420px",
            maxHeight: "calc(100dvh - 48px)",
            ml: 0,
            overflow: "auto",
            pointerEvents: "auto",
            animation:
              "tableWindowOpen 460ms cubic-bezier(0.16, 1, 0.3, 1) both",
            transformOrigin: "center top",
            "@keyframes tableWindowOpen": {
              "0%": {
                opacity: 0,
                transform: "translateY(18px) scale(0.94)",
                filter: "blur(4px)",
              },
              "72%": {
                opacity: 1,
                transform: "translateY(-3px) scale(1.01)",
                filter: "blur(0)",
              },
              "100%": {
                opacity: 1,
                transform: "translateY(0) scale(1)",
                filter: "blur(0)",
              },
            },
            "& .MuiPaper-root": {
              backgroundColor: alpha(theme.palette.background.paper, 0.3),
              backdropFilter: "blur(6px)",
              border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
              boxShadow: "none",
            },
            "& .MuiDataGrid-root": {
              backgroundColor: alpha(theme.palette.background.paper, 0.3),
              borderColor: alpha(theme.palette.divider, 0.28),
              backdropFilter: "blur(4px)",
            },
            "& .MuiDataGrid-toolbarContainer": {
              px: 1,
              py: 1,
              backgroundColor: alpha(theme.palette.background.paper, 0.3),
              borderBottom: `1px solid ${alpha(theme.palette.divider, 0.24)}`,
            },
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: alpha(theme.palette.background.default, 0.3),
            },
            "& .MuiDataGrid-row": {
              backgroundColor: alpha(theme.palette.background.paper, 0.3),
            },
            "& .MuiDataGrid-row:hover": {
              backgroundColor: alpha(theme.palette.primary.main, 0.12),
            },
            "@media (max-width: 899px)": {
              width: "100%",
              maxHeight: "calc(100dvh - 24px)",
              animation:
                "tableWindowOpenMobile 380ms cubic-bezier(0.16, 1, 0.3, 1) both",
              "@keyframes tableWindowOpenMobile": {
                "0%": {
                  opacity: 0,
                  transform: "translateY(18px) scale(0.96)",
                },
                "100%": {
                  opacity: 1,
                  transform: "translateY(0) scale(1)",
                },
              },
            },
          }}
        >
          {children}
        </Box>
      </Box>
    </MapBackgroundPage>
  );
};

export default MapTablePage;

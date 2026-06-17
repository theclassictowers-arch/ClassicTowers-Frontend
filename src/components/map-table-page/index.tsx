// @ts-nocheck
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Box, IconButton, Tooltip } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { MapBackgroundPage } from "../map-background-page";

export const MapTablePage = ({ children }: { children: ReactNode }) => {
  const theme = useTheme();

  return (
    <MapBackgroundPage>
      <div
        className="map-table-page-shell"
        style={{
          width: "100%",
          minHeight: "100dvh",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "flex-start",
          padding: "12px 24px 12px 76px",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "1420px",
            maxHeight: "calc(100dvh - 24px)",
            marginLeft: 0,
            overflow: "auto",
            pointerEvents: "auto",
            transformOrigin: "center top",
          }}
        >
          {children}
        </div>
      </div>
    </MapBackgroundPage>
  );
};

export const TableBottomActions = ({
  createButton,
}: {
  createButton?: ReactNode;
}) => {
  const theme = useTheme();
  const navigate = useNavigate();

  return (
    <div
      style={{
        alignItems: "center",
        display: "flex",
        gap: 6,
        position: "absolute",
        left: 8,
        bottom: 8,
        padding: "3px 4px",
        border: `1px solid ${alpha(theme.palette.divider, 0.22)}`,
        borderRadius: "8px",
        backgroundColor: alpha(theme.palette.background.paper, 0.66),
        backdropFilter: "blur(8px)",
        zIndex: 3,
      }}
    >
      <Tooltip title="Back">
        <IconButton
          size="small"
          aria-label="Back"
          onClick={() => navigate("/")}
          sx={{
            width: 30,
            height: 30,
            borderRadius: "7px",
            color: theme.palette.primary.main,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.42)}`,
            backgroundColor: alpha(theme.palette.background.paper, 0.72),
            "&:hover": {
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
            },
          }}
        >
          <ArrowBackIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <div style={{ minWidth: 0 }}>
        {createButton}
      </div>
    </div>
  );
};

export const TableCenterLogo = () => {
  const theme = useTheme();

  return (
    <div
      style={{
        position: "absolute",
        bottom: 2,
        left: "50%",
        transform: "translateX(-50%)",
        padding: "3px 6px",
        border: `1px solid ${alpha(theme.palette.divider, 0.22)}`,
        borderRadius: "8px",
        backgroundColor: alpha(theme.palette.background.paper, 0.66),
        backdropFilter: "blur(8px)",
        zIndex: 3,
        display: "flex",
        alignItems: "center",
        pointerEvents: "none",
      }}
    >
      <img
        src="/images/classic-electronics-brand-transparent.png"
        alt="Classic Electronics"
        style={{ height: 40, width: "auto", display: "block" }}
      />
    </div>
  );
};

export const ShowPageLogo = () => {
  const theme = useTheme();
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        marginTop: 24,
        marginBottom: 4,
        padding: "3px 6px",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          padding: "3px 6px",
          border: `1px solid ${alpha(theme.palette.divider, 0.22)}`,
          borderRadius: "8px",
          backgroundColor: alpha(theme.palette.background.paper, 0.66),
          backdropFilter: "blur(8px)",
        }}
      >
        <img
          src="/images/classic-electronics-brand-transparent.png"
          alt="Classic Electronics"
          style={{ height: 40, width: "auto", display: "block" }}
        />
      </div>
    </div>
  );
};

export default MapTablePage;

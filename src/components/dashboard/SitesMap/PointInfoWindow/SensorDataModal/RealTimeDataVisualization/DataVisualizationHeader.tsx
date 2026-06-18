// @ts-nocheck
import React from "react";
import { Button, IconButton, Tooltip, Typography } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import CloseFullscreenIcon from "@mui/icons-material/CloseFullscreen";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";

export interface DataVisualizationHeaderProps {
  isLoading: boolean;
  refetchLatestData: () => void;
  onClose: () => void;
  onOpenFullPage?: () => void;
  isFullPage?: boolean;
  siteName: any;
}

export const DataVisualizationHeader: React.FC<
  DataVisualizationHeaderProps
> = ({
  isLoading,
  refetchLatestData,
  onClose,
  onOpenFullPage,
  isFullPage = false,
  siteName,
}) => {
  return (
    <div
      style={{
        alignItems: "center",
        backgroundColor: "#80AFFA",
        display: "flex",
        justifyContent: "space-between",
      }}
    >
      <IconButton
        onClick={onClose}
        disabled={isLoading}
        aria-label="Close view"
        size="medium"
        sx={{ color: "#fff" }}
      >
        <ArrowBackIosNewIcon fontSize="inherit" />
      </IconButton>

      <Typography variant="h6" sx={{ color: "#fff" }}>
        {siteName}
      </Typography>

      <div style={{ alignItems: "center", display: "flex" }}>
        {onOpenFullPage && (
          <Tooltip title={isFullPage ? "Exit full view" : "Full view"}>
            <Button
              onClick={onOpenFullPage}
              disabled={isLoading}
              aria-label={isFullPage ? "Exit full view" : "Open full view"}
              size="small"
              startIcon={
                isFullPage ? (
                  <CloseFullscreenIcon fontSize="small" />
                ) : (
                  <OpenInFullIcon fontSize="small" />
                )
              }
              sx={{
                color: "#fff",
                fontSize: "0.78rem",
                fontWeight: 800,
                minWidth: 0,
                px: 1,
                textTransform: "none",
                "& .MuiButton-startIcon": { mr: 0.5 },
              }}
            >
              {isFullPage ? "Exit" : "Full"}
            </Button>
          </Tooltip>
        )}
        <IconButton
          onClick={refetchLatestData}
          disabled={isLoading}
          aria-label="Refresh data"
          size="medium"
          sx={{ color: "#fff" }}
        >
          <RefreshIcon fontSize="inherit" />
        </IconButton>
      </div>
    </div>
  );
};

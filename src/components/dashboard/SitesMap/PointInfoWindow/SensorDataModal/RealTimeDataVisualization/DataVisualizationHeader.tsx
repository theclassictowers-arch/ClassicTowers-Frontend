// @ts-nocheck
import React from "react";
import { IconButton, Tooltip, Typography } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";

export interface DataVisualizationHeaderProps {
  isLoading: boolean;
  refetchLatestData: () => void;
  onClose: () => void;
  onOpenFullPage?: () => void;
  siteName: any;
}

export const DataVisualizationHeader: React.FC<
  DataVisualizationHeaderProps
> = ({ isLoading, refetchLatestData, onClose, onOpenFullPage, siteName }) => {
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
          <Tooltip title="Full view">
            <IconButton
              onClick={onOpenFullPage}
              disabled={isLoading}
              aria-label="Open full view"
              size="medium"
              sx={{ color: "#fff" }}
            >
              <OpenInFullIcon fontSize="inherit" />
            </IconButton>
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

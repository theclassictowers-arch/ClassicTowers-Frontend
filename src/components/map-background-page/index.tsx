import type { ReactNode } from "react";
import { Box } from "@mui/material";
import { useList } from "@refinedev/core";
import { SitesMap } from "../dashboard";

export const MapBackgroundPage = ({ children }: { children: ReactNode }) => {
  const { data: siteData, isLoading } = useList({
    resource: "sites",
    dataProviderName: "default",
    errorNotification: false,
  });

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        minHeight: "100dvh",
        m: 0,
        p: 0,
        display: "flex",
        alignItems: "center",
        overflow: "hidden",
        backgroundColor: "background.default",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
        }}
      >
        <SitesMap siteData={siteData} isLoading={isLoading} />
      </Box>

      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          minHeight: "100dvh",
          display: "flex",
          alignItems: "center",
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default MapBackgroundPage;

import React, { useEffect, useState, useCallback } from "react";
import { useList } from "@refinedev/core";
import { Box } from "@mui/material";
import { io } from "socket.io-client";
import {
  SystemAlertsTable,
  SitesMap,
} from "../../components/dashboard";

const { VITE_API_BASE_URL } = import.meta.env;

export const DashboardPage: React.FC = () => {
  const [lastUpdateTime, setLastUpdateTime] = useState<string>("");

  const {
    data: siteData,
    isLoading: isSiteLoading,
    refetch: refetchSiteData,
  } = useList({
    resource: "sites",
    dataProviderName: "default",
    errorNotification: (error) => ({
      message: "Error fetching sites data",
      description: error?.message || "An unexpected error occurred",
      type: "error",
    }),
  });

  const handleNewData = useCallback(() => {
    refetchSiteData();
    const now = new Date();
    setLastUpdateTime(
      `${now.toLocaleTimeString()} ${now.toLocaleDateString()}`
    );
  }, [refetchSiteData]);

  useEffect(() => {
    const socket = VITE_API_BASE_URL ? io(VITE_API_BASE_URL) : io();
    socket.on("newData", handleNewData);

    return () => {
      socket.disconnect();
    };
  }, [handleNewData]);

  const getLatestStatus = (siteData: any): any[] => {
    if (!siteData?.data) return [];

    const latestStatus = siteData.data
      .flatMap((site: any) => {
        const statuses = Object.values(site?.status).filter(
          (status: any) => !Array.isArray(status)
        );

        return statuses.map((status: any) => ({
          ...status,
          display_name: site.display_name,
          siteCreatedAt: site.createdAt,
        }));
      })
      .map((status: any) => {
        const timestamp = status.siteCreatedAt || new Date().toISOString();
        const [date, fullTime] = timestamp.split("T");
        const time = (fullTime || "00:00:00").split(".")[0];
        return { ...status, date, time };
      });

    const rowData = latestStatus.filter(
      (status: any) => status.status === "danger"
    );
    if (rowData.length > 0) {
      return rowData;
    }

    const warningData = latestStatus.filter(
      (status: any) => status.status === "warning"
    );
    if (warningData.length > 0) {
      return warningData;
    }

    const normalData = latestStatus.filter(
      (status: any) => status.status === "normal"
    );
    return normalData || [];
  };

  const latestStatus = getLatestStatus(siteData);

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box>
        <SystemAlertsTable
          latestStatus={latestStatus || []}
          lastUpdateTime={lastUpdateTime}
        />
      </Box>
      <Box sx={{ flex: 1 }}>
        <SitesMap siteData={siteData} isLoading={isSiteLoading} />
      </Box>
    </Box>
  );
};

import React from "react";
import { BrowserRouter } from "react-router-dom";
import { Refine } from "@refinedev/core";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";
import {
  useNotificationProvider,
  RefineSnackbarProvider,
} from "@refinedev/mui";
import GlobalStyles from "@mui/material/GlobalStyles";
import CssBaseline from "@mui/material/CssBaseline";
import routerProvider, {
  UnsavedChangesNotifier,
} from "@refinedev/react-router-v6";

import { useAuthContext, useLogoutConfirm } from "./contexts";
import Routes from "./routes";
import {
  useAuthProvider,
  userProvider,
  siteProvider,
  sensorProvider,
  limitsProvider,
  archivesProvider,
} from "./providers";
import { getResources } from "./utils";

const App: React.FC = () => {
  const { role } = useAuthContext();
  const { confirm } = useLogoutConfirm();
  const authProvider = useAuthProvider(confirm);
  const resources = role ? getResources(role) : [];

  return (
    <BrowserRouter>
      <RefineKbarProvider>
        <CssBaseline />
        <GlobalStyles
          styles={{
            html: { WebkitFontSmoothing: "auto" },
            body: { margin: 0, padding: 0 },
            "#root": { minHeight: "100dvh" },
            "@keyframes sidebarIconTwist": {
              "0%": { transform: "rotate(0deg) scale(1)" },
              "45%": { transform: "rotate(-14deg) scale(1.18)" },
              "100%": { transform: "rotate(-8deg) scale(1.12)" },
            },
            "@keyframes sidebarLabelFloat": {
              "0%": {
                opacity: 0,
                transform: "translate(-26px, -50%) scale(0.9) rotateY(-18deg)",
              },
              "65%": {
                opacity: 1,
                transform: "translate(4px, -50%) scale(1.02) rotateY(2deg)",
              },
              "100%": {
                opacity: 1,
                transform: "translate(0, -50%) scale(1) rotateY(0deg)",
              },
            },
            "@keyframes sidebarActiveGlow": {
              "0%, 100%": {
                boxShadow:
                  "0 10px 24px rgba(25, 118, 210, 0.28), inset 3px 0 0 rgba(255,255,255,0.78)",
              },
              "50%": {
                boxShadow:
                  "0 14px 30px rgba(25, 118, 210, 0.38), inset 3px 0 0 rgba(255,255,255,0.92)",
              },
            },
            "main.MuiBox-root": {
              padding: "0 !important",
              margin: "0 !important",
              overflow: "hidden",
            },
            "@media (min-width: 900px)": {
              ".MuiBox-root:has(> nav [data-sidebar-collapsed='true']) > .MuiBox-root:first-of-type":
                {
                  width: "52px !important",
                  minWidth: "52px !important",
                  height: "100dvh !important",
                },
              ".MuiBox-root:has(> nav [data-sidebar-collapsed='false']) > .MuiBox-root:first-of-type":
                {
                  width: "260px !important",
                  minWidth: "260px !important",
                  height: "100dvh !important",
                },
              ".MuiBox-root:has(> nav [data-sidebar-collapsed='true']) > nav": {
                width: "52px !important",
                overflow: "visible !important",
                zIndex: 1300,
              },
              ".MuiBox-root:has(> nav [data-sidebar-collapsed='false']) > nav": {
                width: "260px !important",
                overflow: "visible !important",
                zIndex: 1300,
              },
              ".MuiBox-root:has(> nav [data-sidebar-collapsed='true']) .map-table-page-shell":
                {
                  paddingLeft: "76px !important",
                },
              ".MuiBox-root:has(> nav [data-sidebar-collapsed='false']) .map-table-page-shell":
                {
                  paddingLeft: "284px !important",
                },
              ".MuiDrawer-docked": {
                height: "100dvh !important",
                overflow: "visible !important",
              },
              ".MuiDrawer-docked .MuiDrawer-paper": {
                height: "100dvh !important",
                maxHeight: "100dvh !important",
                borderRight: "1px solid rgba(148, 163, 184, 0.28)",
                background: "transparent !important",
                backgroundColor: "transparent !important",
                backdropFilter: "none",
                boxShadow: "none",
                transition:
                  "width 240ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 180ms ease",
              },
              "nav:has([data-sidebar-collapsed='true']) .MuiDrawer-paper": {
                width: "52px !important",
                overflow: "visible !important",
              },
              "nav:has([data-sidebar-collapsed='false']) .MuiDrawer-paper": {
                width: "260px !important",
                overflow: "hidden !important",
              },
              "nav:has([data-sidebar-collapsed='false']) .MuiDrawer-paper *":
                {
                  boxSizing: "border-box",
                },
              ".MuiDrawer-docked .MuiPaper-root": {
                height: "56px !important",
                minHeight: "56px !important",
                paddingLeft: "0 !important",
                paddingRight: "0 !important",
                background: "transparent !important",
                backgroundColor: "transparent !important",
                borderBottom: "1px solid rgba(148, 163, 184, 0.22)",
              },
              "nav:has([data-sidebar-collapsed='false']) .MuiPaper-root": {
                paddingLeft: "14px !important",
                paddingRight: "10px !important",
                justifyContent: "space-between !important",
              },
              ".MuiDrawer-docked .MuiPaper-root .MuiIconButton-root": {
                width: "34px",
                height: "34px",
                borderRadius: "12px",
                transition:
                  "background-color 180ms ease, transform 180ms ease, box-shadow 180ms ease",
              },
              ".MuiDrawer-docked .MuiPaper-root .MuiIconButton-root:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.22)",
                boxShadow: "0 8px 18px rgba(15, 23, 42, 0.14)",
                transform: "scale(1.05)",
              },
              "nav:has([data-sidebar-collapsed='true']) .MuiPaper-root .MuiIconButton-root":
                {
                  color: "primary.main",
                },
              "nav:has([data-sidebar-collapsed='false']) .MuiPaper-root .MuiIconButton-root":
                {
                  color: "text.secondary",
                  marginLeft: "8px",
                },
              ".MuiDrawer-docked .MuiDrawer-paper > .MuiBox-root": {
                height: "calc(100dvh - 56px) !important",
              },
              "nav:has([data-sidebar-collapsed='true']) .MuiDrawer-paper > .MuiBox-root":
                {
                  overflow: "visible !important",
                },
              "nav:has([data-sidebar-collapsed='false']) .MuiDrawer-paper > .MuiBox-root":
                {
                  overflowX: "hidden !important",
                  overflowY: "auto !important",
                },
              ".MuiDrawer-docked .MuiList-root": {
                display: "flex",
                flexDirection: "column",
                gap: "6px",
                paddingTop: "10px !important",
                paddingBottom: "10px !important",
              },
              "nav:has([data-sidebar-collapsed='true']) .MuiList-root": {
                alignItems: "center",
              },
              "nav:has([data-sidebar-collapsed='false']) .MuiList-root": {
                alignItems: "stretch",
                paddingLeft: "10px !important",
                paddingRight: "10px !important",
              },
              ".MuiDrawer-docked .MuiListItemButton-root": {
                minHeight: "42px",
                position: "relative",
                borderRadius: "14px",
                display: "flex",
                alignItems: "center",
                maxWidth: "100%",
                transition:
                  "background-color 180ms ease, color 180ms ease, box-shadow 180ms ease, transform 180ms ease",
              },
              "nav:has([data-sidebar-collapsed='true']) .MuiListItemButton-root":
                {
                  width: "42px",
                  paddingLeft: "0 !important",
                  paddingRight: "0 !important",
                  justifyContent: "center",
                  overflow: "visible",
                },
              "nav:has([data-sidebar-collapsed='false']) .MuiListItemButton-root":
                {
                  width: "100%",
                  paddingLeft: "12px !important",
                  paddingRight: "12px !important",
                  justifyContent: "flex-start",
                  overflow: "hidden",
                },
              ".MuiDrawer-docked .MuiListItemIcon-root": {
                width: "38px",
                height: "34px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "10px",
                transition:
                  "background-color 180ms ease, transform 260ms cubic-bezier(0.2, 0.8, 0.2, 1), color 180ms ease",
              },
              ".MuiDrawer-docked .MuiListItemIcon-root .MuiSvgIcon-root": {
                fontSize: "22px",
              },
              "nav:has([data-sidebar-collapsed='true']) .MuiListItemIcon-root":
                {
                  minWidth: "0 !important",
                  marginRight: "0 !important",
                },
              "nav:has([data-sidebar-collapsed='false']) .MuiListItemIcon-root":
                {
                  minWidth: "38px !important",
                  marginRight: "8px !important",
                  flexShrink: 0,
                },
              "nav:has([data-sidebar-collapsed='true']) .MuiListItemText-root":
                {
                  position: "absolute",
                  left: "64px",
                  top: "50%",
                  minWidth: "172px",
                  margin: 0,
                  padding: "10px 16px",
                  borderRadius: "999px",
                  color: "background.paper",
                  backgroundColor: "text.primary",
                  boxShadow: "0 14px 34px rgba(15, 23, 42, 0.26)",
                  opacity: 0,
                  pointerEvents: "none",
                  transform:
                    "translate(-26px, -50%) scale(0.9) rotateY(-18deg)",
                  transformOrigin: "left center",
                  perspective: "600px",
                  transition:
                    "opacity 240ms ease, transform 300ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 220ms ease",
                  whiteSpace: "nowrap",
                },
              "nav:has([data-sidebar-collapsed='false']) .MuiListItemText-root":
                {
                  position: "static !important",
                  minWidth: "0 !important",
                  margin: "0 !important",
                  padding: "0 !important",
                  borderRadius: "0 !important",
                  color: "inherit !important",
                  backgroundColor: "transparent !important",
                  boxShadow: "none !important",
                  opacity: "1 !important",
                  pointerEvents: "auto !important",
                  transform: "none !important",
                  whiteSpace: "normal !important",
                  overflow: "hidden !important",
                  flex: "1 1 auto",
                },
              ".MuiDrawer-docked .MuiListItemText-primary": {
                fontWeight: 700,
                letterSpacing: "0 !important",
                transition:
                  "transform 260ms cubic-bezier(0.16, 1, 0.3, 1), color 180ms ease",
              },
              "nav:has([data-sidebar-collapsed='true']) .MuiListItemText-root::before":
                {
                  content: "\"\"",
                  position: "absolute",
                  left: "-6px",
                  top: "50%",
                  width: "12px",
                  height: "12px",
                  backgroundColor: "text.primary",
                  transform: "translateY(-50%) rotate(45deg)",
                  borderRadius: "4px",
                },
              "nav:has([data-sidebar-collapsed='false']) .MuiListItemText-root::before":
                {
                  content: "none !important",
                },
              "nav:has([data-sidebar-collapsed='false']) .MuiListItemText-primary":
                {
                  display: "block",
                  maxWidth: "100%",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  lineHeight: 1.25,
              },
              ".MuiDrawer-docked .MuiListItemButton-root:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.22)",
                boxShadow:
                  "0 8px 20px rgba(15, 23, 42, 0.14), inset 3px 0 0 currentColor",
                transform: "translateX(2px)",
              },
              ".MuiDrawer-docked .MuiListItemButton-root:hover .MuiListItemIcon-root":
                {
                  animation:
                    "sidebarIconTwist 300ms cubic-bezier(0.16, 1, 0.3, 1) both",
                },
              "nav:has([data-sidebar-collapsed='true']) .MuiListItemButton-root:hover .MuiListItemText-root":
                {
                  animation:
                    "sidebarLabelFloat 360ms cubic-bezier(0.16, 1, 0.3, 1) both",
                  boxShadow: "0 18px 38px rgba(15, 23, 42, 0.32)",
                },
              ".MuiDrawer-docked .MuiListItemButton-root:hover .MuiListItemText-primary":
                {
                  transform: "translateX(3px)",
                },
              ".MuiDrawer-docked .MuiListItemButton-root.Mui-selected": {
                backgroundColor: "primary.main",
                color: "primary.contrastText",
                boxShadow:
                  "0 10px 24px rgba(25, 118, 210, 0.28), inset 3px 0 0 rgba(255,255,255,0.78)",
                animation: "sidebarActiveGlow 2200ms ease-in-out infinite",
              },
              ".MuiDrawer-docked .MuiListItemButton-root.Mui-selected:hover": {
                backgroundColor: "primary.dark",
              },
              ".MuiDrawer-docked .MuiListItemButton-root.Mui-selected .MuiListItemIcon-root":
                {
                  transform: "scale(1.08)",
                },
              ".MuiDrawer-docked .MuiListItemButton-root.Mui-selected:hover .MuiListItemIcon-root":
                {
                  transform: "rotate(-10deg) scale(1.16)",
                },
              "nav:has([data-sidebar-collapsed='true']) .MuiListItemButton-root.Mui-selected .MuiListItemText-root":
                {
                  backgroundColor: "primary.main",
                  color: "primary.contrastText",
                },
              "nav:has([data-sidebar-collapsed='true']) .MuiListItemButton-root.Mui-selected .MuiListItemText-root::before":
                {
                  backgroundColor: "primary.main",
                },
              "nav:has([data-sidebar-collapsed='true']) .MuiListItemButton-root.Mui-selected:hover .MuiListItemText-root":
                {
                  backgroundColor: "primary.dark",
                },
              "nav:has([data-sidebar-collapsed='true']) .MuiListItemButton-root.Mui-selected:hover .MuiListItemText-root::before":
                {
                  backgroundColor: "primary.dark",
                },
              ".MuiDrawer-docked a": {
                textDecoration: "none",
              },
            },
          }}
        />
        <RefineSnackbarProvider>
          <Refine
            dataProvider={{
              default: siteProvider,
              sensors: sensorProvider,
              limits: limitsProvider,
              users: userProvider,
              archives: archivesProvider,
            }}
            notificationProvider={useNotificationProvider}
            routerProvider={routerProvider}
            authProvider={authProvider}
            resources={resources}
            options={{
              syncWithLocation: true,
              warnWhenUnsavedChanges: true,
              breadcrumb: false,
              useNewQueryKeys: true,
              projectId: "u4D9YG-XrYklo-sAluut",
            }}
          >
            <Routes />
            <RefineKbar />
            <UnsavedChangesNotifier />
          </Refine>
        </RefineSnackbarProvider>
      </RefineKbarProvider>
    </BrowserRouter>
  );
};

export default App;

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
              "0%": { transform: "translateX(0) scale(1)" },
              "55%": { transform: "translateX(3px) scale(1.14)" },
              "100%": { transform: "translateX(1px) scale(1.08)" },
            },
            "@keyframes sidebarItemReveal": {
              "0%": {
                opacity: 0,
                transform: "translateX(-18px) scale(0.98)",
              },
              "60%": {
                opacity: 1,
                transform: "translateX(4px) scale(1.01)",
              },
              "100%": {
                opacity: 1,
                transform: "translateX(0) scale(1)",
              },
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
                  "0 10px 24px rgba(25, 118, 210, 0.14), inset 3px 0 0 currentColor",
              },
              "50%": {
                boxShadow:
                  "0 14px 30px rgba(25, 118, 210, 0.22), inset 3px 0 0 currentColor",
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
                  width: "0 !important",
                  minWidth: "0 !important",
                  height: "100dvh !important",
                },
              ".MuiBox-root:has(> nav [data-sidebar-collapsed='false']) > .MuiBox-root:first-of-type":
                {
                  width: "0 !important",
                  minWidth: "0 !important",
                  height: "100dvh !important",
                },
              ".MuiBox-root:has(> nav [data-sidebar-collapsed='true']) > nav": {
                position: "fixed !important",
                top: "0 !important",
                left: "0 !important",
                bottom: "0 !important",
                width: "52px !important",
                overflow: "visible !important",
                zIndex: 1300,
                transition:
                  "width 320ms cubic-bezier(0.16, 1, 0.3, 1)",
              },
              ".MuiBox-root:has(> nav [data-sidebar-collapsed='false']) > nav": {
                position: "fixed !important",
                top: "0 !important",
                left: "0 !important",
                bottom: "0 !important",
                width: "260px !important",
                overflow: "visible !important",
                zIndex: 1300,
                transition:
                  "width 320ms cubic-bezier(0.16, 1, 0.3, 1)",
              },
              ".MuiBox-root:has(> nav [data-sidebar-collapsed='true']) > main.MuiBox-root":
                {
                  width: "100% !important",
                  maxWidth: "100% !important",
                },
              ".MuiBox-root:has(> nav [data-sidebar-collapsed='false']) > main.MuiBox-root":
                {
                  width: "100% !important",
                  maxWidth: "100% !important",
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
                background: "rgba(255, 255, 255, 0.30) !important",
                backgroundColor: "rgba(255, 255, 255, 0.30) !important",
                backdropFilter: "blur(8px)",
                boxShadow: "8px 0 24px rgba(15, 23, 42, 0.08)",
                transition:
                  "width 320ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 220ms ease, background-color 220ms ease",
              },
              ".MuiBox-root:has(> nav [data-sidebar-collapsed='true']) .dashboard-alert-shell":
                {
                  left: "64px !important",
                  width: "calc(100% - 64px) !important",
                },
              ".MuiBox-root:has(> nav [data-sidebar-collapsed='false']) .dashboard-alert-shell":
                {
                  left: "272px !important",
                  width: "calc(100% - 272px) !important",
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
                background: "rgba(255, 255, 255, 0.30) !important",
                backgroundColor: "rgba(255, 255, 255, 0.30) !important",
                backdropFilter: "blur(8px)",
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
                background: "rgba(255, 255, 255, 0.30) !important",
                backgroundColor: "rgba(255, 255, 255, 0.30) !important",
                backdropFilter: "blur(8px)",
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
                background: "rgba(255, 255, 255, 0.30) !important",
                backgroundColor: "rgba(255, 255, 255, 0.30) !important",
                backdropFilter: "blur(8px)",
              },
              ".MuiDrawer-docked .MuiListItem-root": {
                background: "transparent !important",
                backgroundColor: "transparent !important",
              },
              "nav:has([data-sidebar-collapsed='true']) .MuiList-root": {
                alignItems: "center",
                opacity: 0,
                pointerEvents: "none",
                transform: "translateX(-14px)",
                transition:
                  "opacity 180ms ease, transform 180ms ease",
              },
              "nav:has([data-sidebar-collapsed='false']) .MuiList-root": {
                display: "flex !important",
                opacity: "1 !important",
                pointerEvents: "auto !important",
                transform: "translateX(0) !important",
                alignItems: "stretch",
                paddingLeft: "10px !important",
                paddingRight: "10px !important",
                animation:
                  "sidebarItemReveal 320ms cubic-bezier(0.16, 1, 0.3, 1) both",
              },
              ".MuiDrawer-docked .MuiListItemButton-root": {
                minHeight: "42px",
                position: "relative",
                borderRadius: "14px",
                display: "flex",
                alignItems: "center",
                maxWidth: "100%",
                backgroundColor: "transparent !important",
                backdropFilter: "none",
                transition:
                  "background-color 180ms ease, color 180ms ease, box-shadow 220ms ease, transform 220ms cubic-bezier(0.16, 1, 0.3, 1)",
              },
              "nav:has([data-sidebar-collapsed='true']) .MuiListItemButton-root":
                {
                  width: "42px",
                  paddingLeft: "0 !important",
                  paddingRight: "0 !important",
                  justifyContent: "center",
                  overflow: "hidden",
                  opacity: 0,
                  pointerEvents: "none",
                },
              "nav:has([data-sidebar-collapsed='false']) .MuiListItemButton-root":
                {
                  display: "flex !important",
                  opacity: "1 !important",
                  pointerEvents: "auto !important",
                  visibility: "visible !important",
                  width: "100%",
                  paddingLeft: "12px !important",
                  paddingRight: "12px !important",
                  justifyContent: "flex-start",
                  overflow: "hidden",
                  animation:
                    "sidebarItemReveal 340ms cubic-bezier(0.16, 1, 0.3, 1) both",
                },
              "nav:has([data-sidebar-collapsed='false']) .MuiListItemButton-root .MuiListItemText-root":
                {
                  display: "block !important",
                  visibility: "visible !important",
                  opacity: "1 !important",
                  width: "auto !important",
                  maxWidth: "calc(100% - 46px) !important",
                },
              "nav:has([data-sidebar-collapsed='false']) .MuiListItemButton-root .MuiListItemText-primary":
                {
                  display: "block !important",
                  visibility: "visible !important",
                  opacity: "1 !important",
                },
              "nav:has([data-sidebar-collapsed='false']) .MuiList-root, nav:has([data-sidebar-collapsed='false']) .MuiListItem-root, nav:has([data-sidebar-collapsed='false']) .MuiListItemButton-root":
                {
                  display: "flex !important",
                  visibility: "visible !important",
                  opacity: "1 !important",
                  pointerEvents: "auto !important",
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
                  opacity: 0,
                  visibility: "hidden",
                  minWidth: "0 !important",
                  marginRight: "0 !important",
                },
              "nav:has([data-sidebar-collapsed='false']) .MuiListItemIcon-root":
                {
                  display: "inline-flex !important",
                  visibility: "visible !important",
                  minWidth: "38px !important",
                  marginRight: "8px !important",
                  flexShrink: 0,
                },
              "nav:has([data-sidebar-collapsed='true']) .MuiListItemText-root":
                {
                  display: "none !important",
                  visibility: "hidden !important",
                  opacity: "0 !important",
                  pointerEvents: "none !important",
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
                  display: "block !important",
                  visibility: "visible !important",
                  width: "auto !important",
                  maxWidth: "calc(100% - 46px) !important",
                },
              ".MuiDrawer-docked .MuiListItemText-primary": {
                fontWeight: 700,
                letterSpacing: "0 !important",
                transition:
                  "transform 260ms cubic-bezier(0.16, 1, 0.3, 1), color 180ms ease",
              },
              "nav:has([data-sidebar-collapsed='true']) .MuiListItemText-root::before":
                {
                  content: "none !important",
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
                backgroundColor: "rgba(255, 255, 255, 0.30) !important",
                backdropFilter: "blur(5px)",
                boxShadow:
                  "0 8px 20px rgba(15, 23, 42, 0.12), inset 3px 0 0 currentColor",
                transform: "translateX(4px)",
              },
              ".MuiDrawer-docked .MuiListItemButton-root:hover .MuiListItemIcon-root":
                {
                  animation:
                    "sidebarIconTwist 300ms cubic-bezier(0.16, 1, 0.3, 1) both",
                },
              "nav:has([data-sidebar-collapsed='true']) .MuiListItemButton-root:hover .MuiListItemText-root":
                {
                  display: "none !important",
                  visibility: "hidden !important",
                  opacity: "0 !important",
                  animation: "none !important",
                },
              ".MuiDrawer-docked .MuiListItemButton-root:hover .MuiListItemText-primary":
                {
                  transform: "translateX(4px)",
                },
              ".MuiDrawer-docked .MuiListItemButton-root.Mui-selected": {
                backgroundColor: "rgba(25, 118, 210, 0.30) !important",
                color: "primary.main",
                backdropFilter: "blur(6px)",
                boxShadow:
                  "0 10px 24px rgba(25, 118, 210, 0.16), inset 3px 0 0 currentColor",
                animation: "sidebarActiveGlow 2200ms ease-in-out infinite",
              },
              ".MuiDrawer-docked .MuiListItemButton-root.Mui-selected:hover": {
                backgroundColor: "rgba(25, 118, 210, 0.36) !important",
              },
              ".MuiDrawer-docked .MuiListItemButton-root.Mui-selected .MuiListItemIcon-root":
                {
                  color: "primary.main",
                  transform: "scale(1.08)",
                },
              ".MuiDrawer-docked .MuiListItemButton-root.Mui-selected:hover .MuiListItemIcon-root":
                {
                  transform: "translateX(2px) scale(1.14)",
                },
              "nav:has([data-sidebar-collapsed='true']) .MuiListItemButton-root.Mui-selected .MuiListItemText-root":
                {
                  display: "none !important",
                  visibility: "hidden !important",
                  opacity: "0 !important",
                },
              "nav:has([data-sidebar-collapsed='true']) .MuiListItemButton-root.Mui-selected .MuiListItemText-root::before":
                {
                  content: "none !important",
                },
              "nav:has([data-sidebar-collapsed='true']) .MuiListItemButton-root.Mui-selected:hover .MuiListItemText-root":
                {
                  display: "none !important",
                  visibility: "hidden !important",
                  opacity: "0 !important",
                },
              "nav:has([data-sidebar-collapsed='true']) .MuiListItemButton-root.Mui-selected:hover .MuiListItemText-root::before":
                {
                  content: "none !important",
                },
              ".MuiDrawer-docked:has([data-sidebar-collapsed='false']) .MuiList-root":
                {
                  display: "flex !important",
                  opacity: "1 !important",
                  visibility: "visible !important",
                  pointerEvents: "auto !important",
                  transform: "translateX(0) !important",
                  alignItems: "stretch !important",
                },
              ".MuiDrawer-docked:has([data-sidebar-collapsed='false']) .MuiListItem-root":
                {
                  display: "block !important",
                  opacity: "1 !important",
                  visibility: "visible !important",
                },
              ".MuiDrawer-docked:has([data-sidebar-collapsed='false']) .MuiListItemButton-root":
                {
                  display: "flex !important",
                  opacity: "1 !important",
                  visibility: "visible !important",
                  pointerEvents: "auto !important",
                  width: "100% !important",
                  justifyContent: "flex-start !important",
                },
              ".MuiDrawer-docked:has([data-sidebar-collapsed='false']) .MuiListItemIcon-root":
                {
                  display: "inline-flex !important",
                  opacity: "1 !important",
                  visibility: "visible !important",
                  minWidth: "38px !important",
                  width: "38px !important",
                  marginRight: "8px !important",
                },
              ".MuiDrawer-docked:has([data-sidebar-collapsed='false']) .MuiListItemText-root":
                {
                  display: "block !important",
                  opacity: "1 !important",
                  visibility: "visible !important",
                  position: "static !important",
                  transform: "none !important",
                  pointerEvents: "auto !important",
                  flex: "1 1 auto !important",
                  minWidth: "0 !important",
                  maxWidth: "calc(100% - 46px) !important",
                },
              ".MuiDrawer-docked:has([data-sidebar-collapsed='false']) .MuiListItemText-primary":
                {
                  display: "block !important",
                  opacity: "1 !important",
                  visibility: "visible !important",
                  overflow: "hidden !important",
                  textOverflow: "ellipsis !important",
                  whiteSpace: "nowrap !important",
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

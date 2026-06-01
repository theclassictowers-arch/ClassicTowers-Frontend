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
            "main.MuiBox-root": {
              padding: "0 !important",
              margin: "0 !important",
              overflow: "hidden",
            },
            "@media (min-width: 900px)": {
              ".MuiBox-root:has(> nav .MuiDrawer-docked) > .MuiBox-root:first-of-type":
                {
                  width: "48px !important",
                  minWidth: "48px !important",
                },
              ".MuiBox-root:has(> nav .MuiDrawer-docked) > nav": {
                width: "48px !important",
                overflow: "visible !important",
                zIndex: 1300,
              },
              ".MuiDrawer-docked": {
                overflow: "visible !important",
              },
              ".MuiDrawer-docked .MuiDrawer-paper": {
                width: "48px !important",
                overflow: "visible !important",
              },
              ".MuiDrawer-docked .MuiDrawer-paper > .MuiBox-root": {
                overflow: "visible !important",
              },
              ".MuiDrawer-docked .MuiPaper-root": {
                height: "52px !important",
                minHeight: "52px !important",
                paddingLeft: "0 !important",
                paddingRight: "0 !important",
              },
              ".MuiDrawer-docked .MuiList-root": {
                paddingTop: "6px !important",
              },
              ".MuiDrawer-docked .MuiListItemButton-root": {
                minHeight: "44px",
                width: "48px",
                paddingLeft: "0 !important",
                paddingRight: "0 !important",
                justifyContent: "center",
                position: "relative",
                overflow: "visible",
                borderRadius: "0 18px 18px 0",
                transition:
                  "background-color 180ms ease, color 180ms ease, box-shadow 180ms ease",
              },
              ".MuiDrawer-docked .MuiListItemIcon-root": {
                minWidth: "0 !important",
                marginRight: "0 !important",
                transition:
                  "transform 260ms cubic-bezier(0.2, 0.8, 0.2, 1), color 180ms ease",
              },
              ".MuiDrawer-docked .MuiListItemText-root": {
                position: "absolute",
                left: "56px",
                top: "50%",
                minWidth: "150px",
                margin: 0,
                padding: "9px 14px",
                borderRadius: "0 18px 18px 0",
                color: "background.paper",
                backgroundColor: "text.primary",
                boxShadow: "0 10px 28px rgba(15, 23, 42, 0.24)",
                opacity: 0,
                pointerEvents: "none",
                transform: "translate(-14px, -50%) scale(0.94)",
                transformOrigin: "left center",
                transition:
                  "opacity 220ms ease, transform 260ms cubic-bezier(0.2, 0.8, 0.2, 1)",
                whiteSpace: "nowrap",
              },
              ".MuiDrawer-docked .MuiListItemText-primary": {
                fontWeight: 700,
                letterSpacing: "0 !important",
              },
              ".MuiDrawer-docked .MuiListItemText-root::before": {
                content: "\"\"",
                position: "absolute",
                left: "-7px",
                top: "50%",
                width: "14px",
                height: "14px",
                backgroundColor: "text.primary",
                transform: "translateY(-50%) rotate(45deg)",
                borderRadius: "3px",
              },
              ".MuiDrawer-docked .MuiListItemButton-root:hover": {
                backgroundColor: "action.hover",
                boxShadow: "inset 3px 0 0 currentColor",
              },
              ".MuiDrawer-docked .MuiListItemButton-root:hover .MuiListItemIcon-root":
                {
                  transform: "rotate(-10deg) scale(1.12)",
                },
              ".MuiDrawer-docked .MuiListItemButton-root:hover .MuiListItemText-root":
                {
                  opacity: 1,
                  transform: "translate(0, -50%) scale(1)",
                },
              ".MuiDrawer-docked .MuiListItemButton-root.Mui-selected": {
                backgroundColor: "primary.main",
                color: "primary.contrastText",
                boxShadow: "inset 3px 0 0 currentColor",
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
              ".MuiDrawer-docked .MuiListItemButton-root.Mui-selected .MuiListItemText-root":
                {
                  backgroundColor: "primary.main",
                  color: "primary.contrastText",
                },
              ".MuiDrawer-docked .MuiListItemButton-root.Mui-selected .MuiListItemText-root::before":
                {
                  backgroundColor: "primary.main",
                },
              ".MuiDrawer-docked .MuiListItemButton-root.Mui-selected:hover .MuiListItemText-root":
                {
                  backgroundColor: "primary.dark",
                },
              ".MuiDrawer-docked .MuiListItemButton-root.Mui-selected:hover .MuiListItemText-root::before":
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

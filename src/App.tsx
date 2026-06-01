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
              },
              ".MuiDrawer-docked .MuiDrawer-paper": {
                width: "48px !important",
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
                paddingLeft: "0 !important",
                paddingRight: "0 !important",
                justifyContent: "center",
              },
              ".MuiDrawer-docked .MuiListItemIcon-root": {
                minWidth: "0 !important",
                marginRight: "0 !important",
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

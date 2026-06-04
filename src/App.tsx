import React from "react";
import { BrowserRouter } from "react-router-dom";
import { useEffect } from "react";
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

import {
  useAuthContext,
  useColorModeContext,
  useLogoutConfirm,
} from "./contexts";
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
  const { dashboardTheme } = useColorModeContext();
  const { confirm } = useLogoutConfirm();
  const authProvider = useAuthProvider(confirm);
  const resources = role ? getResources(role) : [];

  useEffect(() => {
    const splitSidebarLabels = () => {
      document
        .querySelectorAll<HTMLElement>(
          ".MuiDrawer-docked .MuiListItemText-primary"
        )
        .forEach((label) => {
          if (label.dataset.sidebarCharacters === "true") return;

          const text = label.textContent ?? "";
          if (!text.trim()) return;

          label.dataset.sidebarCharacters = "true";
          label.setAttribute("aria-label", text);
          label.textContent = "";

          Array.from(text).forEach((character, index) => {
            const characterNode = document.createElement("span");
            characterNode.className =
              character === " "
                ? "sidebar-menu-char sidebar-menu-space"
                : "sidebar-menu-char";
            characterNode.style.setProperty("--char-index", String(index));
            characterNode.textContent =
              character === " " ? "\u00a0" : character;
            label.appendChild(characterNode);
          });
        });
    };

    splitSidebarLabels();

    const observer = new MutationObserver(splitSidebarLabels);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, [role]);

  return (
    <BrowserRouter>
      <RefineKbarProvider>
        <CssBaseline />
        <GlobalStyles
          styles={{
            html: {
              WebkitFontSmoothing: "auto",
              backgroundColor: dashboardTheme.backgroundColor,
            },
            body: {
              margin: 0,
              padding: 0,
              backgroundColor: `${dashboardTheme.backgroundColor} !important`,
            },
            "#root": {
              minHeight: "100dvh",
              backgroundColor: dashboardTheme.backgroundColor,
            },
            "@keyframes sidebarIconTwist": {
              "0%": {
                transform: "translateX(0) translateZ(0) rotateY(0deg) scale(1)",
              },
              "55%": {
                transform:
                  "translateX(3px) translateZ(12px) rotateY(-18deg) scale(1.14)",
              },
              "100%": {
                transform:
                  "translateX(1px) translateZ(4px) rotateY(-7deg) scale(1.08)",
              },
            },
            "@keyframes sidebarTextFlip": {
              "0%": {
                transform: "translateX(0) translateZ(0) rotateX(0deg)",
              },
              "45%": {
                transform: "translateX(3px) translateZ(10px) rotateX(10deg)",
              },
              "100%": {
                transform: "translateX(1px) translateZ(3px) rotateX(0deg)",
              },
            },
            "@keyframes sidebarCharacterDrop": {
              "0%": {
                transform:
                  "translateY(-14px) translateZ(8px) rotateX(-82deg) scale(0.94)",
                opacity: 0.25,
              },
              "48%": {
                transform:
                  "translateY(5px) translateZ(14px) rotateX(18deg) scale(1.08)",
                opacity: 1,
              },
              "76%": {
                transform:
                  "translateY(-2px) translateZ(5px) rotateX(-7deg) scale(1.02)",
                opacity: 1,
              },
              "100%": {
                transform: "translateY(0) translateZ(0) rotateX(0deg) scale(1)",
                opacity: 1,
              },
            },
            "@keyframes sidebarIconDrop": {
              "0%": {
                transform:
                  "translateY(-10px) translateZ(0) rotateX(-55deg) rotateZ(-8deg) scale(0.96)",
              },
              "48%": {
                transform:
                  "translateY(6px) translateZ(15px) rotateX(18deg) rotateZ(8deg) scale(1.16)",
              },
              "76%": {
                transform:
                  "translateY(-2px) translateZ(8px) rotateX(-8deg) rotateZ(-3deg) scale(1.1)",
              },
              "100%": {
                transform:
                  "translateY(0) translateZ(3px) rotateX(0deg) rotateZ(0deg) scale(1.08)",
              },
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
                  "0 8px 18px rgba(25, 118, 210, 0.14), inset 3px 0 0 currentColor, inset 0 1px 0 rgba(255, 255, 255, 0.3)",
              },
              "50%": {
                boxShadow:
                  "0 12px 24px rgba(25, 118, 210, 0.22), inset 3px 0 0 currentColor, inset 0 1px 0 rgba(255, 255, 255, 0.38)",
              },
            },
            "main.MuiBox-root": {
              padding: "0 !important",
              margin: "0 !important",
              overflow: "hidden",
              backgroundColor: `${dashboardTheme.backgroundColor} !important`,
            },
            "main.MuiBox-root .MuiPaper-root:not(.MuiDrawer-paper), main.MuiBox-root .MuiCard-root, main.MuiBox-root form":
              {
                background: `color-mix(in srgb, ${dashboardTheme.backgroundColor} 34%, transparent) !important`,
                backgroundColor: `color-mix(in srgb, ${dashboardTheme.backgroundColor} 34%, transparent) !important`,
                backdropFilter: "blur(6px)",
                WebkitBackdropFilter: "blur(6px)",
                borderColor: "rgba(148, 163, 184, 0.22)",
              },
            "main.MuiBox-root .MuiDataGrid-root, main.MuiBox-root .MuiDataGrid-toolbarContainer, main.MuiBox-root .MuiDataGrid-columnHeaders, main.MuiBox-root .MuiDataGrid-row":
              {
                backgroundColor: `color-mix(in srgb, ${dashboardTheme.backgroundColor} 30%, transparent) !important`,
                backdropFilter: "blur(4px)",
                WebkitBackdropFilter: "blur(4px)",
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
                transition: "width 320ms cubic-bezier(0.16, 1, 0.3, 1)",
              },
              ".MuiBox-root:has(> nav [data-sidebar-collapsed='false']) > nav":
                {
                  position: "fixed !important",
                  top: "0 !important",
                  left: "0 !important",
                  bottom: "0 !important",
                  width: "240px !important",
                  overflow: "visible !important",
                  zIndex: 1300,
                  transition: "width 320ms cubic-bezier(0.16, 1, 0.3, 1)",
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
                  paddingLeft: "264px !important",
                },
              ".MuiDrawer-docked": {
                height: "100dvh !important",
                overflow: "visible !important",
              },
              // Fallback: make sidebar visible when refine opens it
              "nav .MuiDrawer-paper[aria-hidden='false'], nav .MuiDrawer-paper":
                {
                  minWidth: "52px !important",
                },
              "nav .MuiDrawer-paper .MuiList-root": {
                minHeight: "calc(100dvh - 56px) !important",
                height: "calc(100dvh - 56px) !important",
              },
              ".MuiDrawer-docked .MuiDrawer-paper": {
                position: "fixed !important",
                top: "0 !important",
                left: "0 !important",
                bottom: "0 !important",
                height: "100dvh !important",
                maxHeight: "100dvh !important",
                overflow: "visible !important",
                zIndex: "1300 !important",
                borderRight: "1px solid rgba(148, 163, 184, 0.18)",
                background: "rgba(255, 255, 255, 0.10) !important",
                backgroundColor: "rgba(255, 255, 255, 0.10) !important",
                backdropFilter: "blur(6px)",
                boxShadow: "6px 0 18px rgba(15, 23, 42, 0.06)",
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
                  left: "252px !important",
                  width: "calc(100% - 252px) !important",
                },
              "nav:has([data-sidebar-collapsed='true']) .MuiDrawer-paper": {
                width: "52px !important",
                height: "56px !important",
                minHeight: "56px !important",
                maxHeight: "56px !important",
                overflow: "hidden !important",
                borderRight: "0 !important",
                background: "transparent !important",
                backgroundColor: "transparent !important",
                boxShadow: "none !important",
              },
              "nav:has([data-sidebar-collapsed='false']) .MuiDrawer-paper": {
                width: "240px !important",
                overflow: "hidden !important",
              },
              "nav:has([data-sidebar-collapsed='false']) .MuiDrawer-paper *": {
                boxSizing: "border-box",
              },
              // Sidebar header only - do not apply this to Drawer paper
              ".MuiDrawer-docked .MuiDrawer-paper > .MuiPaper-root:not(.MuiDrawer-paper)":
                {
                  height: "56px !important",
                  minHeight: "56px !important",
                  paddingLeft: "0 !important",
                  paddingRight: "0 !important",
                  background: "rgba(255, 255, 255, 0.10) !important",
                  backgroundColor: "rgba(255, 255, 255, 0.10) !important",
                  backdropFilter: "blur(6px)",
                  borderBottom: "1px solid rgba(148, 163, 184, 0.22)",
                },
              "nav:has([data-sidebar-collapsed='false']) .MuiDrawer-paper > .MuiPaper-root:not(.MuiDrawer-paper)":
                {
                  paddingLeft: "14px !important",
                  paddingRight: "10px !important",
                  justifyContent: "space-between !important",
                },
              "nav:has([data-sidebar-collapsed='true']) .MuiDrawer-paper > .MuiPaper-root:not(.MuiDrawer-paper)":
                {
                  display: "flex !important",
                  background: "rgba(255, 255, 255, 0.16) !important",
                  backgroundColor: "rgba(255, 255, 255, 0.16) !important",
                  backdropFilter: "blur(6px)",
                  borderBottom: "0 !important",
                  borderRight: "1px solid rgba(148, 163, 184, 0.18)",
                  boxShadow: "6px 0 18px rgba(15, 23, 42, 0.06)",
                },
              ".MuiDrawer-docked .MuiPaper-root .MuiIconButton-root": {
                width: "34px",
                height: "34px",
                borderRadius: "12px",
                transition:
                  "background-color 180ms ease, transform 180ms ease, box-shadow 180ms ease",
              },
              ".MuiDrawer-docked .MuiPaper-root .MuiIconButton-root:hover": {
                backgroundColor: "transparent",
                boxShadow: "none",
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
                background: "rgba(255, 255, 255, 0.10) !important",
                backgroundColor: "rgba(255, 255, 255, 0.10) !important",
                backdropFilter: "blur(6px)",
              },
              "nav:has([data-sidebar-collapsed='true']) .MuiDrawer-paper > .MuiBox-root":
                {
                  display: "none !important",
                  height: "0 !important",
                  overflow: "hidden !important",
                  background: "transparent !important",
                  backgroundColor: "transparent !important",
                },
              "nav:has([data-sidebar-collapsed='false']) .MuiDrawer-paper > .MuiBox-root":
                {
                  display: "flex !important",
                  flexDirection: "column !important",
                  overflowX: "hidden !important",
                  overflowY: "auto !important",
                },
              ".MuiDrawer-docked .MuiList-root": {
                display: "flex",
                flexDirection: "column",
                gap: "3px",
                paddingTop: "4px !important",
                paddingBottom: "4px !important",
                background: "transparent !important",
                backgroundColor: "transparent !important",
                backdropFilter: "none",
              },
              ".MuiDrawer-docked .MuiListItem-root": {
                background: "transparent !important",
                backgroundColor: "transparent !important",
                minHeight: "46px !important",
                height: "46px !important",
                padding: "0 !important",
                paddingTop: "0 !important",
                paddingBottom: "0 !important",
                paddingLeft: "0 !important",
                paddingRight: "0 !important",
              },
              ".MuiDrawer-docked .MuiList-root > .MuiListItem-root:last-child":
                {
                  marginTop: "auto !important",
                  marginBottom: "0 !important",
                },
              ".MuiDrawer-docked .MuiList-root > *:last-child": {
                marginTop: "auto !important",
              },
              "nav:has([data-sidebar-collapsed='true']):not(:has([data-sidebar-collapsed='false'])) .MuiList-root":
                {
                  display: "none !important",
                  visibility: "hidden !important",
                  opacity: "0 !important",
                  pointerEvents: "none",
                  transform: "translateX(-14px)",
                  transition: "opacity 180ms ease, transform 180ms ease",
                },
              "nav:has([data-sidebar-collapsed='false']) .MuiList-root": {
                display: "flex !important",
                opacity: "1 !important",
                pointerEvents: "auto !important",
                transform: "translateX(0) !important",
                alignItems: "stretch",
                flex: "1 1 auto !important",
                minHeight: "calc(100dvh - 56px) !important",
                paddingLeft: "6px !important",
                paddingRight: "6px !important",
                animation:
                  "sidebarItemReveal 320ms cubic-bezier(0.16, 1, 0.3, 1) both",
              },
              ".MuiDrawer-docked .MuiListItemButton-root": {
                minHeight: "44px !important",
                height: "44px !important",
                position: "relative",
                borderRadius: "7px",
                display: "flex",
                alignItems: "center",
                maxWidth: "100%",
                paddingTop: "0 !important",
                paddingBottom: "0 !important",
                border: "1px solid rgba(15, 23, 42, 0.14)",
                background: "rgba(255, 255, 255, 0.06) !important",
                backgroundColor: "rgba(255, 255, 255, 0.06) !important",
                backdropFilter: "none",
                boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.18)",
                perspective: "900px",
                transformStyle: "preserve-3d",
                transition:
                  "background-color 180ms ease, color 180ms ease, box-shadow 220ms ease, transform 260ms cubic-bezier(0.16, 1, 0.3, 1)",
              },
              "nav:has([data-sidebar-collapsed='true']):not(:has([data-sidebar-collapsed='false'])) .MuiListItemButton-root":
                {
                  width: "38px",
                  paddingLeft: "0 !important",
                  paddingRight: "0 !important",
                  paddingTop: "1px !important",
                  paddingBottom: "1px !important",
                  justifyContent: "center",
                  overflow: "hidden",
                  opacity: 0,
                  pointerEvents: "none",
                },
              "nav:has([data-sidebar-collapsed='false']) .MuiListItemButton-root":
                {
                  display: "grid !important",
                  gridTemplateColumns: "30px minmax(0, 1fr)",
                  columnGap: "8px",
                  opacity: "1 !important",
                  pointerEvents: "auto !important",
                  visibility: "visible !important",
                  width: "100%",
                  paddingLeft: "10px !important",
                  paddingRight: "10px !important",
                  paddingTop: "0 !important",
                  paddingBottom: "0 !important",
                  justifyContent: "stretch",
                  alignItems: "center !important",
                  overflow: "hidden",
                  animation:
                    "sidebarItemReveal 340ms cubic-bezier(0.16, 1, 0.3, 1) both",
                },
              "nav:has([data-sidebar-collapsed='false']) .MuiListItemButton-root .MuiListItemText-root":
                {
                  display: "flex !important",
                  alignItems: "center !important",
                  justifyContent: "flex-start !important",
                  visibility: "visible !important",
                  opacity: "1 !important",
                  minWidth: "0 !important",
                  width: "auto !important",
                  maxWidth: "100% !important",
                  height: "auto !important",
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
                width: "28px",
                height: "28px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "8px",
                transformOrigin: "center",
                transformStyle: "preserve-3d",
                transition:
                  "background-color 180ms ease, transform 320ms cubic-bezier(0.16, 1, 0.3, 1), color 180ms ease",
              },
              ".MuiDrawer-docked .MuiListItemIcon-root .MuiSvgIcon-root": {
                fontSize: "20px",
              },
              "nav:has([data-sidebar-collapsed='true']):not(:has([data-sidebar-collapsed='false'])) .MuiListItemIcon-root":
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
                  alignItems: "center !important",
                  justifyContent: "center !important",
                  minWidth: "28px !important",
                  width: "30px !important",
                  height: "28px !important",
                  marginRight: "0 !important",
                  flexShrink: 0,
                },
              "nav:has([data-sidebar-collapsed='true']):not(:has([data-sidebar-collapsed='false'])) .MuiListItemText-root":
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
                  display: "flex !important",
                  alignItems: "center !important",
                  justifyContent: "flex-start !important",
                  visibility: "visible !important",
                  width: "auto !important",
                  maxWidth: "100% !important",
                  height: "auto !important",
                },
              ".MuiDrawer-docked .MuiListItemText-primary": {
                fontSize: "0.95rem !important",
                fontWeight: 700,
                letterSpacing: "0 !important",
                transition:
                  "transform 260ms cubic-bezier(0.16, 1, 0.3, 1), color 180ms ease",
                transformOrigin: "left center",
                transformStyle: "preserve-3d",
              },
              ".MuiDrawer-docked .sidebar-menu-char": {
                display: "inline-block",
                transformOrigin: "left center",
                transformStyle: "preserve-3d",
                backfaceVisibility: "hidden",
                willChange: "transform",
              },
              ".MuiDrawer-docked .sidebar-menu-space": {
                width: "0.28em",
              },
              "nav:has([data-sidebar-collapsed='true']):not(:has([data-sidebar-collapsed='false'])) .MuiListItemText-root::before":
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
                  lineHeight: "1 !important",
                },
              ".MuiDrawer-docked .MuiListItemButton-root:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.12) !important",
                borderColor: "currentColor",
                backdropFilter: "blur(4px)",
                boxShadow:
                  "0 10px 22px rgba(15, 23, 42, 0.14), inset 3px 0 0 currentColor, inset 0 1px 0 rgba(255, 255, 255, 0.28)",
                transform:
                  "translateX(2px) perspective(900px) rotateY(-4deg) translateZ(2px)",
              },
              ".MuiDrawer-docked .MuiListItemButton-root:hover .MuiListItemIcon-root":
                {
                  animation:
                    "sidebarIconDrop 620ms cubic-bezier(0.16, 1, 0.3, 1) both",
                },
              "nav:has([data-sidebar-collapsed='true']):not(:has([data-sidebar-collapsed='false'])) .MuiListItemButton-root:hover .MuiListItemText-root":
                {
                  display: "none !important",
                  visibility: "hidden !important",
                  opacity: "0 !important",
                  animation: "none !important",
                },
              ".MuiDrawer-docked .MuiListItemButton-root:hover .MuiListItemText-primary":
                {
                  animation: "none",
                },
              ".MuiDrawer-docked .MuiListItemButton-root:hover .sidebar-menu-char":
                {
                  animation:
                    "sidebarCharacterDrop 560ms cubic-bezier(0.16, 1, 0.3, 1) both",
                  animationDelay: "calc(var(--char-index) * 30ms)",
                },
              ".MuiDrawer-docked .MuiListItemButton-root.Mui-selected": {
                backgroundColor: "rgba(25, 118, 210, 0.10) !important",
                borderColor: "currentColor",
                color: "primary.main",
                backdropFilter: "blur(4px)",
                boxShadow:
                  "0 8px 18px rgba(25, 118, 210, 0.14), inset 3px 0 0 currentColor, inset 0 1px 0 rgba(255, 255, 255, 0.3)",
                animation: "sidebarActiveGlow 2200ms ease-in-out infinite",
              },
              ".MuiDrawer-docked .MuiListItemButton-root.Mui-selected:hover": {
                backgroundColor: "rgba(25, 118, 210, 0.14) !important",
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
              "nav:has([data-sidebar-collapsed='true']):not(:has([data-sidebar-collapsed='false'])) .MuiListItemButton-root.Mui-selected .MuiListItemText-root":
                {
                  display: "none !important",
                  visibility: "hidden !important",
                  opacity: "0 !important",
                },
              "nav:has([data-sidebar-collapsed='true']):not(:has([data-sidebar-collapsed='false'])) .MuiListItemButton-root.Mui-selected .MuiListItemText-root::before":
                {
                  content: "none !important",
                },
              "nav:has([data-sidebar-collapsed='true']):not(:has([data-sidebar-collapsed='false'])) .MuiListItemButton-root.Mui-selected:hover .MuiListItemText-root":
                {
                  display: "none !important",
                  visibility: "hidden !important",
                  opacity: "0 !important",
                },
              "nav:has([data-sidebar-collapsed='true']):not(:has([data-sidebar-collapsed='false'])) .MuiListItemButton-root.Mui-selected:hover .MuiListItemText-root::before":
                {
                  content: "none !important",
                },
              ".MuiDrawer-docked:has([data-sidebar-collapsed='false']) .MuiList-root":
                {
                  display: "flex !important",
                  gap: "3px !important",
                  opacity: "1 !important",
                  visibility: "visible !important",
                  pointerEvents: "auto !important",
                  transform: "translateX(0) !important",
                  alignItems: "stretch !important",
                  flex: "1 1 auto !important",
                  minHeight: "calc(100dvh - 56px) !important",
                  paddingLeft: "6px !important",
                  paddingRight: "6px !important",
                },
              ".MuiDrawer-docked:has([data-sidebar-collapsed='false']) .MuiListItem-root":
                {
                  display: "block !important",
                  opacity: "1 !important",
                  visibility: "visible !important",
                  minHeight: "46px !important",
                  height: "46px !important",
                  padding: "0 !important",
                },
              ".MuiDrawer-docked:has([data-sidebar-collapsed='false']) .MuiList-root > .MuiListItem-root:last-child":
                {
                  marginTop: "auto !important",
                  marginBottom: "4px !important",
                },
              ".MuiDrawer-docked:has([data-sidebar-collapsed='false']) .MuiList-root > *:last-child":
                {
                  marginTop: "auto !important",
                  marginBottom: "4px !important",
                },
              ".MuiDrawer-docked:has([data-sidebar-collapsed='false']) .MuiList-root a":
                {
                  display: "flex !important",
                  height: "46px !important",
                  minHeight: "46px !important",
                  maxHeight: "46px !important",
                  alignItems: "center !important",
                  margin: "0 !important",
                  padding: "0 !important",
                },
              ".MuiDrawer-docked:has([data-sidebar-collapsed='false']) .MuiListItemButton-root":
                {
                  display: "grid !important",
                  gridTemplateColumns: "30px minmax(0, 1fr)",
                  columnGap: "8px",
                  opacity: "1 !important",
                  visibility: "visible !important",
                  pointerEvents: "auto !important",
                  width: "100% !important",
                  minHeight: "44px !important",
                  height: "44px !important",
                  maxHeight: "44px !important",
                  paddingLeft: "10px !important",
                  paddingRight: "10px !important",
                  paddingTop: "0 !important",
                  paddingBottom: "0 !important",
                  justifyContent: "stretch !important",
                  alignItems: "center !important",
                },
              ".MuiDrawer-docked:has([data-sidebar-collapsed='false']) .MuiListItemIcon-root":
                {
                  display: "inline-flex !important",
                  opacity: "1 !important",
                  visibility: "visible !important",
                  alignItems: "center !important",
                  justifyContent: "center !important",
                  minWidth: "28px !important",
                  width: "30px !important",
                  height: "28px !important",
                  marginRight: "0 !important",
                },
              ".MuiDrawer-docked:has([data-sidebar-collapsed='false']) .MuiListItemText-root":
                {
                  display: "flex !important",
                  alignItems: "center !important",
                  justifyContent: "flex-start !important",
                  opacity: "1 !important",
                  visibility: "visible !important",
                  position: "static !important",
                  transform: "none !important",
                  pointerEvents: "auto !important",
                  flex: "1 1 auto !important",
                  minWidth: "0 !important",
                  height: "auto !important",
                  maxWidth: "100% !important",
                },
              ".MuiDrawer-docked:has([data-sidebar-collapsed='false']) .MuiListItemText-primary":
                {
                  display: "block !important",
                  opacity: "1 !important",
                  visibility: "visible !important",
                  overflow: "hidden !important",
                  textOverflow: "ellipsis !important",
                  whiteSpace: "nowrap !important",
                  lineHeight: "1 !important",
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

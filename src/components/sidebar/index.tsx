import React, { useContext } from "react";
import {
  useMenu,
  useLogout,
  useActiveAuthProvider,
  useLink,
  CanAccess,
  useGetIdentity,
} from "@refinedev/core";
import { ThemedLayoutContext } from "@refinedev/mui";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Paper from "@mui/material/Paper";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import { Title } from "../title";
import { useAuthContext } from "../../contexts";
import type { IIdentity } from "../../interfaces";

const formatRole = (role?: string | null) =>
  role
    ? role
        .split("_")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ")
    : "User";

export const CustomSider: React.FC = () => {
  const { siderCollapsed, setSiderCollapsed } = useContext(ThemedLayoutContext);
  const { menuItems, selectedKey } = useMenu();
  const { role } = useAuthContext();
  const { data: user } = useGetIdentity<IIdentity | null>();
  const authProvider = useActiveAuthProvider();
  const { mutate: logout } = useLogout({
    v3LegacyAuthProviderCompatible: Boolean(authProvider?.isLegacy),
  });
  const Link = useLink();

  return (
    <Box component="nav">
      <Drawer variant="permanent" open>
        <Paper
          elevation={0}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
            padding: 0,
            zIndex: 1,
          }}
        >
          <Title collapsed={siderCollapsed} />
          {!siderCollapsed && (
            <IconButton
              onClick={() => setSiderCollapsed(true)}
              size="small"
            >
              <ChevronLeftIcon />
            </IconButton>
          )}
        </Paper>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            overflow: "hidden",
          }}
        >
          <List disablePadding>
            {menuItems.map((item) => {
              const isSelected = item.key === selectedKey;
              return (
                <CanAccess
                  key={item.key}
                  resource={item.name}
                  action="list"
                  params={{ resource: item }}
                >
                  <ListItem disablePadding>
                    <ListItemButton
                      component={Link as React.ElementType}
                      to={item.route ?? "/"}
                      selected={isSelected}
                    >
                      {item.icon && (
                        <ListItemIcon>{item.icon}</ListItemIcon>
                      )}
                      <ListItemText primary={item.label ?? item.name} />
                    </ListItemButton>
                  </ListItem>
                </CanAccess>
              );
            })}

            {/* Branding + Logout at the bottom — wrapper gets marginTop:auto from globalStyles */}
            <Box>
              <Box
                sx={{
                  mx: siderCollapsed ? 0.75 : 1,
                  mb: 0.75,
                  px: siderCollapsed ? 0.25 : 1,
                  py: 0.75,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: siderCollapsed ? "center" : "flex-start",
                  gap: 1,
                  borderRadius: "8px",
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: "background.paper",
                  minWidth: 0,
                }}
              >
                <Avatar
                  src={user?.avatar}
                  alt={user?.name || "User"}
                  sx={{
                    width: 34,
                    height: 34,
                    fontSize: "0.85rem",
                    flexShrink: 0,
                  }}
                >
                  {(user?.name || "U").charAt(0).toUpperCase()}
                </Avatar>

                {!siderCollapsed && (
                  <Box sx={{ minWidth: 0 }}>
                    <Typography
                      sx={{
                        fontSize: "0.82rem",
                        fontWeight: 700,
                        color: "text.primary",
                        lineHeight: 1.15,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {user?.name || "User"}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "0.68rem",
                        color: "text.secondary",
                        lineHeight: 1.15,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {formatRole(role)}
                    </Typography>
                  </Box>
                )}
              </Box>

              <Box
                sx={{
                  px: 1.5,
                  pt: 0.5,
                  pb: 0.5,
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <Box
                  component="img"
                  src="/images/classic-electronics-brand-transparent.png"
                  alt="Classic Electronics"
                  sx={{
                    display: "block",
                    width: 140,
                    height: "auto",
                    opacity: 1,
                  }}
                />
              </Box>

              <ListItem disablePadding>
                <ListItemButton onClick={() => logout()}>
                  <ListItemIcon>
                    <LogoutOutlinedIcon />
                  </ListItemIcon>
                  <ListItemText primary="Logout" />
                </ListItemButton>
              </ListItem>
            </Box>
          </List>
        </Box>
      </Drawer>
    </Box>
  );
};

import React, { useContext } from "react";
import {
  useMenu,
  useLogout,
  useActiveAuthProvider,
  useLink,
  CanAccess,
} from "@refinedev/core";
import { ThemedLayoutContext } from "@refinedev/mui";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import { Title } from "../title";

export const CustomSider: React.FC = () => {
  const { siderCollapsed } = useContext(ThemedLayoutContext);
  const { menuItems, selectedKey } = useMenu();
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

            {/* Logout + branding at the bottom — wrapper gets marginTop:auto from globalStyles */}
            <Box>
              <ListItem disablePadding>
                <ListItemButton onClick={() => logout()}>
                  <ListItemIcon>
                    <LogoutOutlinedIcon />
                  </ListItemIcon>
                  <ListItemText primary="Logout" />
                </ListItemButton>
              </ListItem>

              <Box
                sx={{
                  px: 1.25,
                  pt: 0.75,
                  pb: 1.5,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 0.4,
                }}
              >
                <Typography
                  sx={{
                    fontSize: 8,
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    lineHeight: 1,
                    textTransform: "uppercase",
                    color: "text.disabled",
                  }}
                >
                  Product of
                </Typography>
                <Box
                  component="img"
                  src="/images/classic-electronics-brand-transparent.png"
                  alt="Classic Electronics"
                  sx={{
                    display: "block",
                    width: "100%",
                    maxWidth: 148,
                    height: "auto",
                    opacity: 1,
                  }}
                />
              </Box>
            </Box>
          </List>
        </Box>
      </Drawer>
    </Box>
  );
};

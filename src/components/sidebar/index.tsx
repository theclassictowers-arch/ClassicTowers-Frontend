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
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import { Title } from "../title";

const CharText = ({ text }: { text: string }) => (
  <>
    {[...text].map((ch, i) =>
      ch === " " ? (
        <span key={i} className="sidebar-menu-space"> </span>
      ) : (
        <span
          key={i}
          className="sidebar-menu-char"
          style={{ "--char-index": i } as React.CSSProperties}
        >
          {ch}
        </span>
      )
    )}
  </>
);

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
                      <ListItemText
                        primary={<CharText text={item.label ?? item.name} />}
                      />
                    </ListItemButton>
                  </ListItem>
                </CanAccess>
              );
            })}
            <ListItem disablePadding>
              <ListItemButton onClick={() => logout()}>
                <ListItemIcon>
                  <LogoutOutlinedIcon />
                </ListItemIcon>
                <ListItemText primary={<CharText text="Logout" />} />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
      </Drawer>
    </Box>
  );
};

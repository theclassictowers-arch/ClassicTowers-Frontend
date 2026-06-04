import BaseDrawer, { type DrawerProps } from "@mui/material/Drawer";
import type { PropsWithChildren } from "react";
import { useColorModeContext } from "../../../contexts";

type Props = {} & DrawerProps;

export const Drawer = ({ children, ...props }: PropsWithChildren<Props>) => {
  const { dashboardTheme } = useColorModeContext();

  return (
    <BaseDrawer
      {...props}
      sx={{
        "& .MuiDrawer-paper": {
          backgroundColor: dashboardTheme.backgroundColor,
        },
        ...props.sx,
      }}
    >
      {children}
    </BaseDrawer>
  );
};

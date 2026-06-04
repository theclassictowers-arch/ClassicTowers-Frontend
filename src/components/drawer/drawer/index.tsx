import BaseDrawer, { type DrawerProps } from "@mui/material/Drawer";
import type { PropsWithChildren } from "react";

type Props = {} & DrawerProps;

export const Drawer = ({ children, ...props }: PropsWithChildren<Props>) => {
  return (
    <BaseDrawer
      {...props}
      sx={{
        "& .MuiDrawer-paper": {
          backgroundColor: "rgba(255, 255, 255, 0.10)",
          backdropFilter: "blur(6px)",
        },
        ...props.sx,
      }}
    >
      {children}
    </BaseDrawer>
  );
};

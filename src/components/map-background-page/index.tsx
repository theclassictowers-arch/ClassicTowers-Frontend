import type { ReactNode } from "react";
import { Box } from "@mui/material";

export const MapBackgroundPage = ({ children }: { children: ReactNode }) => (
  <Box
    sx={{
      position: "relative",
      width: "100%",
      minHeight: "100dvh",
      m: 0,
      p: 0,
      display: "flex",
      alignItems: "center",
      backgroundColor: "background.default",
    }}
  >
    {children}
  </Box>
);

export default MapBackgroundPage;

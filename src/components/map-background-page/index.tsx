import type { ReactNode } from "react";

export const MapBackgroundPage = ({ children }: { children: ReactNode }) => (
  <div
    style={{
      position: "relative",
      width: "100%",
      minHeight: "100dvh",
      margin: 0,
      padding: 0,
      display: "flex",
      alignItems: "center",
      backgroundColor: "transparent",
    }}
  >
    {children}
  </div>
);

export default MapBackgroundPage;

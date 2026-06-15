import { Box, Typography, alpha, useTheme } from "@mui/material";

interface Tower3DViewProps {
  roll?: number;
  pitch?: number;
  yaw?: number;
}

const clampAngle = (value: number | undefined, max = 35) => {
  if (typeof value !== "number" || Number.isNaN(value)) return 0;
  return Math.max(-max, Math.min(max, value));
};

export const Tower3DView = ({ roll, pitch, yaw }: Tower3DViewProps) => {
  const theme = useTheme();
  const safeRoll = clampAngle(roll);
  const safePitch = clampAngle(pitch);
  const safeYaw = clampAngle(yaw, 60);

  return (
    <Box
      sx={{
        flex: 1,
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1.25,
        bgcolor: "background.paper",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          perspective: "760px",
          background: `radial-gradient(circle at 50% 70%, ${alpha(
            theme.palette.primary.main,
            0.08
          )}, transparent 55%)`,
        }}
      >
        <Box
          sx={{
            position: "relative",
            width: 170,
            height: 360,
            transformStyle: "preserve-3d",
            transform: `rotateX(${safePitch}deg) rotateY(${safeYaw}deg) rotateZ(${safeRoll}deg)`,
            transition: "transform 350ms ease",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              left: "50%",
              top: 16,
              width: 8,
              height: 316,
              borderRadius: 999,
              bgcolor: "#3145b7",
              transform: "translateX(-50%)",
              boxShadow: "0 10px 24px rgba(49, 69, 183, 0.24)",
            }}
          />

          <Box
            sx={{
              position: "absolute",
              left: "50%",
              top: 92,
              width: 112,
              height: 7,
              borderRadius: 999,
              bgcolor: "#f97316",
              transform: "translateX(-50%) rotateZ(-28deg) translateZ(20px)",
              boxShadow: "0 6px 16px rgba(249, 115, 22, 0.25)",
            }}
          />

          <Box
            sx={{
              position: "absolute",
              left: "50%",
              top: 176,
              width: 92,
              height: 7,
              borderRadius: 999,
              bgcolor: "#3145b7",
              transform: "translateX(-50%) rotateZ(24deg) translateZ(12px)",
            }}
          />

          <Box
            sx={{
              position: "absolute",
              left: "50%",
              bottom: 20,
              width: 116,
              height: 14,
              borderRadius: "50%",
              bgcolor: alpha(theme.palette.common.black, 0.08),
              transform: "translateX(-50%) rotateX(74deg)",
              filter: "blur(1px)",
            }}
          />
        </Box>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          borderTop: "1px solid",
          borderColor: "divider",
        }}
      >
        {[
          ["Roll", roll],
          ["Pitch", pitch],
          ["Yaw", yaw],
        ].map(([label, value]) => (
          <Box
            key={label}
            sx={{
              px: 0.75,
              py: 0.6,
              textAlign: "center",
              "& + &": {
                borderLeft: "1px solid",
                borderColor: "divider",
              },
            }}
          >
            <Typography sx={{ fontSize: "0.62rem", color: "text.secondary" }}>
              {label}
            </Typography>
            <Typography sx={{ fontSize: "0.76rem", fontWeight: 700 }}>
              {typeof value === "number" && !Number.isNaN(value)
                ? `${value.toFixed(1)} deg`
                : "--"}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

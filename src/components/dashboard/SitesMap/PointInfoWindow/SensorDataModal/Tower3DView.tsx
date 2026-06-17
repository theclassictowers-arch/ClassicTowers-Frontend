// @ts-nocheck
import { CSSProperties, useEffect, useMemo, useState } from "react";
import {
  alpha,
  Box,
  Chip,
  IconButton,
  LinearProgress,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import PauseIcon from "@mui/icons-material/Pause";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import { Canvas } from "@react-three/fiber";
import { ContactShadows, OrbitControls, Text } from "@react-three/drei";
import * as THREE from "three";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface Tower3DViewProps {
  roll?: number;
  pitch?: number;
  yaw?: number;
  windSpeed?: number;
  windDirection?: number;
  vibration?: number;
  battery?: number;
  signal?: number;
  siteName?: string;
  history?: any[];
}

type LiveTelemetry = {
  roll: number;
  pitch: number;
  yaw: number;
  windSpeed: number;
  windDirection: number;
  vibration: number;
  battery: number;
  signal: number;
  time: string;
};

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

const toNumber = (value: any, fallback = 0) => {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : fallback;
};

const statusFromTilt = (telemetry: LiveTelemetry) => {
  const tilt = Math.max(Math.abs(telemetry.roll), Math.abs(telemetry.pitch));
  const vibration = Math.abs(telemetry.vibration);

  if (tilt >= 24 || vibration >= 3.6 || telemetry.windSpeed >= 28) {
    return {
      label: "Danger",
      color: "#ef4444",
      textColor: "#b91c1c",
      tint: "rgba(239, 68, 68, 0.16)",
    };
  }

  if (tilt >= 14 || vibration >= 2.4 || telemetry.windSpeed >= 18) {
    return {
      label: "Warning",
      color: "#f59e0b",
      textColor: "#b45309",
      tint: "rgba(245, 158, 11, 0.18)",
    };
  }

  return {
    label: "Normal",
    color: "#22c55e",
    textColor: "#15803d",
    tint: "rgba(34, 197, 94, 0.14)",
  };
};

const makeDemoTelemetry = (seed = 0): LiveTelemetry => {
  const now = Date.now() / 1000 + seed;
  const gust = Math.sin(now * 0.9) * 3 + Math.sin(now * 0.33) * 2;

  return {
    roll: Math.sin(now * 0.86) * 12 + Math.sin(now * 0.19) * 4,
    pitch: Math.cos(now * 0.72) * 10 + Math.sin(now * 0.28) * 4,
    yaw: (Math.sin(now * 0.24) * 42 + 360) % 360,
    windSpeed: clamp(14 + gust + Math.sin(now * 1.7) * 1.2, 2, 34),
    windDirection: (180 + Math.sin(now * 0.38) * 120 + Math.cos(now * 0.16) * 30 + 360) % 360,
    vibration: clamp(1.1 + Math.abs(Math.sin(now * 1.45)) * 1.8 + Math.max(0, gust) * 0.06, 0.2, 5),
    battery: clamp(84 + Math.sin(now * 0.08) * 5, 54, 100),
    signal: clamp(78 + Math.cos(now * 0.2) * 12, 42, 100),
    time: new Date().toLocaleTimeString("en-GB", { hour12: false }),
  };
};

const point = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

const Beam = ({
  start,
  end,
  radius = 0.025,
  color = "#5f6f82",
}: {
  start: THREE.Vector3;
  end: THREE.Vector3;
  radius?: number;
  color?: string;
}) => {
  const { position, quaternion, length } = useMemo(() => {
    const direction = new THREE.Vector3().subVectors(end, start);
    const midpoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
    const quat = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      direction.clone().normalize()
    );

    return { position: midpoint, quaternion: quat, length: direction.length() };
  }, [start, end]);

  return (
    <mesh position={position} quaternion={quaternion} castShadow receiveShadow>
      <cylinderGeometry args={[radius, radius, length, 10]} />
      <meshStandardMaterial color={color} metalness={0.55} roughness={0.34} />
    </mesh>
  );
};

const BuildingTower = ({ statusColor }: { statusColor: string }) => {
  const windowRows = Array.from({ length: 12 }, (_, row) => row);
  const sideWindows = Array.from({ length: 9 }, (_, row) => row);

  return (
    <group position={[0, -2.15, 0]}>
      <mesh position={[0, 1.8, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.55, 7.1, 1.3]} />
        <meshStandardMaterial color="#d8dde5" metalness={0.18} roughness={0.42} />
      </mesh>
      <mesh position={[0, 1.82, 0.662]} castShadow>
        <boxGeometry args={[1.66, 7.18, 0.035]} />
        <meshStandardMaterial color="#253244" metalness={0.22} roughness={0.28} />
      </mesh>

      {windowRows.map((row) =>
        [-0.46, 0, 0.46].map((x) => (
          <mesh key={`${row}-${x}`} position={[x, -1.1 + row * 0.46, 0.69]}>
            <boxGeometry args={[0.26, 0.22, 0.018]} />
            <meshStandardMaterial
              color={row % 3 === 0 ? "#bae6fd" : "#f8fafc"}
              emissive={row % 4 === 0 ? "#38bdf8" : "#ffffff"}
              emissiveIntensity={row % 4 === 0 ? 0.22 : 0.05}
              roughness={0.18}
            />
          </mesh>
        ))
      )}

      {sideWindows.map((row) =>
        [-0.62, -0.22, 0.22, 0.62].map((z) => (
          <mesh key={`side-${row}-${z}`} position={[0.79, -0.86 + row * 0.56, z]} rotation={[0, Math.PI / 2, 0]}>
            <boxGeometry args={[0.2, 0.24, 0.018]} />
            <meshStandardMaterial color="#e0f2fe" emissive="#93c5fd" emissiveIntensity={0.08} roughness={0.2} />
          </mesh>
        ))
      )}

      <mesh position={[0, 5.47, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.9, 0.24, 1.6]} />
        <meshStandardMaterial color="#727f8e" metalness={0.32} roughness={0.36} />
      </mesh>
      <mesh position={[0, 5.76, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.2, 0.36, 1]} />
        <meshStandardMaterial color="#a8b0ba" metalness={0.28} roughness={0.38} />
      </mesh>

      <Beam start={point(0, 5.86, 0)} end={point(0, 7.2, 0)} radius={0.035} color="#334155" />
      {[0, Math.PI / 2, Math.PI, Math.PI * 1.5].map((rotation) => (
        <group key={rotation} position={[Math.sin(rotation) * 0.43, 6.55, Math.cos(rotation) * 0.43]} rotation={[0, rotation, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.12, 0.72, 0.06]} />
            <meshStandardMaterial color="#f8fafc" metalness={0.22} roughness={0.28} />
          </mesh>
          <mesh position={[0, 0, 0.04]}>
            <boxGeometry args={[0.09, 0.52, 0.01]} />
            <meshStandardMaterial color={statusColor} emissive={statusColor} emissiveIntensity={0.18} roughness={0.3} />
          </mesh>
        </group>
      ))}

      {[1.05, 1.55, 2.08].map((scale) => (
        <mesh key={scale} position={[0, 6.55, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[scale, 0.008, 8, 86]} />
          <meshStandardMaterial color="#38bdf8" emissive="#0ea5e9" emissiveIntensity={0.45} transparent opacity={0.3} />
        </mesh>
      ))}

      <mesh position={[0, 7.34, 0]}>
        <sphereGeometry args={[0.08, 18, 18]} />
        <meshStandardMaterial color={statusColor} emissive={statusColor} emissiveIntensity={1.1} />
      </mesh>

      <Text position={[0, 0.8, 0.735]} fontSize={0.16} color="#ffffff" anchorX="center" anchorY="middle">
        TheClassicTower
      </Text>
    </group>
  );
};

const WindArrow = ({
  direction,
  speed,
  statusColor,
}: {
  direction: number;
  speed: number;
  statusColor: string;
}) => {
  const arrowLength = 1.05 + clamp(speed / 34, 0, 1) * 0.9;
  const rotationY = THREE.MathUtils.degToRad(direction);

  return (
    <group position={[2.45, 0.65, 0]} rotation={[0, rotationY, 0]}>
      <Beam start={point(0, 0, -arrowLength / 2)} end={point(0, 0, arrowLength / 2)} radius={0.035} color={statusColor} />
      <mesh position={[0, 0, arrowLength / 2 + 0.17]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <coneGeometry args={[0.16, 0.36, 24]} />
        <meshStandardMaterial color={statusColor} emissive={statusColor} emissiveIntensity={0.2} />
      </mesh>
      <Text position={[0, 0.36, 0]} fontSize={0.16} color={statusColor} anchorX="center">
        {`${speed.toFixed(1)} km/h`}
      </Text>
    </group>
  );
};

const TelemetryRow = ({
  label,
  value,
  suffix,
  color,
}: {
  label: string;
  value: number;
  suffix?: string;
  color?: string;
}) => (
  <div
    style={{
      border: "1px solid rgba(148, 163, 184, 0.26)",
      borderRadius: 8,
      padding: "7px 8px",
      background: "#fff",
    }}
  >
    <Typography sx={{ color: "text.secondary", fontSize: "0.62rem", lineHeight: 1 }}>
      {label}
    </Typography>
    <Typography sx={{ color: color || "text.primary", fontSize: "0.86rem", fontWeight: 800, lineHeight: 1.35 }}>
      {value.toFixed(label === "Wind Dir" || label === "Battery" || label === "Signal" ? 0 : 2)}
      {suffix}
    </Typography>
  </div>
);

const compactHistory = (history: any[]) =>
  history
    ?.slice(-48)
    .map((item: any, index: number) => {
      const vibrationValues = [
        item.vibrationSpeed_x,
        item.vibrationSpeed_y,
        item.vibrationSpeed_z,
      ].filter((value) => typeof value === "number");

      return {
        index,
        time: item.time || `${index}`,
        roll: toNumber(item.vibrationRollAngle, undefined),
        pitch: toNumber(item.vibrationPitchAngle, undefined),
        windSpeed: toNumber(item.windSpeed, undefined),
        vibration:
          vibrationValues.length > 0
            ? vibrationValues.reduce((total, value) => total + Math.abs(value), 0) /
              vibrationValues.length
            : undefined,
      };
    })
    .filter((item) =>
      ["roll", "pitch", "windSpeed", "vibration"].some((key) => Number.isFinite(item[key]))
    ) || [];

export const Tower3DView = ({
  roll,
  pitch,
  yaw,
  windSpeed,
  windDirection,
  vibration,
  battery,
  signal,
  siteName,
  history = [],
}: Tower3DViewProps) => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const hasRealTelemetry = [roll, pitch, yaw, windSpeed, windDirection, vibration].some(
    (value) => typeof value === "number" && Number.isFinite(value)
  );
  const [demoTelemetry, setDemoTelemetry] = useState<LiveTelemetry>(() => makeDemoTelemetry());
  const [isPlaying, setIsPlaying] = useState(true);
  const chartHistory = useMemo(() => compactHistory(history), [history]);

  useEffect(() => {
    if (!isPlaying) return undefined;

    const interval = window.setInterval(() => {
      setDemoTelemetry(makeDemoTelemetry());
    }, 500);

    return () => window.clearInterval(interval);
  }, [isPlaying]);

  const telemetry: LiveTelemetry = {
    roll: toNumber(roll, demoTelemetry.roll),
    pitch: toNumber(pitch, demoTelemetry.pitch),
    yaw: toNumber(yaw, demoTelemetry.yaw),
    windSpeed: toNumber(windSpeed, demoTelemetry.windSpeed),
    windDirection: toNumber(windDirection, demoTelemetry.windDirection),
    vibration: toNumber(vibration, demoTelemetry.vibration),
    battery: toNumber(battery, demoTelemetry.battery),
    signal: toNumber(signal, demoTelemetry.signal),
    time: demoTelemetry.time,
  };
  const status = statusFromTilt(telemetry);
  const fallbackHistory = useMemo(
    () =>
      Array.from({ length: 36 }, (_, index) => {
        const sample = makeDemoTelemetry(index * -0.9);
        return {
          index,
          time: `${index}`,
          roll: sample.roll,
          pitch: sample.pitch,
          windSpeed: sample.windSpeed,
          vibration: sample.vibration,
        };
      }),
    [demoTelemetry.time]
  );
  const activeHistory = chartHistory.length > 0 ? chartHistory : fallbackHistory;
  const tiltRotation: [number, number, number] = [
    THREE.MathUtils.degToRad(telemetry.pitch) * 0.18,
    THREE.MathUtils.degToRad(telemetry.yaw) * 0.02,
    THREE.MathUtils.degToRad(telemetry.roll) * 0.18,
  ];

  const rootStyle: CSSProperties = {
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: 10,
    display: "grid",
    flex: 1,
    gap: 0,
    gridTemplateColumns: isDesktop ? "minmax(0, 1fr) 190px" : "1fr",
    gridTemplateRows: isDesktop ? "minmax(0, 1fr) 132px" : "minmax(350px, 1fr) auto 128px",
    minHeight: 0,
    overflow: "hidden",
  };

  return (
    <div style={rootStyle}>
      <div
        style={{
          gridColumn: isDesktop ? "1 / 2" : "1",
          minHeight: 350,
          position: "relative",
          background: `linear-gradient(180deg, ${alpha("#e0f2fe", 0.9)} 0%, ${alpha("#f8fafc", 0.92)} 55%, ${alpha(status.color, 0.11)} 100%)`,
        }}
      >
        <Canvas
          shadows
          dpr={[1, 1.75]}
          camera={{ position: [4.6, 3.2, 6.8], fov: 38 }}
          gl={{ antialias: true, alpha: true }}
        >
          <ambientLight intensity={0.68} />
          <directionalLight position={[4, 7, 5]} intensity={1.5} castShadow shadow-mapSize={[1024, 1024]} />
          <spotLight position={[-4, 4.5, 4]} intensity={0.62} angle={0.42} penumbra={0.7} />
          <group rotation={tiltRotation}>
            <BuildingTower statusColor={status.color} />
          </group>
          <WindArrow direction={telemetry.windDirection} speed={telemetry.windSpeed} statusColor={status.color} />
          <mesh position={[0, -2.32, 0]} receiveShadow>
            <cylinderGeometry args={[2.6, 2.8, 0.12, 64]} />
            <meshStandardMaterial color="#cad2dc" metalness={0.18} roughness={0.55} />
          </mesh>
          <ContactShadows position={[0, -2.25, 0]} opacity={0.32} scale={6.8} blur={2.4} far={2.8} />
          <OrbitControls
            makeDefault
            enableDamping
            dampingFactor={0.08}
            minDistance={4.2}
            maxDistance={9.8}
            minPolarAngle={0.45}
            maxPolarAngle={1.52}
            target={[0, 0.85, 0]}
          />
        </Canvas>

        <div style={{ position: "absolute", left: 10, top: 10, display: "flex", gap: 6, flexWrap: "wrap" }}>
          <Chip size="small" label={siteName || "TheClassicTower 3D"} sx={{ height: 23, borderRadius: 1, bgcolor: alpha(theme.palette.primary.main, 0.15), color: "primary.main", fontSize: "0.66rem", fontWeight: 800 }} />
          <Chip size="small" label={hasRealTelemetry ? "Live data" : "Demo mode"} sx={{ height: 23, borderRadius: 1, bgcolor: status.tint, color: status.textColor, fontSize: "0.66rem", fontWeight: 800 }} />
          <Chip size="small" label={status.label} sx={{ height: 23, borderRadius: 1, bgcolor: status.color, color: "#fff", fontSize: "0.66rem", fontWeight: 800 }} />
        </div>
      </div>

      <div
        style={{
          borderLeft: isDesktop ? `1px solid ${theme.palette.divider}` : 0,
          borderTop: isDesktop ? 0 : `1px solid ${theme.palette.divider}`,
          background: alpha(theme.palette.background.default, 0.76),
          gridColumn: isDesktop ? "2 / 3" : "1",
          gridRow: isDesktop ? "1 / 3" : "2",
          minHeight: 0,
          overflowY: "auto",
          padding: 10,
        }}
      >
        <Stack spacing={0.9}>
          <Box sx={{ p: 1, borderRadius: 1, border: `1px solid ${alpha(status.color, 0.32)}`, bgcolor: status.tint }}>
            <Typography sx={{ fontSize: "0.63rem", color: "text.secondary", textTransform: "uppercase", fontWeight: 800 }}>
              Tower Status
            </Typography>
            <Typography sx={{ color: status.textColor, fontSize: "1.04rem", fontWeight: 900, lineHeight: 1.2 }}>
              {status.label}
            </Typography>
          </Box>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}>
            <TelemetryRow label="Roll" value={telemetry.roll} suffix=" deg" color={status.textColor} />
            <TelemetryRow label="Pitch" value={telemetry.pitch} suffix=" deg" color={status.textColor} />
            <TelemetryRow label="Yaw" value={telemetry.yaw} suffix=" deg" />
            <TelemetryRow label="Wind" value={telemetry.windSpeed} suffix=" km/h" />
            <TelemetryRow label="Wind Dir" value={telemetry.windDirection} suffix=" deg" />
            <TelemetryRow label="Vibration" value={telemetry.vibration} suffix=" mm/s" />
          </div>

          <Box sx={{ p: 1, border: `1px solid ${theme.palette.divider}`, borderRadius: 1, bgcolor: "#fff" }}>
            <Typography sx={{ color: "text.secondary", fontSize: "0.64rem", mb: 0.5 }}>Battery</Typography>
            <LinearProgress variant="determinate" value={telemetry.battery} sx={{ height: 7, borderRadius: 1 }} />
            <Typography sx={{ fontSize: "0.72rem", fontWeight: 800, mt: 0.45 }}>{telemetry.battery.toFixed(0)}%</Typography>
          </Box>

          <Box sx={{ p: 1, border: `1px solid ${theme.palette.divider}`, borderRadius: 1, bgcolor: "#fff" }}>
            <Typography sx={{ color: "text.secondary", fontSize: "0.64rem", mb: 0.5 }}>Signal</Typography>
            <LinearProgress color="success" variant="determinate" value={telemetry.signal} sx={{ height: 7, borderRadius: 1 }} />
            <Typography sx={{ fontSize: "0.72rem", fontWeight: 800, mt: 0.45 }}>{telemetry.signal.toFixed(0)}%</Typography>
          </Box>
        </Stack>
      </div>

      <div
        style={{
          borderTop: `1px solid ${theme.palette.divider}`,
          gridColumn: isDesktop ? "1 / 2" : "1",
          gridRow: isDesktop ? "2 / 3" : "3",
          minHeight: 0,
          padding: "8px 10px 8px 8px",
          background: "#fff",
        }}
      >
        <div style={{ alignItems: "center", display: "flex", gap: 8, height: 24, marginBottom: 4 }}>
          <IconButton size="small" onClick={() => setIsPlaying((value) => !value)} sx={{ p: 0.25 }}>
            {isPlaying ? <PauseIcon sx={{ fontSize: "1rem" }} /> : <PlayArrowIcon sx={{ fontSize: "1rem" }} />}
          </IconButton>
          <Typography sx={{ fontSize: "0.72rem", fontWeight: 800, color: "text.secondary" }}>
            History Playback
          </Typography>
          <Typography sx={{ ml: "auto", fontSize: "0.68rem", color: "text.disabled" }}>
            {hasRealTelemetry ? "sensor history" : "demo stream"} | {telemetry.time}
          </Typography>
        </div>
        <ResponsiveContainer width="100%" height="calc(100% - 28px)">
          <LineChart data={activeHistory} margin={{ top: 4, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.grey[400], 0.25)} vertical={false} />
            <XAxis dataKey="time" tick={{ fontSize: 10 }} height={18} />
            <YAxis tick={{ fontSize: 10 }} width={34} />
            <Tooltip />
            <Line type="monotone" dataKey="roll" stroke="#2563eb" strokeWidth={1.5} dot={false} isAnimationActive={false} />
            <Line type="monotone" dataKey="pitch" stroke="#16a34a" strokeWidth={1.5} dot={false} isAnimationActive={false} />
            <Line type="monotone" dataKey="windSpeed" stroke="#f97316" strokeWidth={1.5} dot={false} isAnimationActive={false} />
            <Line type="monotone" dataKey="vibration" stroke="#ef4444" strokeWidth={1.5} dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

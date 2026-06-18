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
  Legend,
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

const towerChartSeries = [
  { key: "yaw", label: "Yaw", color: "#7c3aed" },
  { key: "roll", label: "Roll", color: "#2563eb" },
  { key: "pitch", label: "Pitch", color: "#16a34a" },
  { key: "vibration", label: "Vibration", color: "#ef4444" },
];

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

const PanelAntenna = ({
  position,
  rotationY,
  statusColor,
}: {
  position: [number, number, number];
  rotationY: number;
  statusColor: string;
}) => (
  <group position={position} rotation={[0, rotationY, 0]}>
    <mesh castShadow>
      <boxGeometry args={[0.15, 0.92, 0.08]} />
      <meshStandardMaterial color="#f8fafc" metalness={0.18} roughness={0.3} />
    </mesh>
    <mesh position={[0, 0, 0.048]}>
      <boxGeometry args={[0.11, 0.72, 0.012]} />
      <meshStandardMaterial
        color={statusColor}
        emissive={statusColor}
        emissiveIntensity={0.18}
        roughness={0.35}
      />
    </mesh>
    <Beam start={point(0, -0.22, -0.04)} end={point(0, -0.22, -0.48)} radius={0.012} color="#64748b" />
  </group>
);

const MicrowaveDish = ({
  position,
  rotation,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
}) => (
  <group position={position} rotation={rotation}>
    <mesh castShadow>
      <cylinderGeometry args={[0.35, 0.22, 0.08, 32]} />
      <meshStandardMaterial color="#eef2f7" metalness={0.32} roughness={0.22} />
    </mesh>
    <mesh position={[0, 0, 0.06]}>
      <sphereGeometry args={[0.06, 16, 16]} />
      <meshStandardMaterial color="#64748b" metalness={0.45} roughness={0.25} />
    </mesh>
    <Beam start={point(0, 0, -0.02)} end={point(0, 0, -0.42)} radius={0.014} color="#475569" />
  </group>
);

const Platform = ({ y, width }: { y: number; width: number }) => (
  <group>
    <mesh position={[0, y, 0]} receiveShadow>
      <boxGeometry args={[width, 0.035, width]} />
      <meshStandardMaterial color="#5b6b7c" metalness={0.7} roughness={0.34} />
    </mesh>
    {[
      [0, width / 2],
      [0, -width / 2],
      [width / 2, 0],
      [-width / 2, 0],
    ].map(([x, z], index) => (
      <Beam
        key={index}
        start={point(x, y + 0.02, z)}
        end={point(x, y + 0.22, z)}
        radius={0.012}
        color="#334155"
      />
    ))}
  </group>
);

const TelecomTower = ({ statusColor }: { statusColor: string }) => {
  const levels = useMemo(() => {
    const height = 5.9;

    return Array.from({ length: 10 }, (_, index) => {
      const y = index * (height / 9);
      const half = 0.82 - index * 0.058;

      return {
        y,
        corners: [
          point(-half, y, -half),
          point(half, y, -half),
          point(half, y, half),
          point(-half, y, half),
        ],
      };
    });
  }, []);

  return (
    <group position={[0, -2.65, 0]}>
      <mesh position={[0, -0.08, 0]} receiveShadow>
        <cylinderGeometry args={[1.28, 1.42, 0.18, 4]} />
        <meshStandardMaterial color="#8d98a6" metalness={0.36} roughness={0.46} />
      </mesh>

      {levels.slice(0, -1).map((level, index) => {
        const next = levels[index + 1];

        return (
          <group key={level.y}>
            {level.corners.map((corner, cornerIndex) => (
              <Beam
                key={`leg-${cornerIndex}`}
                start={corner}
                end={next.corners[cornerIndex]}
                radius={0.036}
                color="#334155"
              />
            ))}
            {level.corners.map((corner, cornerIndex) => (
              <Beam
                key={`brace-a-${cornerIndex}`}
                start={corner}
                end={next.corners[(cornerIndex + 1) % 4]}
                radius={0.017}
                color="#94a3b8"
              />
            ))}
            {level.corners.map((corner, cornerIndex) => (
              <Beam
                key={`brace-b-${cornerIndex}`}
                start={level.corners[(cornerIndex + 1) % 4]}
                end={next.corners[cornerIndex]}
                radius={0.014}
                color="#7c8ca0"
              />
            ))}
            {level.corners.map((corner, cornerIndex) => (
              <Beam
                key={`ring-${cornerIndex}`}
                start={corner}
                end={level.corners[(cornerIndex + 1) % 4]}
                radius={0.016}
                color="#64748b"
              />
            ))}
          </group>
        );
      })}

      <Platform y={2.1} width={1.42} />
      <Platform y={3.78} width={1.1} />
      <Platform y={5.35} width={0.82} />

      <Beam start={point(0, 5.88, 0)} end={point(0, 6.85, 0)} radius={0.036} color="#334155" />
      <mesh position={[0, 7.02, 0]}>
        <sphereGeometry args={[0.085, 18, 18]} />
        <meshStandardMaterial color={statusColor} emissive={statusColor} emissiveIntensity={1.15} />
      </mesh>

      {[0, Math.PI / 2, Math.PI, Math.PI * 1.5].map((rotation, index) => (
        <PanelAntenna
          key={`upper-panel-${index}`}
          position={[Math.sin(rotation) * 0.6, 5.48, Math.cos(rotation) * 0.6]}
          rotationY={rotation}
          statusColor={statusColor}
        />
      ))}

      {[Math.PI / 4, Math.PI * 0.75, Math.PI * 1.25, Math.PI * 1.75].map((rotation, index) => (
        <PanelAntenna
          key={`mid-panel-${index}`}
          position={[Math.sin(rotation) * 0.82, 3.78, Math.cos(rotation) * 0.82]}
          rotationY={rotation}
          statusColor={index % 2 === 0 ? "#38bdf8" : statusColor}
        />
      ))}

      <MicrowaveDish position={[0.76, 4.55, 0.14]} rotation={[Math.PI / 2, 0, -0.35]} />
      <MicrowaveDish position={[-0.76, 3.2, -0.14]} rotation={[Math.PI / 2, 0, Math.PI + 0.45]} />

      {[1.25, 1.86, 2.48].map((scale) => (
        <mesh key={scale} position={[0, 5.48, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[scale, 0.007, 8, 86]} />
          <meshStandardMaterial
            color="#38bdf8"
            emissive="#0ea5e9"
            emissiveIntensity={0.45}
            transparent
            opacity={0.28}
          />
        </mesh>
      ))}

      {[
        point(-1.9, -0.04, -1.9),
        point(1.9, -0.04, -1.9),
        point(1.9, -0.04, 1.9),
        point(-1.9, -0.04, 1.9),
      ].map((anchor, index) => (
        <Beam
          key={`guy-${index}`}
          start={point(0, 5, 0)}
          end={anchor}
          radius={0.008}
          color="#94a3b8"
        />
      ))}

      <Text position={[0, 0.85, 1.05]} fontSize={0.16} color="#334155" anchorX="center" anchorY="middle">
        Telecom Tower
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
        yaw: toNumber(item.vibrationAngle, undefined),
        vibration:
          vibrationValues.length > 0
            ? vibrationValues.reduce((total, value) => total + Math.abs(value), 0) /
              vibrationValues.length
            : undefined,
      };
    })
    .filter((item) =>
      ["yaw", "roll", "pitch", "vibration"].some((key) => Number.isFinite(item[key]))
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
          yaw: sample.yaw,
          roll: sample.roll,
          pitch: sample.pitch,
          vibration: sample.vibration,
        };
      }),
    [demoTelemetry.time]
  );
  const activeHistory = useMemo(() => {
    const baseHistory = chartHistory.length > 0 ? chartHistory : fallbackHistory;
    const latestValues = {
      yaw: telemetry.yaw,
      roll: telemetry.roll,
      pitch: telemetry.pitch,
      vibration: telemetry.vibration,
    };

    return baseHistory.map((item) => ({
      ...item,
      yaw: Number.isFinite(item.yaw) ? item.yaw : latestValues.yaw,
      roll: Number.isFinite(item.roll) ? item.roll : latestValues.roll,
      pitch: Number.isFinite(item.pitch) ? item.pitch : latestValues.pitch,
      vibration: Number.isFinite(item.vibration)
        ? item.vibration
        : latestValues.vibration,
    }));
  }, [
    chartHistory,
    fallbackHistory,
    telemetry.pitch,
    telemetry.roll,
    telemetry.vibration,
    telemetry.yaw,
  ]);
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
    gap: 8,
    gridTemplateColumns: isDesktop ? "minmax(330px, 0.88fr) minmax(420px, 1.12fr)" : "1fr",
    gridTemplateRows: isDesktop ? "minmax(0, 1fr) auto" : "260px minmax(350px, 1fr) auto auto",
    minHeight: 0,
    overflow: "auto",
    padding: 8,
  };

  const panelStyle: CSSProperties = {
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: 8,
    minHeight: 0,
    overflow: "hidden",
  };

  return (
    <div style={rootStyle}>
      <div
        style={{
          background: `linear-gradient(180deg, ${alpha("#e0f2fe", 0.9)} 0%, ${alpha("#f8fafc", 0.92)} 55%, ${alpha(status.color, 0.11)} 100%)`,
          gridColumn: isDesktop ? "2 / 3" : "1",
          gridRow: isDesktop ? "1 / 2" : "2",
          minHeight: isDesktop ? 0 : 350,
          position: "relative",
          ...panelStyle,
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
            <TelecomTower statusColor={status.color} />
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
          <Chip size="small" label={siteName || "Telecom Tower 3D"} sx={{ height: 23, borderRadius: 1, bgcolor: alpha(theme.palette.primary.main, 0.15), color: "primary.main", fontSize: "0.66rem", fontWeight: 800 }} />
          <Chip size="small" label={hasRealTelemetry ? "Live data" : "Demo mode"} sx={{ height: 23, borderRadius: 1, bgcolor: status.tint, color: status.textColor, fontSize: "0.66rem", fontWeight: 800 }} />
          <Chip size="small" label={status.label} sx={{ height: 23, borderRadius: 1, bgcolor: status.color, color: "#fff", fontSize: "0.66rem", fontWeight: 800 }} />
        </div>
      </div>

      <div
        style={{
          gridColumn: isDesktop ? "1 / 2" : "1",
          gridRow: isDesktop ? "1 / 2" : "1",
          minHeight: isDesktop ? 0 : 260,
          padding: "8px 10px 9px 8px",
          ...panelStyle,
        }}
      >
        <div style={{ alignItems: "center", display: "flex", gap: 8, height: 26, marginBottom: 5 }}>
          <IconButton size="small" onClick={() => setIsPlaying((value) => !value)} sx={{ p: 0.25 }}>
            {isPlaying ? <PauseIcon sx={{ fontSize: "1rem" }} /> : <PlayArrowIcon sx={{ fontSize: "1rem" }} />}
          </IconButton>
          <Typography sx={{ fontSize: "0.76rem", fontWeight: 900, color: "text.secondary" }}>
            Yaw / Roll / Pitch / Vibration
          </Typography>
          <Typography sx={{ ml: "auto", fontSize: "0.68rem", color: "text.disabled", whiteSpace: "nowrap" }}>
            {hasRealTelemetry ? "sensor history" : "demo stream"} | {telemetry.time}
          </Typography>
        </div>
        <ResponsiveContainer width="100%" height="calc(100% - 31px)">
          <LineChart data={activeHistory} margin={{ top: 6, right: 12, left: -18, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.grey[400], 0.25)} vertical={false} />
            <XAxis dataKey="time" tick={{ fontSize: 10 }} height={18} />
            <YAxis tick={{ fontSize: 10 }} width={34} />
            <Tooltip />
            <Legend
              align="right"
              iconType="plainline"
              verticalAlign="top"
              wrapperStyle={{ fontSize: 11, paddingBottom: 4 }}
            />
            {towerChartSeries.map((series) => (
              <Line
                key={series.key}
                type="monotone"
                dataKey={series.key}
                name={series.label}
                stroke={series.color}
                strokeWidth={1.9}
                dot={false}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div
        style={{
          background: alpha(theme.palette.background.default, 0.58),
          gridColumn: isDesktop ? "1 / 2" : "1",
          gridRow: isDesktop ? "2 / 3" : "3",
          minHeight: 0,
          overflowY: "auto",
          padding: 10,
          ...panelStyle,
        }}
      >
        <Stack spacing={0.85}>
          <Box sx={{ p: 1, borderRadius: 1, border: `1px solid ${alpha(status.color, 0.32)}`, bgcolor: status.tint }}>
            <Typography sx={{ fontSize: "0.63rem", color: "text.secondary", textTransform: "uppercase", fontWeight: 800 }}>
              Tower Status
            </Typography>
            <Typography sx={{ color: status.textColor, fontSize: "1.04rem", fontWeight: 900, lineHeight: 1.2 }}>
              {status.label}
            </Typography>
          </Box>

          <div style={{ display: "grid", gridTemplateColumns: isDesktop ? "repeat(3, minmax(0, 1fr))" : "1fr 1fr", gap: 7 }}>
            <TelemetryRow label="Roll" value={telemetry.roll} suffix=" deg" color={status.textColor} />
            <TelemetryRow label="Pitch" value={telemetry.pitch} suffix=" deg" color={status.textColor} />
            <TelemetryRow label="Yaw" value={telemetry.yaw} suffix=" deg" />
            <TelemetryRow label="Wind" value={telemetry.windSpeed} suffix=" km/h" />
            <TelemetryRow label="Wind Dir" value={telemetry.windDirection} suffix=" deg" />
            <TelemetryRow label="Vibration" value={telemetry.vibration} suffix=" mm/s" />
          </div>
        </Stack>
      </div>

      <div
        style={{
          background: alpha(theme.palette.background.default, 0.58),
          gridColumn: isDesktop ? "2 / 3" : "1",
          gridRow: isDesktop ? "2 / 3" : "4",
          minHeight: 0,
          padding: 10,
          ...panelStyle,
        }}
      >
        <div style={{ display: "grid", gridTemplateColumns: isDesktop ? "1fr 1fr" : "1fr", gap: 8 }}>
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
        </div>
      </div>
    </div>
  );
};

// @ts-nocheck
import { CSSProperties, useMemo } from "react";
import { Box, Chip, Stack, Typography, alpha, useTheme } from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import { Canvas } from "@react-three/fiber";
import { ContactShadows, OrbitControls } from "@react-three/drei";
import * as THREE from "three";

interface Tower3DViewProps {
  roll?: number;
  pitch?: number;
  yaw?: number;
}

const steelMaterial = new THREE.MeshStandardMaterial({
  color: "#9aa7b5",
  metalness: 0.72,
  roughness: 0.28,
});

const darkSteelMaterial = new THREE.MeshStandardMaterial({
  color: "#344256",
  metalness: 0.82,
  roughness: 0.24,
});

const antennaMaterial = new THREE.MeshStandardMaterial({
  color: "#f5f7fb",
  metalness: 0.18,
  roughness: 0.32,
});

const signalMaterial = new THREE.MeshStandardMaterial({
  color: "#3b82f6",
  emissive: "#2563eb",
  emissiveIntensity: 0.35,
  transparent: true,
  opacity: 0.38,
});

const point = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

const Beam = ({
  start,
  end,
  radius = 0.025,
  material = steelMaterial,
}: {
  start: THREE.Vector3;
  end: THREE.Vector3;
  radius?: number;
  material?: THREE.Material;
}) => {
  const { position, quaternion, length } = useMemo(() => {
    const direction = new THREE.Vector3().subVectors(end, start);
    const midpoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
    const quat = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      direction.clone().normalize()
    );

    return {
      position: midpoint,
      quaternion: quat,
      length: direction.length(),
    };
  }, [start, end]);

  return (
    <mesh position={position} quaternion={quaternion} castShadow receiveShadow>
      <cylinderGeometry args={[radius, radius, length, 10]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
};

const PanelAntenna = ({
  position,
  rotationY,
  labelColor = "#2563eb",
}: {
  position: [number, number, number];
  rotationY: number;
  labelColor?: string;
}) => (
  <group position={position} rotation={[0, rotationY, 0]}>
    <mesh castShadow>
      <boxGeometry args={[0.14, 0.9, 0.08]} />
      <primitive object={antennaMaterial} attach="material" />
    </mesh>
    <mesh position={[0, 0, 0.048]}>
      <boxGeometry args={[0.11, 0.72, 0.012]} />
      <meshStandardMaterial color={labelColor} roughness={0.4} />
    </mesh>
    <Beam start={point(0, -0.2, -0.04)} end={point(0, -0.2, -0.45)} radius={0.012} />
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
      <cylinderGeometry args={[0.34, 0.22, 0.08, 32]} />
      <meshStandardMaterial color="#e8edf3" metalness={0.32} roughness={0.22} />
    </mesh>
    <mesh position={[0, 0, 0.06]}>
      <sphereGeometry args={[0.06, 16, 16]} />
      <meshStandardMaterial color="#64748b" metalness={0.45} roughness={0.25} />
    </mesh>
    <Beam start={point(0, 0, -0.02)} end={point(0, 0, -0.42)} radius={0.014} />
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
        material={darkSteelMaterial}
      />
    ))}
  </group>
);

const TowerLattice = () => {
  const levels = useMemo(() => {
    const height = 5.8;
    return Array.from({ length: 9 }, (_, index) => {
      const y = index * (height / 8);
      const half = 0.78 - index * 0.055;
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
        <cylinderGeometry args={[1.25, 1.35, 0.16, 4]} />
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
                radius={0.035}
                material={darkSteelMaterial}
              />
            ))}
            {level.corners.map((corner, cornerIndex) => (
              <Beam
                key={`brace-a-${cornerIndex}`}
                start={corner}
                end={next.corners[(cornerIndex + 1) % 4]}
                radius={0.017}
              />
            ))}
            {level.corners.map((corner, cornerIndex) => (
              <Beam
                key={`brace-b-${cornerIndex}`}
                start={level.corners[(cornerIndex + 1) % 4]}
                end={next.corners[cornerIndex]}
                radius={0.014}
              />
            ))}
            {level.corners.map((corner, cornerIndex) => (
              <Beam
                key={`ring-${cornerIndex}`}
                start={corner}
                end={level.corners[(cornerIndex + 1) % 4]}
                radius={0.016}
              />
            ))}
          </group>
        );
      })}

      <Platform y={2.15} width={1.38} />
      <Platform y={3.75} width={1.08} />
      <Platform y={5.25} width={0.78} />

      <Beam start={point(0, 5.75, 0)} end={point(0, 6.65, 0)} radius={0.035} material={darkSteelMaterial} />
      <mesh position={[0, 6.78, 0]}>
        <sphereGeometry args={[0.08, 18, 18]} />
        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={1.1} />
      </mesh>

      {[0, Math.PI / 2, Math.PI, Math.PI * 1.5].map((rotation, index) => (
        <PanelAntenna
          key={`upper-panel-${index}`}
          position={[
            Math.sin(rotation) * 0.58,
            5.35,
            Math.cos(rotation) * 0.58,
          ]}
          rotationY={rotation}
        />
      ))}

      {[Math.PI / 4, Math.PI * 0.75, Math.PI * 1.25, Math.PI * 1.75].map((rotation, index) => (
        <PanelAntenna
          key={`mid-panel-${index}`}
          position={[
            Math.sin(rotation) * 0.78,
            3.72,
            Math.cos(rotation) * 0.78,
          ]}
          rotationY={rotation}
          labelColor="#22c55e"
        />
      ))}

      <MicrowaveDish position={[0.72, 4.45, 0.12]} rotation={[Math.PI / 2, 0, -0.35]} />
      <MicrowaveDish position={[-0.72, 3.18, -0.12]} rotation={[Math.PI / 2, 0, Math.PI + 0.45]} />

      {[1.3, 1.95, 2.6].map((scale) => (
        <mesh key={scale} position={[0, 5.35, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[scale, 0.006, 8, 80]} />
          <primitive object={signalMaterial} attach="material" />
        </mesh>
      ))}

      {[
        point(-1.8, -0.04, -1.8),
        point(1.8, -0.04, -1.8),
        point(1.8, -0.04, 1.8),
        point(-1.8, -0.04, 1.8),
      ].map((anchor, index) => (
        <Beam
          key={`guy-${index}`}
          start={point(0, 4.85, 0)}
          end={anchor}
          radius={0.008}
          material={steelMaterial}
        />
      ))}
    </group>
  );
};

export const Tower3DView = ({ roll, pitch, yaw }: Tower3DViewProps) => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const hasLiveAngles = [roll, pitch, yaw].some(
    (value) => typeof value === "number" && Number.isFinite(value)
  );
  const tiltRotation: [number, number, number] = [
    THREE.MathUtils.degToRad(pitch || 0) * 0.15,
    THREE.MathUtils.degToRad(yaw || 0) * 0.08,
    THREE.MathUtils.degToRad(roll || 0) * 0.15,
  ];

  const rootStyle: CSSProperties = {
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: 10,
    display: "grid",
    flex: 1,
    gap: 8,
    gridTemplateColumns: isDesktop ? "minmax(0, 1fr) 178px" : "1fr",
    gridTemplateRows: isDesktop ? "1fr" : "minmax(360px, 1fr) auto",
    minHeight: 0,
    overflow: "hidden",
  };

  const sceneStyle: CSSProperties = {
    background: `linear-gradient(180deg, ${alpha(
      theme.palette.primary.main,
      0.1
    )}, ${alpha("#0f172a", 0.02)} 52%, ${alpha("#22c55e", 0.08)})`,
    minHeight: 390,
    position: "relative",
  };

  const detailsPanelStyle: CSSProperties = {
    backgroundColor: alpha(theme.palette.background.default, 0.74),
    borderLeft: isDesktop ? `1px solid ${theme.palette.divider}` : 0,
    borderTop: isDesktop ? 0 : `1px solid ${theme.palette.divider}`,
    overflowY: "auto",
    padding: 10,
  };

  return (
    <div style={rootStyle}>
      <div style={sceneStyle}>
        <Canvas
          shadows
          dpr={[1, 1.7]}
          camera={{ position: [4.2, 3.3, 6.2], fov: 39 }}
          gl={{ antialias: true, alpha: true }}
        >
          <ambientLight intensity={0.7} />
          <directionalLight
            position={[4, 7, 5]}
            intensity={1.55}
            castShadow
            shadow-mapSize={[1024, 1024]}
          />
          <spotLight position={[-4, 4.5, 3]} intensity={0.65} angle={0.42} penumbra={0.7} />
          <group rotation={tiltRotation}>
            <TowerLattice />
          </group>
          <ContactShadows
            position={[0, -2.75, 0]}
            opacity={0.34}
            scale={6.4}
            blur={2.2}
            far={2.8}
          />
          <OrbitControls
            makeDefault
            enableDamping
            dampingFactor={0.08}
            minDistance={4.4}
            maxDistance={9.5}
            minPolarAngle={0.48}
            maxPolarAngle={1.5}
            target={[0, 0.6, 0]}
          />
        </Canvas>

        <div
          style={{
            position: "absolute",
            left: 10,
            top: 10,
            display: "flex",
            gap: 6,
            flexWrap: "wrap",
          }}
        >
          <Chip
            size="small"
            label="Communication Tower"
            sx={{
              height: 22,
              borderRadius: 1,
              bgcolor: alpha(theme.palette.primary.main, 0.14),
              color: "primary.main",
              fontSize: "0.65rem",
              fontWeight: 800,
            }}
          />
          {hasLiveAngles && (
            <Chip
              size="small"
              label="Live tilt"
              sx={{
                height: 22,
                borderRadius: 1,
                bgcolor: alpha("#22c55e", 0.16),
                color: "#15803d",
                fontSize: "0.65rem",
                fontWeight: 800,
              }}
            />
          )}
        </div>
      </div>

      <div style={detailsPanelStyle}>
        <Typography
          sx={{
            fontSize: "0.66rem",
            fontWeight: 800,
            color: "text.secondary",
            textTransform: "uppercase",
            mb: 0.75,
          }}
        >
          Tower Assets
        </Typography>

        <Stack spacing={0.9}>
          {[
            ["Structure", "Tapered lattice mast"],
            ["Antennas", "8 sector panels"],
            ["Backhaul", "2 microwave dishes"],
            ["Safety", "Beacon + guy wires"],
          ].map(([label, value]) => (
            <div
              key={label}
              style={{
                padding: 8,
                borderRadius: 8,
                backgroundColor: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              <Typography sx={{ fontSize: "0.62rem", color: "text.secondary" }}>
                {label}
              </Typography>
              <Typography sx={{ fontSize: "0.78rem", fontWeight: 800 }}>
                {value}
              </Typography>
            </div>
          ))}

          {hasLiveAngles && (
            <Box
              sx={{
                p: 1,
                borderRadius: 1,
                bgcolor: alpha(theme.palette.primary.main, 0.08),
                border: `1px solid ${alpha(theme.palette.primary.main, 0.18)}`,
              }}
            >
              <Typography sx={{ fontSize: "0.66rem", fontWeight: 800, mb: 0.5 }}>
                Live Orientation
              </Typography>
              <Typography sx={{ fontSize: "0.72rem", color: "text.secondary" }}>
                Roll {Number(roll || 0).toFixed(2)} deg
              </Typography>
              <Typography sx={{ fontSize: "0.72rem", color: "text.secondary" }}>
                Pitch {Number(pitch || 0).toFixed(2)} deg
              </Typography>
              <Typography sx={{ fontSize: "0.72rem", color: "text.secondary" }}>
                Yaw {Number(yaw || 0).toFixed(2)} deg
              </Typography>
            </Box>
          )}
        </Stack>
      </div>
    </div>
  );
};

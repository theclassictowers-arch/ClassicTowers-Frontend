// @ts-nocheck
import { CSSProperties, Dispatch, useMemo, useState } from "react";
import { Box, Button, Chip, Stack, Typography, alpha, useTheme } from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import { Canvas, ThreeEvent } from "@react-three/fiber";
import { ContactShadows, Html, OrbitControls } from "@react-three/drei";
import * as THREE from "three";

type UnitStatus = "available" | "reserved" | "sold";

interface Tower3DViewProps {
  roll?: number;
  pitch?: number;
  yaw?: number;
}

interface TowerUnit {
  id: string;
  floor: number;
  type: string;
  area: string;
  price: string;
  status: UnitStatus;
  wing: "A" | "B" | "C" | "D";
}

interface TowerFloor {
  number: number;
  label: string;
  units: TowerUnit[];
}

const statusMeta: Record<
  UnitStatus,
  { label: string; color: string; softColor: string }
> = {
  available: {
    label: "Available",
    color: "#16a34a",
    softColor: "rgba(22, 163, 74, 0.18)",
  },
  reserved: {
    label: "Reserved",
    color: "#f59e0b",
    softColor: "rgba(245, 158, 11, 0.2)",
  },
  sold: {
    label: "Sold",
    color: "#64748b",
    softColor: "rgba(100, 116, 139, 0.2)",
  },
};

const glassMaterial = new THREE.MeshPhysicalMaterial({
  color: "#d9ecff",
  metalness: 0.18,
  roughness: 0.16,
  transmission: 0.25,
  transparent: true,
  opacity: 0.58,
});

const frameMaterial = new THREE.MeshStandardMaterial({
  color: "#20304a",
  metalness: 0.42,
  roughness: 0.36,
});

const balconyMaterial = new THREE.MeshStandardMaterial({
  color: "#f8fafc",
  metalness: 0.28,
  roughness: 0.48,
});

const makeTowerFloors = (): TowerFloor[] =>
  Array.from({ length: 18 }, (_, index) => {
    const floor = index + 1;
    const units = (["A", "B", "C", "D"] as const).map((wing, unitIndex) => {
      const statusSeed = (floor + unitIndex * 2) % 7;
      const status: UnitStatus =
        statusSeed === 0 || statusSeed === 4
          ? "sold"
          : statusSeed === 2
          ? "reserved"
          : "available";

      return {
        id: `${floor}${wing}`,
        floor,
        wing,
        status,
        type: unitIndex % 2 === 0 ? "2 Bed Luxury" : "3 Bed Corner",
        area: unitIndex % 2 === 0 ? "1,245 sq ft" : "1,680 sq ft",
        price: unitIndex % 2 === 0 ? "$420,000" : "$565,000",
      };
    });

    return {
      number: floor,
      label: floor === 18 ? "Penthouse" : `Floor ${floor}`,
      units,
    };
  }).reverse();

const StatusDot = ({ status }: { status: UnitStatus }) => (
  <Box
    component="span"
    sx={{
      width: 8,
      height: 8,
      borderRadius: "50%",
      bgcolor: statusMeta[status].color,
      display: "inline-block",
      flexShrink: 0,
    }}
  />
);

interface TowerUnitMeshProps {
  unit: TowerUnit;
  floorIndex: number;
  unitIndex: number;
  selected: boolean;
  active: boolean;
  onHover: Dispatch<TowerUnit | null>;
  onSelect: Dispatch<TowerUnit>;
}

const TowerUnitMesh = ({
  unit,
  floorIndex,
  unitIndex,
  selected,
  active,
  onHover,
  onSelect,
}: TowerUnitMeshProps) => {
  const x = -1.05 + unitIndex * 0.7;
  const y = floorIndex * 0.22 + 0.22;
  const statusColor = statusMeta[unit.status].color;

  const handlePointerOver = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    document.body.style.cursor = "pointer";
    onHover(unit);
  };

  const handlePointerOut = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    document.body.style.cursor = "auto";
    onHover(null);
  };

  return (
    <group>
      <mesh
        position={[x, y, 0.84]}
        onClick={(event) => {
          event.stopPropagation();
          onSelect(unit);
        }}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <boxGeometry args={[0.48, 0.15, 0.035]} />
        <meshStandardMaterial
          color={statusColor}
          emissive={statusColor}
          emissiveIntensity={selected || active ? 0.24 : 0.08}
          opacity={unit.status === "sold" ? 0.5 : 0.86}
          transparent
          roughness={0.25}
        />
      </mesh>

      <mesh position={[x, y - 0.085, 0.91]}>
        <boxGeometry args={[0.54, 0.025, 0.2]} />
        <primitive object={balconyMaterial} attach="material" />
      </mesh>

      {active && (
        <Html position={[x, y + 0.16, 1.02]} center distanceFactor={6}>
          <div
            style={{
              padding: "4px 6px",
              borderRadius: 8,
              backgroundColor: "rgba(15, 23, 42, 0.88)",
              color: "#fff",
              minWidth: 112,
              boxShadow: "0 8px 24px rgba(15, 23, 42, 0.24)",
            }}
          >
            <Typography sx={{ fontSize: "0.68rem", fontWeight: 800 }}>
              Unit {unit.id}
            </Typography>
            <Typography sx={{ fontSize: "0.62rem", opacity: 0.82 }}>
              {statusMeta[unit.status].label}
            </Typography>
          </div>
        </Html>
      )}
    </group>
  );
};

interface TowerModelProps {
  floors: TowerFloor[];
  selectedFloor: number;
  activeUnit: TowerUnit | null;
  hoveredUnit: TowerUnit | null;
  onSelectFloor: Dispatch<number>;
  onSelectUnit: Dispatch<TowerUnit>;
  onHoverUnit: Dispatch<TowerUnit | null>;
}

const TowerModel = ({
  floors,
  selectedFloor,
  activeUnit,
  hoveredUnit,
  onSelectFloor,
  onSelectUnit,
  onHoverUnit,
}: TowerModelProps) => {
  const ascendingFloors = [...floors].reverse();

  return (
    <group position={[0, -2.05, 0]} rotation={[0, -0.34, 0]}>
      <mesh position={[0, -0.13, 0]}>
        <boxGeometry args={[3.55, 0.26, 2.05]} />
        <meshStandardMaterial color="#d6b66d" metalness={0.18} roughness={0.42} />
      </mesh>

      <mesh position={[0, 4.28, 0]}>
        <boxGeometry args={[2.55, 0.24, 1.38]} />
        <meshStandardMaterial color="#caa95f" metalness={0.24} roughness={0.34} />
      </mesh>

      {ascendingFloors.map((floor, floorIndex) => {
        const y = floorIndex * 0.22 + 0.18;
        const isSelectedFloor = selectedFloor === floor.number;

        return (
          <group key={floor.number}>
            <mesh
              position={[0, y, 0]}
              onClick={(event) => {
                event.stopPropagation();
                onSelectFloor(floor.number);
              }}
              onPointerOver={() => {
                document.body.style.cursor = "pointer";
              }}
              onPointerOut={() => {
                document.body.style.cursor = "auto";
              }}
            >
              <boxGeometry args={[2.72, 0.045, 1.38]} />
              <meshStandardMaterial
                color={isSelectedFloor ? "#d6b66d" : "#ecf4ff"}
                metalness={0.12}
                roughness={0.32}
                opacity={isSelectedFloor ? 0.72 : 0.38}
                transparent
              />
            </mesh>

            <mesh position={[0, y + 0.055, 0.72]}>
              <boxGeometry args={[2.8, 0.035, 0.055]} />
              <primitive object={frameMaterial} attach="material" />
            </mesh>

            <mesh position={[0, y + 0.055, -0.72]}>
              <boxGeometry args={[2.8, 0.035, 0.055]} />
              <primitive object={frameMaterial} attach="material" />
            </mesh>

            <mesh position={[-1.42, y + 0.06, 0]}>
              <boxGeometry args={[0.05, 0.14, 1.42]} />
              <primitive object={glassMaterial} attach="material" />
            </mesh>

            <mesh position={[1.42, y + 0.06, 0]}>
              <boxGeometry args={[0.05, 0.14, 1.42]} />
              <primitive object={glassMaterial} attach="material" />
            </mesh>

            {floor.units.map((unit, unitIndex) => (
              <TowerUnitMesh
                key={unit.id}
                unit={unit}
                floorIndex={floorIndex}
                unitIndex={unitIndex}
                selected={activeUnit?.id === unit.id}
                active={hoveredUnit?.id === unit.id || activeUnit?.id === unit.id}
                onHover={onHoverUnit}
                onSelect={(nextUnit) => {
                  onSelectFloor(nextUnit.floor);
                  onSelectUnit(nextUnit);
                }}
              />
            ))}
          </group>
        );
      })}

      <mesh position={[0, 2.15, -0.74]}>
        <boxGeometry args={[2.94, 4.1, 0.045]} />
        <primitive object={glassMaterial} attach="material" />
      </mesh>

      {[-0.72, 0, 0.72].map((x) => (
        <mesh key={x} position={[x, 2.15, 0.78]}>
          <boxGeometry args={[0.035, 4.2, 0.08]} />
          <primitive object={frameMaterial} attach="material" />
        </mesh>
      ))}

      <mesh position={[0, 4.55, 0]}>
        <coneGeometry args={[1.38, 0.42, 4]} />
        <meshStandardMaterial color="#1e2d46" metalness={0.42} roughness={0.28} />
      </mesh>
    </group>
  );
};

export const Tower3DView = ({ roll, pitch, yaw }: Tower3DViewProps) => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const floors = useMemo(makeTowerFloors, []);
  const [selectedFloor, setSelectedFloor] = useState(12);
  const [activeUnit, setActiveUnit] = useState<TowerUnit | null>(
    floors.find((floor) => floor.number === 12)?.units[0] ?? null
  );
  const [hoveredUnit, setHoveredUnit] = useState<TowerUnit | null>(null);
  const selectedFloorData = floors.find((floor) => floor.number === selectedFloor);
  const displayUnit = hoveredUnit ?? activeUnit ?? selectedFloorData?.units[0] ?? null;

  const statusCounts = useMemo(
    () =>
      floors.flatMap((floor) => floor.units).reduce(
        (counts, unit) => ({
          ...counts,
          [unit.status]: counts[unit.status] + 1,
        }),
        { available: 0, reserved: 0, sold: 0 } as Record<UnitStatus, number>
      ),
    [floors]
  );
  const hasLiveAngles = [roll, pitch, yaw].some(
    (value) => typeof value === "number" && Number.isFinite(value)
  );
  const rootStyle: CSSProperties = {
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: 10,
    display: "grid",
    flex: 1,
    gap: 8,
    gridTemplateColumns: isDesktop ? "132px minmax(0, 1fr) 156px" : "1fr",
    gridTemplateRows: isDesktop ? "1fr" : "auto minmax(360px, 1fr) auto",
    minHeight: 0,
    overflow: "hidden",
  };
  const floorRailStyle: CSSProperties = {
    borderBottom: isDesktop ? 0 : `1px solid ${theme.palette.divider}`,
    borderRight: isDesktop ? `1px solid ${theme.palette.divider}` : 0,
    display: "flex",
    flexDirection: isDesktop ? "column" : "row",
    gap: 6,
    overflowX: isDesktop ? "hidden" : "auto",
    overflowY: isDesktop ? "auto" : "hidden",
    padding: 8,
  };
  const sceneStyle: CSSProperties = {
    background: `linear-gradient(180deg, ${alpha(
      theme.palette.primary.main,
      0.08
    )}, ${alpha("#0f172a", 0.03)} 56%, ${alpha("#d6b66d", 0.1)})`,
    minHeight: 360,
    position: "relative",
  };
  const detailsPanelStyle: CSSProperties = {
    backgroundColor: alpha(theme.palette.background.default, 0.7),
    borderLeft: isDesktop ? `1px solid ${theme.palette.divider}` : 0,
    borderTop: isDesktop ? 0 : `1px solid ${theme.palette.divider}`,
    overflowY: "auto",
    padding: 8,
  };

  return (
    <div style={rootStyle}>
      <div style={floorRailStyle}>
        {floors.map((floor) => (
          <Button
            key={floor.number}
            size="small"
            variant={selectedFloor === floor.number ? "contained" : "outlined"}
            onClick={() => {
              setSelectedFloor(floor.number);
              setActiveUnit(floor.units[0] ?? null);
            }}
            sx={{
              justifyContent: "space-between",
              minWidth: { xs: 92, md: 0 },
              px: 0.9,
              py: 0.45,
              fontSize: "0.68rem",
              textTransform: "none",
              borderRadius: 0.75,
              borderColor: "divider",
            }}
          >
            <span>{floor.label}</span>
            <span>{floor.units.filter((unit) => unit.status === "available").length}</span>
          </Button>
        ))}
      </div>

      <div style={sceneStyle}>
        <Canvas
          shadows
          dpr={[1, 1.6]}
          camera={{ position: [4.4, 3.2, 5.6], fov: 42 }}
          gl={{ antialias: true, alpha: true }}
          onPointerMissed={() => setHoveredUnit(null)}
        >
          <ambientLight intensity={0.82} />
          <directionalLight
            position={[4, 6, 4]}
            intensity={1.45}
            castShadow
            shadow-mapSize={[1024, 1024]}
          />
          <spotLight position={[-4, 5, 3]} intensity={0.75} angle={0.45} penumbra={0.7} />
          <TowerModel
            floors={floors}
            selectedFloor={selectedFloor}
            activeUnit={activeUnit}
            hoveredUnit={hoveredUnit}
            onSelectFloor={setSelectedFloor}
            onSelectUnit={setActiveUnit}
            onHoverUnit={setHoveredUnit}
          />
          <ContactShadows
            position={[0, -2.2, 0]}
            opacity={0.35}
            scale={7}
            blur={2.5}
            far={2.4}
          />
          <OrbitControls
            makeDefault
            enableDamping
            dampingFactor={0.08}
            minDistance={4.2}
            maxDistance={9}
            minPolarAngle={0.55}
            maxPolarAngle={1.55}
            target={[0, 0.9, 0]}
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
          {(Object.keys(statusMeta) as UnitStatus[]).map((status) => (
            <Chip
              key={status}
              size="small"
              label={`${statusMeta[status].label} ${statusCounts[status]}`}
              sx={{
                height: 22,
                borderRadius: 1,
                bgcolor: statusMeta[status].softColor,
                color: statusMeta[status].color,
                fontSize: "0.65rem",
                fontWeight: 800,
              }}
            />
          ))}
        </div>

        {hasLiveAngles && (
          <Chip
            size="small"
            label="Live structure"
            sx={{
              position: "absolute",
              right: 10,
              top: 10,
              height: 22,
              borderRadius: 1,
              bgcolor: alpha(theme.palette.primary.main, 0.12),
              color: "primary.main",
              fontSize: "0.65rem",
              fontWeight: 800,
            }}
          />
        )}
      </div>

      <div style={detailsPanelStyle}>
        <Typography
          sx={{
            fontSize: "0.66rem",
            fontWeight: 800,
            color: "text.secondary",
            textTransform: "uppercase",
            letterSpacing: 0.4,
            mb: 0.75,
          }}
        >
          Unit Details
        </Typography>

        {displayUnit && (
          <Stack spacing={0.9}>
            <div>
              <Typography sx={{ fontSize: "1rem", fontWeight: 900, lineHeight: 1 }}>
                Unit {displayUnit.id}
              </Typography>
              <Typography sx={{ fontSize: "0.72rem", color: "text.secondary", mt: 0.25 }}>
                {selectedFloorData?.label} | Wing {displayUnit.wing}
              </Typography>
            </div>

            <Chip
              icon={<StatusDot status={displayUnit.status} />}
              label={statusMeta[displayUnit.status].label}
              size="small"
              sx={{
                alignSelf: "flex-start",
                height: 24,
                borderRadius: 1,
                bgcolor: statusMeta[displayUnit.status].softColor,
                color: statusMeta[displayUnit.status].color,
                fontWeight: 800,
                "& .MuiChip-icon": { ml: 0.75 },
              }}
            />

            {[
              ["Type", displayUnit.type],
              ["Area", displayUnit.area],
              ["Price", displayUnit.price],
              ["View", displayUnit.wing === "A" || displayUnit.wing === "D" ? "Skyline" : "Courtyard"],
            ].map(([label, value]) => (
              <div
                key={label}
                style={{
                  padding: 6,
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

            <div>
              <Typography sx={{ fontSize: "0.66rem", fontWeight: 800, mb: 0.5 }}>
                Floor Units
              </Typography>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: 4,
                }}
              >
                {selectedFloorData?.units.map((unit) => (
                  <Button
                    key={unit.id}
                    size="small"
                    variant={activeUnit?.id === unit.id ? "contained" : "outlined"}
                    onClick={() => setActiveUnit(unit)}
                    sx={{
                      minWidth: 0,
                      py: 0.35,
                      fontSize: "0.66rem",
                      textTransform: "none",
                      borderColor: statusMeta[unit.status].color,
                      color:
                        activeUnit?.id === unit.id
                          ? "#fff"
                          : statusMeta[unit.status].color,
                      bgcolor:
                        activeUnit?.id === unit.id
                          ? statusMeta[unit.status].color
                          : "background.paper",
                      "&:hover": {
                        bgcolor:
                          activeUnit?.id === unit.id
                            ? statusMeta[unit.status].color
                            : statusMeta[unit.status].softColor,
                      },
                    }}
                  >
                    {unit.id}
                  </Button>
                ))}
              </div>
            </div>
          </Stack>
        )}
      </div>
    </div>
  );
};

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { PointerLockControls, Stars, Html } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

export type Station = "documents" | "terminal";

type Hotspot = {
  id: Station;
  label: string;
  prompt: string;
  position: [number, number, number];
};

const HOTSPOTS: Hotspot[] = [
  {
    id: "documents",
    label: "Document desk",
    prompt: "Read the travel journal",
    position: [-1.55, 0, -4.5],
  },
  {
    id: "terminal",
    label: "Workstation",
    prompt: "Boot the dev terminal",
    position: [1.55, 0, 2.5],
  },
];

const HALF_W = 2.1;
const HALF_L = 11.5;

function useKeys(onInteract: () => void) {
  const keys = useRef<Record<string, boolean>>({});
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      keys.current[e.code] = true;
      if (e.code === "KeyE") onInteract();
    };
    const up = (e: KeyboardEvent) => (keys.current[e.code] = false);
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [onInteract]);
  return keys;
}

function Player({
  onNear,
  onInteract,
}: {
  onNear: (h: Hotspot | null) => void;
  onInteract: () => void;
}) {
  const { camera } = useThree();
  const keys = useKeys(onInteract);
  const velocity = useRef(new THREE.Vector3());
  const forward = useMemo(() => new THREE.Vector3(), []);
  const right = useMemo(() => new THREE.Vector3(), []);
  const bob = useRef(0);

  useEffect(() => {
    camera.position.set(0, 1.65, 8);
  }, [camera]);

  useFrame((state, dt) => {
    const k = keys.current;
    const speed = (k["ShiftLeft"] || k["ShiftRight"] ? 6 : 3.2) * dt;

    camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();
    right.crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();

    const move = new THREE.Vector3();
    if (k["KeyW"] || k["ArrowUp"]) move.add(forward);
    if (k["KeyS"] || k["ArrowDown"]) move.sub(forward);
    if (k["KeyD"] || k["ArrowRight"]) move.add(right);
    if (k["KeyA"] || k["ArrowLeft"]) move.sub(right);
    if (move.lengthSq() > 0) move.normalize().multiplyScalar(speed);

    velocity.current.lerp(move, 0.25);
    camera.position.x += velocity.current.x;
    camera.position.z += velocity.current.z;

    camera.position.x = THREE.MathUtils.clamp(camera.position.x, -HALF_W, HALF_W);
    camera.position.z = THREE.MathUtils.clamp(camera.position.z, -HALF_L, HALF_L);

    // footstep bob + carriage sway
    const t = state.clock.elapsedTime;
    bob.current += velocity.current.length() * 6;
    camera.position.y =
      1.65 + Math.sin(bob.current) * 0.04 + Math.sin(t * 1.6) * 0.02;

    let near: Hotspot | null = null;
    let best = 2.4;
    for (const h of HOTSPOTS) {
      const d = Math.hypot(
        camera.position.x - h.position[0],
        camera.position.z - h.position[2],
      );
      if (d < best) {
        best = d;
        near = h;
      }
    }
    onNear(near);
  });

  return null;
}

function Desk({
  position,
  children,
}: {
  position: [number, number, number];
  children?: React.ReactNode;
}) {
  return (
    <group position={position}>
      <mesh position={[0, 0.74, 0]} castShadow>
        <boxGeometry args={[1.5, 0.08, 0.8]} />
        <meshStandardMaterial color="#3a2c22" roughness={0.55} metalness={0.15} />
      </mesh>
      {[
        [-0.65, 0, -0.3],
        [0.65, 0, -0.3],
        [-0.65, 0, 0.3],
        [0.65, 0, 0.3],
      ].map((p, i) => (
        <mesh key={i} position={[p[0], 0.36, p[2]]}>
          <cylinderGeometry args={[0.045, 0.045, 0.72, 10]} />
          <meshStandardMaterial color="#8d94a5" roughness={0.4} metalness={0.7} />
        </mesh>
      ))}
      {children}
    </group>
  );
}

function DocumentStation({ hotspot, active }: { hotspot: Hotspot; active: boolean }) {
  return (
    <Desk position={hotspot.position}>
      {/* stacked papers */}
      {[0, 1, 2, 3].map((i) => (
        <mesh
          key={i}
          position={[-0.28 + i * 0.02, 0.79 + i * 0.012, 0.02 + i * 0.015]}
          rotation={[-Math.PI / 2, 0, (i - 1.5) * 0.09]}
        >
          <planeGeometry args={[0.42, 0.56]} />
          <meshStandardMaterial color="#e8e6df" roughness={0.9} />
        </mesh>
      ))}
      {/* open ledger */}
      <mesh position={[0.38, 0.79, -0.02]} rotation={[-Math.PI / 2, 0, 0.2]}>
        <planeGeometry args={[0.7, 0.5]} />
        <meshStandardMaterial color="#cfd6e6" roughness={0.95} />
      </mesh>
      {/* brass lamp */}
      <group position={[0.6, 0.78, 0.26]}>
        <mesh position={[0, 0.16, 0]}>
          <cylinderGeometry args={[0.015, 0.02, 0.32, 8]} />
          <meshStandardMaterial color="#b08d57" metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.34, 0]}>
          <coneGeometry args={[0.11, 0.12, 12, 1, true]} />
          <meshStandardMaterial
            color="#b08d57"
            emissive="#ffd9a0"
            emissiveIntensity={0.5}
            metalness={0.7}
            roughness={0.35}
            side={THREE.DoubleSide}
          />
        </mesh>
        <pointLight position={[0, 0.26, 0]} intensity={3} distance={3.2} color="#ffd2a1" />
      </group>
      <Label position={[0, 1.5, 0]} text={hotspot.label} active={active} />
    </Desk>
  );
}

function TerminalStation({ hotspot, active }: { hotspot: Hotspot; active: boolean }) {
  const screen = useRef<THREE.MeshStandardMaterial>(null);
  useFrame((state) => {
    if (screen.current) {
      const t = state.clock.elapsedTime;
      screen.current.emissiveIntensity = 1.1 + Math.sin(t * 8) * 0.06;
    }
  });
  return (
    <Desk position={hotspot.position}>
      {/* monitor */}
      <group position={[0, 0.78, -0.16]}>
        <mesh position={[0, 0.1, 0]}>
          <cylinderGeometry args={[0.14, 0.16, 0.03, 16]} />
          <meshStandardMaterial color="#6f7787" metalness={0.7} roughness={0.35} />
        </mesh>
        <mesh position={[0, 0.28, 0]}>
          <boxGeometry args={[0.05, 0.34, 0.05]} />
          <meshStandardMaterial color="#6f7787" metalness={0.7} roughness={0.35} />
        </mesh>
        <mesh position={[0, 0.62, 0]}>
          <boxGeometry args={[0.98, 0.6, 0.05]} />
          <meshStandardMaterial color="#1b2130" roughness={0.5} metalness={0.3} />
        </mesh>
        <mesh position={[0, 0.62, 0.031]}>
          <planeGeometry args={[0.9, 0.52]} />
          <meshStandardMaterial
            ref={screen}
            color="#0a1420"
            emissive="#7aa8d8"
            emissiveIntensity={1.1}
            roughness={0.2}
          />
        </mesh>
        <pointLight position={[0, 0.62, 0.4]} intensity={2.6} distance={3.4} color="#9dc3f0" />
      </group>
      {/* keyboard + mug */}
      <mesh position={[0, 0.795, 0.22]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.62, 0.2]} />
        <meshStandardMaterial color="#22293a" roughness={0.7} />
      </mesh>
      <mesh position={[0.52, 0.83, 0.2]}>
        <cylinderGeometry args={[0.055, 0.05, 0.1, 14]} />
        <meshStandardMaterial color="#e8e6df" roughness={0.8} />
      </mesh>
      <Label position={[0, 1.75, 0]} text={hotspot.label} active={active} />
    </Desk>
  );
}

function Label({
  position,
  text,
  active,
}: {
  position: [number, number, number];
  text: string;
  active: boolean;
}) {
  return (
    <Html position={position} center distanceFactor={8} zIndexRange={[10, 0]}>
      <div
        className={`pointer-events-none whitespace-nowrap rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.24em] backdrop-blur transition-colors ${
          active
            ? "border-moon/70 bg-background/85 text-foreground"
            : "border-border/60 bg-background/60 text-muted-foreground"
        }`}
      >
        {text}
      </div>
    </Html>
  );
}

function Carriage() {
  const windows = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => -9 + i * 3.6),
    [],
  );
  return (
    <group>
      {/* floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[5, 24]} />
        <meshStandardMaterial color="#1b202c" roughness={0.85} />
      </mesh>
      {/* runner rug */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]}>
        <planeGeometry args={[1.5, 23]} />
        <meshStandardMaterial color="#2b2029" roughness={1} />
      </mesh>
      {/* ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 3, 0]}>
        <planeGeometry args={[5, 24]} />
        <meshStandardMaterial color="#151a24" roughness={0.9} />
      </mesh>
      {/* side walls (paneling) with window cutouts faked by dark frames */}
      {[-2.5, 2.5].map((x) => (
        <group key={x}>
          <mesh position={[x, 1.5, 0]} rotation={[0, x > 0 ? -Math.PI / 2 : Math.PI / 2, 0]}>
            <planeGeometry args={[24, 3]} />
            <meshStandardMaterial color="#232a38" roughness={0.8} side={THREE.DoubleSide} />
          </mesh>
          {windows.map((z) => (
            <group key={z} position={[x + (x > 0 ? -0.02 : 0.02), 1.7, z]}>
              <mesh rotation={[0, x > 0 ? -Math.PI / 2 : Math.PI / 2, 0]}>
                <planeGeometry args={[2.4, 1.3]} />
                <meshBasicMaterial color="#05070d" side={THREE.DoubleSide} />
              </mesh>
              <mesh
                rotation={[0, x > 0 ? -Math.PI / 2 : Math.PI / 2, 0]}
                position={[x > 0 ? -0.01 : 0.01, 0, 0]}
              >
                <planeGeometry args={[2.55, 1.45]} />
                <meshStandardMaterial
                  color="#b08d57"
                  metalness={0.6}
                  roughness={0.4}
                  side={THREE.DoubleSide}
                />
              </mesh>
            </group>
          ))}
        </group>
      ))}
      {/* end walls with doors */}
      {[-12, 12].map((z) => (
        <group key={z} position={[0, 1.5, z]}>
          <mesh>
            <planeGeometry args={[5, 3]} />
            <meshStandardMaterial color="#1e2532" roughness={0.85} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0, -0.15, z > 0 ? -0.03 : 0.03]}>
            <planeGeometry args={[1.4, 2.4]} />
            <meshStandardMaterial
              color="#0d1220"
              emissive="#7aa8d8"
              emissiveIntensity={0.12}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      ))}
      {/* overhead lamps */}
      {[-8, -4, 0, 4, 8].map((z) => (
        <group key={z} position={[0, 2.82, z]}>
          <mesh>
            <sphereGeometry args={[0.16, 16, 16]} />
            <meshStandardMaterial
              color="#e8e6df"
              emissive="#ffd9a0"
              emissiveIntensity={1.4}
              roughness={0.4}
            />
          </mesh>
          <pointLight intensity={5} distance={9} color="#ffd2a1" />
        </group>
      ))}
      {/* bench seats along walls */}
      {[-9.5, -6.5, 6, 9].map((z) =>
        [-2.05, 2.05].map((x) => (
          <group key={`${z}-${x}`} position={[x, 0, z]}>
            <mesh position={[0, 0.45, 0]}>
              <boxGeometry args={[0.8, 0.12, 1.5]} />
              <meshStandardMaterial color="#3b2733" roughness={0.9} />
            </mesh>
            <mesh position={[x > 0 ? 0.34 : -0.34, 0.85, 0]}>
              <boxGeometry args={[0.12, 0.9, 1.5]} />
              <meshStandardMaterial color="#3b2733" roughness={0.9} />
            </mesh>
          </group>
        )),
      )}
      {/* luggage rails */}
      {[-2.35, 2.35].map((x) => (
        <mesh key={x} position={[x, 2.3, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.03, 0.03, 23, 8]} />
          <meshStandardMaterial color="#b08d57" metalness={0.8} roughness={0.3} />
        </mesh>
      ))}
    </group>
  );
}

/** Outside world: the moon drifting alongside plus streaking stars for speed. */
function SpaceOutside() {
  const moon = useRef<THREE.Group>(null);
  const streaks = useRef<THREE.Group>(null);

  const streakData = useMemo(
    () =>
      Array.from({ length: 90 }, () => ({
        x: (Math.random() > 0.5 ? 1 : -1) * (10 + Math.random() * 26),
        y: -6 + Math.random() * 22,
        z: -40 + Math.random() * 80,
        len: 3 + Math.random() * 9,
        speed: 24 + Math.random() * 46,
      })),
    [],
  );

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    if (moon.current) {
      moon.current.rotation.y += dt * 0.02;
      moon.current.position.z = -6 + Math.sin(t * 0.04) * 22;
      moon.current.position.y = 12 + Math.sin(t * 0.07) * 1.2;
    }
    if (streaks.current) {
      streaks.current.children.forEach((c, i) => {
        c.position.z += streakData[i].speed * dt;
        if (c.position.z > 44) c.position.z = -44;
      });
    }
  });

  return (
    <group>
      <Stars radius={140} depth={70} count={4000} factor={5} saturation={0} fade speed={0.4} />
      <group ref={moon} position={[-42, 12, -6]}>
        <mesh>
          <sphereGeometry args={[13, 64, 64]} />
          <meshStandardMaterial
            color="#e8e6df"
            emissive="#4a5a7a"
            emissiveIntensity={0.35}
            roughness={1}
          />
        </mesh>
        <mesh scale={1.35}>
          <sphereGeometry args={[13, 32, 32]} />
          <meshBasicMaterial
            color="#7aa8d8"
            transparent
            opacity={0.07}
            side={THREE.BackSide}
          />
        </mesh>
      </group>
      <group ref={streaks}>
        {streakData.map((s, i) => (
          <mesh key={i} position={[s.x, s.y, s.z]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.03, 0.03, s.len, 5]} />
            <meshBasicMaterial color="#cfdcf5" transparent opacity={0.5} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

/** Gentle carriage sway applied to the whole world, so the room feels in motion. */
function Sway({ children }: { children: React.ReactNode }) {
  const g = useRef<THREE.Group>(null);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (g.current) {
      g.current.rotation.z = Math.sin(t * 0.9) * 0.006;
      g.current.rotation.x = Math.sin(t * 1.4) * 0.003;
      g.current.position.x = Math.sin(t * 0.7) * 0.03;
    }
  });
  return <group ref={g}>{children}</group>;
}

export default function BioWorld({
  onNear,
  onInteract,
  onLockChange,
  activeId,
}: {
  onNear: (h: Hotspot | null) => void;
  onInteract: () => void;
  onLockChange: (locked: boolean) => void;
  activeId: Station | null;
}) {
  return (
    <Canvas camera={{ position: [0, 1.65, 8], fov: 72 }} dpr={[1, 2]} gl={{ antialias: true }}>
      <color attach="background" args={["#05070d"]} />
      <Suspense fallback={null}>
        <ambientLight intensity={0.22} />
        <directionalLight position={[-14, 10, -12]} intensity={0.9} color="#cfdcf5" />
        <SpaceOutside />
        <Sway>
          <Carriage />
          <DocumentStation hotspot={HOTSPOTS[0]} active={activeId === "documents"} />
          <TerminalStation hotspot={HOTSPOTS[1]} active={activeId === "terminal"} />
        </Sway>
        <Player onNear={onNear} onInteract={onInteract} />
        <PointerLockControls
          onLock={() => onLockChange(true)}
          onUnlock={() => onLockChange(false)}
        />
      </Suspense>
    </Canvas>
  );
}

export type { Hotspot };

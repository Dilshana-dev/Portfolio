import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { Stars, Float } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import moonTexture from "@/assets/2k_moon.jpg";


// Shared scroll progress (0..1) read from window. Updated via rAF.
const scrollRef = { current: 0 };




function useScrollTracker() {
  useEffect(() => {
    let raf = 0;
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      scrollRef.current = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      raf = requestAnimationFrame(update);
    };
    raf = requestAnimationFrame(update);
    return () => cancelAnimationFrame(raf);
  }, []);
}

function Moon() {
  const ref = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.MeshStandardMaterial>(null);
  const haloOuter = useRef<THREE.MeshBasicMaterial>(null);
  const haloInner = useRef<THREE.MeshBasicMaterial>(null);
  const group = useRef<THREE.Group>(null);
  const phaseShadow = useRef<THREE.Mesh>(null);
  const phaseMat = useRef<THREE.MeshBasicMaterial>(null);
  const texture = useLoader(THREE.TextureLoader, moonTexture);
  

  useFrame((_, dt) => {
    const s = scrollRef.current;
    if (ref.current) ref.current.rotation.y += dt * (0.05 + s * 0.35);
    if (matRef.current) {
      matRef.current.emissiveIntensity = 0.08 + s * 0.55;
      matRef.current.emissive.setHSL(0.62 - s * 0.1, 0.5, 0.35 + s * 0.15);
      // color-temperature drift: warm cream -> cool lunar blue
      matRef.current.color.setHSL(0.12 - s * 0.5 + (s > 0.5 ? 0.6 : 0), 0.05 + s * 0.15, 0.9 - s * 0.05);
    }
    if (haloOuter.current) haloOuter.current.opacity = 0.04 + s * 0.18;
    if (haloInner.current) haloInner.current.opacity = 0.06 + s * 0.22;
    if (group.current) {
      const targetScale = 1 + s * 0.35;
      group.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.05);
    }
    // Moon phase: shadow sphere slides across the moon face
    // full -> gibbous -> half -> crescent -> new-ish as scroll progresses
    if (phaseShadow.current) {
      const offset = -3.2 + s * 5.2; // starts hidden behind, sweeps across
      phaseShadow.current.position.x = offset;
      phaseShadow.current.position.z = 0.02;
    }
    if (phaseMat.current) {
      phaseMat.current.opacity = 0.55 + s * 0.35;
    }
  });

  return (
    <Float speed={1.2} rotationIntensity={0.2} floatIntensity={0.6}>
      <group ref={group}>
        <mesh ref={ref}>
          <sphereGeometry args={[1.6, 128, 128]} />
          <meshStandardMaterial
            ref={matRef}
            map={texture}
            roughness={1}
            metalness={0}
            emissive="#4a5a7a"
            emissiveIntensity={0.08}
          />
        </mesh>
        {/* Phase shadow - a dark sphere slightly larger and offset to occlude part of the moon */}
        {/*}
        <mesh ref={phaseShadow} position={[-3.2, 0, 0.02]}>
          <sphereGeometry args={[1.62, 96, 96]} />
          <meshBasicMaterial ref={phaseMat} color="#05070d" transparent opacity={0.6} />
        </mesh>
        <mesh scale={2.4}>
          <sphereGeometry args={[1.6, 32, 32]} />
          <meshBasicMaterial ref={haloOuter} color="#7aa8d8" transparent opacity={0.04} side={THREE.BackSide} />
        </mesh>
        <mesh scale={1.9}>
          <sphereGeometry args={[1.6, 32, 32]} />
          <meshBasicMaterial ref={haloInner} color="#c9d8ee" transparent opacity={0.06} side={THREE.BackSide} />
        </mesh>
        */}
      </group>
    </Float>
  );
}

function ScrollLights() {
  const key = useRef<THREE.DirectionalLight>(null);
  const rim = useRef<THREE.DirectionalLight>(null);
  const ambient = useRef<THREE.AmbientLight>(null);
  useFrame(() => {
    const s = scrollRef.current;
    if (key.current) {
      key.current.intensity = 2.2 + s * 1.6;
      key.current.color.setHSL(0.12 - s * 0.05, 0.35 + s * 0.3, 0.7);
    }
    if (rim.current) rim.current.intensity = 0.3 + s * 1.4;
    if (ambient.current) ambient.current.intensity = 0.15 + s * 0.25;
  });
  return (
    <>
      <ambientLight ref={ambient} intensity={0.15} />
      <directionalLight ref={key} position={[5, 3, 5]} intensity={2.2} color="#f5f2e8" />
      <directionalLight ref={rim} position={[-4, -2, -3]} intensity={0.3} color="#4a6a9a" />
    </>
  );
}

function ScrollStars() {
  const group = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    const s = scrollRef.current;
    if (group.current) {
      group.current.rotation.y += dt * (0.02 + s * 0.25);
      group.current.rotation.x += dt * (0.005 + s * 0.08);
      const scale = 1 + s * 0.4;
      group.current.scale.setScalar(scale);
    }
  });
  return (
    <group ref={group}>
      <Stars radius={60} depth={40} count={2500} factor={3} saturation={0} fade speed={0.4} />
    </group>
  );
}

// Twinkling constellations - small clusters of stars that pulse in brightness.
// Intensity ramps with scroll so mid/late sections feel more alive.
function Constellations() {
  const groupRef = useRef<THREE.Group>(null);
  const matRef = useRef<THREE.PointsMaterial>(null);

  const { geometry, phases } = useMemo(() => {
    const clusters = [
      { center: [-8, 4, -12], count: 7 },
      { center: [9, 3, -14], count: 6 },
      { center: [-6, -5, -10], count: 5 },
      { center: [7, -4, -16], count: 8 },
      { center: [0, 6, -18], count: 6 },
      { center: [-12, 0, -20], count: 5 },
    ];
    const positions: number[] = [];
    const phaseArr: number[] = [];
    clusters.forEach((c) => {
      for (let i = 0; i < c.count; i++) {
        positions.push(
          c.center[0] + (Math.random() - 0.5) * 2.5,
          c.center[1] + (Math.random() - 0.5) * 2.5,
          c.center[2] + (Math.random() - 0.5) * 2.5,
        );
        phaseArr.push(Math.random() * Math.PI * 2);
      }
    });
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    return { geometry: geo, phases: phaseArr };
  }, []);

  useFrame((state) => {
    const s = scrollRef.current;
    const t = state.clock.elapsedTime;
    if (matRef.current) {
      // average twinkle across cluster - opacity pulses; intensity grows with scroll
      const pulse = 0.5 + 0.5 * Math.sin(t * 2 + phases[0]);
      matRef.current.opacity = 0.4 + pulse * 0.3 + s * 0.3;
      matRef.current.size = 0.08 + s * 0.12 + pulse * 0.04;
      matRef.current.color.setHSL(0.58 - s * 0.05, 0.3 + s * 0.4, 0.85);
    }
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.0005 + s * 0.001;
    }
  });

  return (
    <group ref={groupRef}>
      <points geometry={geometry}>
        <pointsMaterial
          ref={matRef}
          size={0.1}
          sizeAttenuation
          transparent
          opacity={0.6}
          color="#dce6ff"
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}

// Shooting stars - occasional streaks across the sky.
// Frequency ramps up during mid-to-late scroll for "key moments".
type Shooter = {
  mesh: THREE.Mesh;
  mat: THREE.MeshBasicMaterial;
  velocity: THREE.Vector3;
  life: number;
  maxLife: number;
  active: boolean;
};

function ShootingStars() {
  const groupRef = useRef<THREE.Group>(null);
  const shootersRef = useRef<Shooter[]>([]);
  const nextSpawn = useRef<number>(2);

  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;
    const arr: Shooter[] = [];
    for (let i = 0; i < 6; i++) {
      const geo = new THREE.CylinderGeometry(0.008, 0.001, 1.4, 6, 1, true);
      geo.translate(0, -0.7, 0);
      geo.rotateZ(Math.PI / 2);
      const mat = new THREE.MeshBasicMaterial({
        color: "#ffffff",
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.visible = false;
      group.add(mesh);
      arr.push({ mesh, mat, velocity: new THREE.Vector3(), life: 0, maxLife: 1, active: false });
    }
    shootersRef.current = arr;
    return () => {
      arr.forEach((s) => {
        group.remove(s.mesh);
        s.mesh.geometry.dispose();
        s.mat.dispose();
      });
    };
  }, []);

  const spawn = () => {
    const shooters = shootersRef.current;
    const idle = shooters.find((s) => !s.active);
    if (!idle) return;
    const s = scrollRef.current;
    const startX = 8 + Math.random() * 6;
    const startY = 2 + Math.random() * 6;
    const startZ = -6 - Math.random() * 8;
    idle.mesh.position.set(startX, startY, startZ);
    const speed = 12 + Math.random() * 8 + s * 10;
    // travel diagonally down-left
    const dir = new THREE.Vector3(-1, -0.35 - Math.random() * 0.4, 0).normalize();
    idle.velocity.copy(dir).multiplyScalar(speed);
    // orient the streak along its velocity
    const angle = Math.atan2(idle.velocity.y, idle.velocity.x);
    idle.mesh.rotation.z = angle;
    idle.mat.color.setHSL(0.58 - s * 0.05, 0.15, 0.95);
    idle.mat.opacity = 0;
    idle.maxLife = 1.1 + Math.random() * 0.5;
    idle.life = 0;
    idle.active = true;
    idle.mesh.visible = true;
  };

  useFrame((_, dt) => {
    const s = scrollRef.current;
    // Spawn cadence: rare at top, frequent past 40% scroll.
    // baseline every ~6s, ramps to every ~0.9s at bottom.
    nextSpawn.current -= dt;
    if (nextSpawn.current <= 0) {
      // key moments: extra chance to spawn a burst between 40-70% and near end
      const keyBoost = (s > 0.4 && s < 0.7) || s > 0.85 ? 1.6 : 1;
      if (Math.random() < 0.55 * keyBoost || s > 0.3) spawn();
      if (s > 0.6 && Math.random() < 0.4) spawn(); // occasional pair
      nextSpawn.current = Math.max(0.6, 5.5 - s * 4.5) * (0.6 + Math.random() * 0.8);
    }

    shootersRef.current.forEach((sh) => {
      if (!sh.active) return;
      sh.life += dt;
      const t = sh.life / sh.maxLife;
      sh.mesh.position.addScaledVector(sh.velocity, dt);
      // fade in fast, out slow
      const fade = t < 0.15 ? t / 0.15 : 1 - (t - 0.15) / 0.85;
      sh.mat.opacity = Math.max(0, fade) * (0.7 + s * 0.3);
      if (t >= 1) {
        sh.active = false;
        sh.mesh.visible = false;
      }
    });
  });

  return <group ref={groupRef} />;
}

export default function MoonScene() {
  useScrollTracker();
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 45 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
    >
      <Suspense fallback={null}>
        <ScrollLights />
        <Moon />
        <ScrollStars />
        <Constellations />
        <ShootingStars />
      </Suspense>
    </Canvas>
  );
}



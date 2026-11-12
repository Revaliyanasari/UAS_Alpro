import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { readTataColors, TATA_SHAPE as S } from './tataDesign.js';

// TATA 3D prosedural: dibangun dari bentuk dasar three.js (tanpa file model), ukuran hampir nol.
// Dapat diganti file GLB final tanpa mengubah komponen lain (antarmuka: prop `state`).

function Robot({ state, colors }) {
  const root = useRef();
  const head = useRef();
  const eyes = useRef();
  const mouth = useRef();
  const armL = useRef();
  const armR = useRef();
  const started = useRef(0);

  const bodyGeo = useMemo(() => new RoundedBoxGeometry(S.body.width, S.body.height, S.body.depth, 6, S.body.radius), []);
  const screenGeo = useMemo(
    () => new RoundedBoxGeometry(S.screen.width, S.screen.height, 0.04, 4, S.screen.radius * 0.5),
    [],
  );

  useEffect(() => {
    started.current = performance.now();
  }, [state]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const since = (performance.now() - started.current) / 1000;
    const r = root.current;
    // dasar: bernapas + sedikit menoleh agar kedalaman 3D terlihat
    r.position.y = Math.sin(t * 2) * 0.02;
    r.rotation.y = -0.3 + Math.sin(t * 0.6) * 0.08;
    head.current.rotation.z += ((state === 'confused' ? -0.13 : 0) - head.current.rotation.z) * 0.15;
    if (eyes.current) eyes.current.scale.y = t % 4.5 < 0.12 ? 0.1 : 1;
    if (mouth.current) mouth.current.scale.y = state === 'talking' ? 0.5 + Math.abs(Math.sin(t * 9)) * 0.9 : 1;

    let left = 0.25;
    let right = -0.25;
    if (state === 'waving') right = -1.9 + Math.sin(t * 7) * 0.45;
    if (state === 'celebrating') {
      left = 2.2;
      right = -2.2;
    }
    armL.current.rotation.z += (left - armL.current.rotation.z) * 0.2;
    armR.current.rotation.z += (right - armR.current.rotation.z) * 0.2;

    if ((state === 'happy' && since < 1.8) || state === 'celebrating') {
      r.position.y += Math.abs(Math.sin(t * 6)) * 0.1;
    }
  });

  const halfW = S.body.width / 2;
  const front = S.body.depth / 2;
  const happyEyes = state === 'happy' || state === 'celebrating';

  return (
    <group ref={root}>
      {/* kaki */}
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * S.foot.offsetX, -S.body.height / 2 - 0.05, 0.05]} scale={[S.foot.rx, S.foot.ry, S.foot.rx * 1.2]}>
          <sphereGeometry args={[1, 20, 14]} />
          <meshStandardMaterial color={colors.foot} roughness={0.7} />
        </mesh>
      ))}
      {/* lengan: pivot di bahu */}
      <group ref={armL} position={[-halfW + 0.02, -0.08, 0]}>
        <mesh position={[-S.arm.length / 2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <capsuleGeometry args={[S.arm.thickness / 2, S.arm.length - S.arm.thickness, 6, 12]} />
          <meshStandardMaterial color={colors.body} roughness={0.55} />
        </mesh>
        {/* ubin x kuning di tangan kiri */}
        <mesh position={[-S.arm.length + 0.02, 0.07, 0.02]}>
          <boxGeometry args={[0.07, 0.28, 0.05]} />
          <meshStandardMaterial color={colors.tile} roughness={0.6} />
        </mesh>
      </group>
      <group ref={armR} position={[halfW - 0.02, -0.08, 0]}>
        <mesh position={[S.arm.length / 2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <capsuleGeometry args={[S.arm.thickness / 2, S.arm.length - S.arm.thickness, 6, 12]} />
          <meshStandardMaterial color={colors.body} roughness={0.55} />
        </mesh>
      </group>

      <group ref={head}>
        {/* badan */}
        <mesh geometry={bodyGeo}>
          <meshStandardMaterial color={colors.body} roughness={0.5} />
        </mesh>
        {/* layar wajah */}
        <mesh geometry={screenGeo} position={[0, S.screen.offsetY, front]}>
          <meshStandardMaterial color={colors.screen} roughness={0.35} />
        </mesh>
        {/* mata */}
        {happyEyes ? (
          [-1, 1].map((side) => (
            <mesh key={side} position={[side * S.eye.offsetX, S.eye.offsetY, front + 0.03]}>
              <torusGeometry args={[S.eye.radius * 0.8, 0.014, 8, 20, Math.PI]} />
              <meshStandardMaterial color={colors.ink} />
            </mesh>
          ))
        ) : (
          <group ref={eyes} position={[0, S.eye.offsetY, front + 0.03]}>
            {[-1, 1].map((side) => (
              <mesh key={side} position={[side * S.eye.offsetX, 0, 0]} scale={[1, 1, 0.45]}>
                <sphereGeometry args={[S.eye.radius, 20, 14]} />
                <meshStandardMaterial color={colors.ink} roughness={0.2} />
              </mesh>
            ))}
          </group>
        )}
        {/* pipi */}
        {[-1, 1].map((side) => (
          <mesh key={side} position={[side * S.cheek.offsetX, S.cheek.offsetY, front + 0.025]} scale={[S.cheek.rx, S.cheek.ry, 0.01]}>
            <sphereGeometry args={[1, 16, 10]} />
            <meshStandardMaterial color={colors.cheek} roughness={0.8} />
          </mesh>
        ))}
        {/* mulut */}
        <group ref={mouth} position={[0, S.mouth.offsetY, front + 0.03]}>
          {state === 'talking' ? (
            <mesh scale={[0.06, 0.04, 0.01]}>
              <sphereGeometry args={[1, 16, 10]} />
              <meshStandardMaterial color={colors.ink} />
            </mesh>
          ) : state === 'confused' ? (
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <capsuleGeometry args={[0.012, S.mouth.width * 0.8, 4, 8]} />
              <meshStandardMaterial color={colors.ink} />
            </mesh>
          ) : (
            <mesh rotation={[0, 0, Math.PI]}>
              <torusGeometry args={[S.mouth.width / 2, 0.016, 8, 24, Math.PI]} />
              <meshStandardMaterial color={colors.ink} />
            </mesh>
          )}
        </group>
        {/* antena tunas daun */}
        <mesh position={[0, S.body.height / 2 + S.stem.height / 2 - 0.02, 0]}>
          <cylinderGeometry args={[0.022, 0.022, S.stem.height, 10]} />
          <meshStandardMaterial color={colors.stem} />
        </mesh>
        {[-1, 1].map((side) => (
          <mesh
            key={side}
            position={[side * S.leaf.offsetX, S.body.height / 2 + S.stem.height - 0.02, 0]}
            rotation={[0, 0, side * 0.45]}
            scale={[S.leaf.rx, S.leaf.ry, S.leaf.ry * 0.8]}
          >
            <sphereGeometry args={[1, 16, 10]} />
            <meshStandardMaterial color={colors.leaf} roughness={0.6} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

export default function Tata3D({ state = 'idle', label = 'TATA' }) {
  const colors = useMemo(() => readTataColors(), []);
  const [visible, setVisible] = useState(() => document.visibilityState !== 'hidden');

  // Hemat baterai: berhenti menggambar saat tab/aplikasi tidak terlihat.
  useEffect(() => {
    const onVis = () => setVisible(document.visibilityState !== 'hidden');
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  return (
    <div role="img" aria-label={label} style={{ width: '100%', height: '100%' }} data-tata-mode="3d">
      <Canvas
        frameloop={visible ? 'always' : 'never'}
        dpr={[1, 1.5]}
        camera={{ position: [0, 0.15, 3.1], fov: 34 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
      >
        <hemisphereLight args={[0xffffff, 0xcfe7dc, 1.6]} />
        <directionalLight position={[2, 3, 4]} intensity={1.4} />
        <Robot state={state} colors={colors} />
      </Canvas>
    </div>
  );
}

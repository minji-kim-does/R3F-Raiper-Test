import { useRef, useEffect } from "react";
import { Environment, CameraControls } from "@react-three/drei";
import Ground from "./physics/Ground";
import PhysicsObject from "./physics/PhysicsObject";
import PhysicsText from "./physics/PhysicsText";

export function Scene() {
  const controlsRef = useRef();

  useEffect(() => {
    if (controlsRef.current) {
      // 카메라 초기 위치 설정
      controlsRef.current.setLookAt(
        10,
        10,
        10, // 카메라 위치 (x, y, z)
        0,
        0,
        0, // 타겟 위치 (x, y, z)
        true
      );
    }
  }, []);

  return (
    <>
      <CameraControls
        makeDefault
        enabled={true}
        distance={20}
        mouseButtons-left={0}
        touches-one={0}
      />
      <Environment preset="sunset" />
      <ambientLight color="#fff" intensity={1} />
      <Ground />
      <PhysicsObject position={[-1, 1, 0]} />
      <PhysicsText text="T E X T " position={[0, 1, 0]} />
    </>
  );
}

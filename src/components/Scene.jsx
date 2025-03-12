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
        10, 
        0,
        0,
        0, 
        true
      );
    }
  }, []);

  return (
    <>
      <CameraControls
        makeDefault
        enabled={true}
        distance={30}
        mouseButtons-left={0}
        touches-one={0}
      />
      <Environment preset="sunset" />
      <ambientLight color="#fff" intensity={1} />
      <Ground />
      <PhysicsObject position={[-3, 2, 0]}  />
      <PhysicsText text="D O E S " position={[0, 0.1, 0]} />
    </>
  );
}

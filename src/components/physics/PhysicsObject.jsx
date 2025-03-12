import { useRef, useState, useEffect, useCallback } from "react";
import { useGLTF } from "@react-three/drei";
import { RigidBody, useRapier } from "@react-three/rapier";
import { useFrame, useThree } from "@react-three/fiber";

import Model from "../../assets/glb/sheep.glb?url";
import { BoxGeometry } from "three";

function PhysicsObject({ position = [0, 0, 0], maxClicks = 5, ...props }) {
  const rigidBodyRef = useRef();
  const [isSelected, setIsSelected] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const initialPosition = useRef(position);
  const { nodes, materials } = useGLTF(Model, "/draco-gltf/");

  // 속도 및 위치 제한 범위
  const maxVelocity = 20; // 최대 속도 제한
  const boundaryLimit = {
    x: { min: -5, max: 5 },
    y: { min: 0, max: 5 },
    z: { min: -5, max: 5 },
  };

  // Click handlers
  const handleDown = (e) => {
    // e.stopPropagation();
    setIsSelected(true);

    // 클릭 횟수 증가 및 최대 클릭 횟수 도달 시 초기화
    if (clickCount >= maxClicks - 1) {
      setClickCount(0);
      // 초기 위치로 재설정
      if (rigidBodyRef.current) {
        rigidBodyRef.current.setTranslation(
          {
            x: initialPosition.current[0],
            y: initialPosition.current[1],
            z: initialPosition.current[2],
          },
          true
        );
        rigidBodyRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
      }
    } else {
      setClickCount((prev) => prev + 1);
    }
  };

  const clampPosition = (position) => {
    return {
      x: Math.max(
        boundaryLimit.x.min,
        Math.min(boundaryLimit.x.max, position.x)
      ),
      y: Math.max(
        boundaryLimit.y.min,
        Math.min(boundaryLimit.y.max, position.y)
      ),
      z: Math.max(
        boundaryLimit.z.min,
        Math.min(boundaryLimit.z.max, position.z)
      ),
    };
  };

  const handleMove = useCallback(
    (e) => {
      if (isSelected) {
        e.stopPropagation();
        console.log("MOVE", isSelected);
      }
    },
    [isSelected, boundaryLimit]
  );

  // Apply force on pointer up
  const handlePointerUp = () => {
    console.log("pointer up~~!~!");
    if (isSelected && rigidBodyRef.current) {
      rigidBodyRef.current.applyImpulse({ x: maxVelocity, y: 0, z: 0 }, true);

      setIsSelected(false);
    }
  };

  // 속도 제한을 위한 useFrame
  useFrame(() => {
    if (rigidBodyRef.current) {
      const velocity = rigidBodyRef.current.linvel();

      // 속도가 최대 속도를 초과하면 제한
      if (
        Math.abs(velocity.x) > maxVelocity ||
        Math.abs(velocity.y) > maxVelocity ||
        Math.abs(velocity.z) > maxVelocity
      ) {
        rigidBodyRef.current.setLinvel(
          {
            x:
              Math.sign(velocity.x) *
              Math.min(Math.abs(velocity.x), maxVelocity),
            y:
              Math.sign(velocity.y) *
              Math.min(Math.abs(velocity.y), maxVelocity),
            z:
              Math.sign(velocity.z) *
              Math.min(Math.abs(velocity.z), maxVelocity),
          },
          true
        );
      }

      // // 위치 경계 제한 (필요시 활성화)
      // const pos = rigidBodyRef.current.translation();
      // const clampedPos = clampPosition(pos);

      // if (
      //   pos.x !== clampedPos.x ||
      //   pos.y !== clampedPos.y ||
      //   pos.z !== clampedPos.z
      // ) {
      //   rigidBodyRef.current.setTranslation(clampedPos, true);
      // }
    }
  });

  useEffect(() => {
    if (isSelected) {
      window.addEventListener("pointerup", handlePointerUp);
    }

    return () => {
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [isSelected, handlePointerUp]);

  return (
    <RigidBody
      ref={rigidBodyRef}
      position={position}
      mass={1}
      colliders="cuboid"
      {...props}
    >
      <mesh
        // geometry={nodes.Material2.geometry}
        // rotation={[-Math.PI, 0, 0]}
        onPointerDown={handleDown}
        onPointerMove={handleMove}
        castShadow
        receiveShadow
        // scale={[0.5, 0.5, 0.5]}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={isSelected ? "hotpink" : "orange"} />
      </mesh>
    </RigidBody>
  );
}

useGLTF.preload(Model);

export default PhysicsObject;

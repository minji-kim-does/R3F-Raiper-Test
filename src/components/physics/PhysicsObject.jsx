import { useRef, useState, useEffect, useCallback } from "react";
import { RigidBody, useRapier } from "@react-three/rapier";
import { useFrame, useThree } from "@react-three/fiber";

function PhysicsObject({ position = [0, 0, 0], maxClicks = 5, ...props }) {
  const rigidBodyRef = useRef();
  const [isSelected, setIsSelected] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const initialPosition = useRef(position);

  
  // 속도 및 위치 제한 범위
  const maxVelocity = 5; // 최대 속도 제한
  const boundaryLimit = {
    x: { min: -5, max: 5 },
    y: { min: 0, max: 5 },
    z: { min: -5, max: 5 },
  };

  // Click handlers
  const handleDown = (e) => {
    // e.stopPropagation();
    setIsSelected(true);
    console.log("CLICK");

    // 클릭 횟수 증가 및 최대 클릭 횟수 도달 시 초기화
    if (clickCount >= maxClicks - 1) {
      setClickCount(0);
      // 초기 위치로 재설정
      if (rigidBodyRef.current) {
        rigidBodyRef.current.setTranslation(
          { 
            x: initialPosition.current[0], 
            y: initialPosition.current[1], 
            z: initialPosition.current[2] 
          },
          true // 깨어있는 상태로 유지
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
        // 위치 제한 적용
  
      }
    },
    [isSelected, boundaryLimit]
  );

  // Apply force on pointer up
  const handlePointerUp = () => {
    console.log("pointer up~~!~!");
    if (isSelected && rigidBodyRef.current) {
      // Rapier에서는 applyImpulse 대신 applyImpulse를 사용합니다
      rigidBodyRef.current.applyImpulse(
        { x: maxVelocity * 5, y: 0, z: 0 },
        true
      );

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
            x: Math.sign(velocity.x) * Math.min(Math.abs(velocity.x), maxVelocity),
            y: Math.sign(velocity.y) * Math.min(Math.abs(velocity.y), maxVelocity),
            z: Math.sign(velocity.z) * Math.min(Math.abs(velocity.z), maxVelocity)
          },
          true
        );
      }
      
      // 위치 경계 제한 (필요시 활성화)
      const pos = rigidBodyRef.current.translation();
      const clampedPos = clampPosition(pos);
      
      if (
        pos.x !== clampedPos.x || 
        pos.y !== clampedPos.y || 
        pos.z !== clampedPos.z
      ) {
        rigidBodyRef.current.setTranslation(clampedPos, true);
      }
    }
  });

  useEffect(() => {
    if (isSelected) {
      window.addEventListener('pointerup', handlePointerUp);
    }

    return () => {
      window.removeEventListener('pointerup', handlePointerUp);
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
        onPointerDown={handleDown}
        onPointerMove={handleMove}
        castShadow
        receiveShadow
      >
        <boxGeometry />
        <meshStandardMaterial color={isSelected ? "hotpink" : "orange"} />
      </mesh>
    </RigidBody>
  );
}

export default PhysicsObject;
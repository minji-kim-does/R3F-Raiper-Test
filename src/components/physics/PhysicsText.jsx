import { useRef, useState, useEffect, useMemo } from 'react';
import { Text3D, useMatcapTexture } from '@react-three/drei';
import { RigidBody } from '@react-three/rapier';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

function PhysicsText({ 
  text = "Hello", 
  position = [0, 0, 0], 
  explodeForce = 5,
  color = "white",
  fontSize = 1,
  ...props 
}) {
  const [exploded, setExploded] = useState(false);
  const [chunks, setChunks] = useState([]);
  const textRef = useRef();
  const [matcapTexture] = useMatcapTexture('7B5254_E9DCC7_B19986_C8AC91', 256);
  
  // 텍스트 메시를 청크로 분할하는 함수
  const createTextChunks = () => {
    if (!textRef.current) return;
    
    const mesh = textRef.current;
    const geometry = mesh.geometry.clone();
    
    // 기존 메시의 월드 위치와 회전 가져오기
    const worldPosition = new THREE.Vector3();
    const worldQuaternion = new THREE.Quaternion();
    mesh.getWorldPosition(worldPosition);
    mesh.getWorldQuaternion(worldQuaternion);
    
    // 삼각형 정보 가져오기
    const positions = geometry.getAttribute('position').array;
    const indices = geometry.index ? geometry.index.array : null;
    
    const triangles = [];
    const chunkSize = 3; // 몇 개의 삼각형을 하나의 청크로 그룹화할지 결정
    
    // 인덱스가 있는 경우 (대부분의 복잡한 지오메트리)
    if (indices) {
      for (let i = 0; i < indices.length; i += 3) {
        const a = indices[i] * 3;
        const b = indices[i + 1] * 3;
        const c = indices[i + 2] * 3;
        
        triangles.push([
          new THREE.Vector3(positions[a], positions[a + 1], positions[a + 2]),
          new THREE.Vector3(positions[b], positions[b + 1], positions[b + 2]),
          new THREE.Vector3(positions[c], positions[c + 1], positions[c + 2])
        ]);
      }
    } else {
      // 인덱스가 없는 경우 (단순한 지오메트리)
      for (let i = 0; i < positions.length; i += 9) {
        triangles.push([
          new THREE.Vector3(positions[i], positions[i + 1], positions[i + 2]),
          new THREE.Vector3(positions[i + 3], positions[i + 4], positions[i + 5]),
          new THREE.Vector3(positions[i + 6], positions[i + 7], positions[i + 8])
        ]);
      }
    }
    
    // 삼각형을 chunkSize 단위로 그룹화
    const triangleChunks = [];
    for (let i = 0; i < triangles.length; i += chunkSize) {
      triangleChunks.push(triangles.slice(i, i + chunkSize));
    }
    
    // 각 그룹에 대해 새 지오메트리 생성
    const newChunks = triangleChunks.map((triangleGroup, index) => {
      const chunkGeometry = new THREE.BufferGeometry();
      const vertices = [];
      const normals = [];
      
      // 각 삼각형의 정점을 vertices 배열에 추가
      triangleGroup.forEach(triangle => {
        // 삼각형 법선 계산
        const edge1 = new THREE.Vector3().subVectors(triangle[1], triangle[0]);
        const edge2 = new THREE.Vector3().subVectors(triangle[2], triangle[0]);
        const normal = new THREE.Vector3().crossVectors(edge1, edge2).normalize();
        
        // 첫 번째 정점
        vertices.push(triangle[0].x, triangle[0].y, triangle[0].z);
        normals.push(normal.x, normal.y, normal.z);
        
        // 두 번째 정점
        vertices.push(triangle[1].x, triangle[1].y, triangle[1].z);
        normals.push(normal.x, normal.y, normal.z);
        
        // 세 번째 정점
        vertices.push(triangle[2].x, triangle[2].y, triangle[2].z);
        normals.push(normal.x, normal.y, normal.z);
      });
      
      // 버퍼 지오메트리 속성 설정
      chunkGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
      chunkGeometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
      
      // 청크 중심점 계산
      chunkGeometry.computeBoundingSphere();
      const center = chunkGeometry.boundingSphere.center.clone();
      
      // 월드 공간 기준 위치 계산
      const worldCenter = center.clone().applyQuaternion(worldQuaternion).add(worldPosition);
      
      // 폭발 시 적용할 무작위 방향과 속도
      const direction = new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2
      ).normalize();
      
      const velocity = direction.clone().multiplyScalar(explodeForce * (0.5 + Math.random()));
      const angularVelocity = [
        (Math.random() - 0.5) * 5,
        (Math.random() - 0.5) * 5,
        (Math.random() - 0.5) * 5
      ];
      
      return {
        geometry: chunkGeometry,
        position: [worldCenter.x, worldCenter.y, worldCenter.z],
        velocity,
        angularVelocity
      };
    });
    
    setChunks(newChunks);
    setExploded(true);
  };
  
  // 텍스트를 클릭했을 때 폭발 효과 트리거
  const handleClick = () => {
    if (!exploded) {
      createTextChunks();
    }
  };
  
  // 청크 컴포넌트 - 분리된 텍스트 조각
  const Chunk = ({ geometry, position, velocity, angularVelocity }) => {
    const rigidBodyRef = useRef();
    
    useEffect(() => {
      if (rigidBodyRef.current) {
        // 초기 속도와 각속도 설정
        rigidBodyRef.current.setLinvel(velocity, true);
        rigidBodyRef.current.setAngvel(
          { x: angularVelocity[0], y: angularVelocity[1], z: angularVelocity[2] }, 
          true
        );
      }
    }, []);
    
    return (
      <RigidBody 
        ref={rigidBodyRef}
        position={position}
        mass={1}
        colliders="hull"
        restitution={0.2}
        friction={0.5}
      >
        <mesh geometry={geometry}>
          <meshMatcapMaterial matcap={matcapTexture} color={color} />
        </mesh>
      </RigidBody>
    );
  };
  
  // 폭발 효과가 진행 중인지 여부에 따라 원본 텍스트 또는 청크 렌더링
  return (
    <>
      {!exploded ? (
        <RigidBody position={position} type="fixed" {...props}>
          <Text3D
            ref={textRef}
            font="/Inter_Bold.json"
            size={fontSize}
            height={0.2}
            curveSegments={4}
            bevelEnabled
            bevelThickness={0.02}
            bevelSize={0.02}
            bevelSegments={3}
            onClick={handleClick}
          >
            {text}
            <meshMatcapMaterial matcap={matcapTexture} color={color} />
          </Text3D>
        </RigidBody>
      ) : (
        chunks.map((chunk, i) => (
          <Chunk key={i} {...chunk} />
        ))
      )}
    </>
  );
}

export default PhysicsText;
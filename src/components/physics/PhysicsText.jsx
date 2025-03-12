import { useRef, useState, useEffect } from 'react';
import { Text3D } from '@react-three/drei';
import { RigidBody } from '@react-three/rapier'; // useBox 대신 RigidBody 컴포넌트 사용

function PhysicsText({ text, position = [0, 0, 0], ...props }) {
  const [exploded, setExploded] = useState(false);
  const [textBounds, setTextBounds] = useState([1, 1, 1]);
  const textRef = useRef();
  const chunksRef = useRef([]);

  useEffect(() => {
    if (textRef.current) {
      textRef.current.geometry.computeBoundingBox();
      const box = textRef.current.geometry.boundingBox;
      
      const width = box.max.x - box.min.x;
      const height = box.max.y - box.min.y;
      const depth = box.max.z - box.min.z;
      
      setTextBounds([width, height, depth]);
    }
  }, [text]);

  const createTextChunks = () => {
    if (!textRef.current) return;
    
    const geometry = textRef.current.geometry.clone();
    // 삼각형 기반으로 메시 분할
    const chunks = [];
    
    // 각 삼각형 또는 다면체 그룹을 별도의 메시로 변환
    // 여기에 메시 분할 로직 구현
    
    chunksRef.current = chunks;
  };

  return (
    <RigidBody 
      position={position}
      mass={1}
      colliders="cuboid" 
      {...props}
    >
      <Text3D 
        ref={textRef}
        font="/Inter_Bold.json"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        {text}
        <meshStandardMaterial color="white" />
      </Text3D>
    </RigidBody>
  );
}

export default PhysicsText;
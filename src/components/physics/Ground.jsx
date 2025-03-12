import { RigidBody } from '@react-three/rapier'

function Ground(props) {
  return (
    <RigidBody 
      type="fixed" 
      rotation={[-Math.PI / 2, 0, 0]} 
      {...props}
    >
      <mesh receiveShadow castShadow>
        <planeGeometry args={[30, 30]} />
        <shadowMaterial color="#171717" transparent opacity={0.5} />
      </mesh>
    </RigidBody>
  )
}

export default Ground
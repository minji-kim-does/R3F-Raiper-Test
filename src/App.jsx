import { Canvas } from "@react-three/fiber";
import { Physics  } from "@react-three/rapier";
import { Scene } from "./components/Scene";

function App() {
  return (
    <Canvas shadows camera={{ position: [3, 3, 3], fov: 30 }}>
      <color attach="background" args={["#ececec"]} />
      <Physics debug={true}>
          <Scene />
      </Physics>
    </Canvas>
  );
}

export default App;

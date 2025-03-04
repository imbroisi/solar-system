import { Container } from './Main.styles';
import { Canvas, useFrame, useThree, useLoader } from '@react-three/fiber';
import { Suspense, useRef, useState } from 'react';
import { OrbitControls, Text } from '@react-three/drei';
import { TextureLoader } from 'three';
import sunTexture from './sun_texture.jpg';
import Earth, { EARTH_SIZE } from '../components/Earth/Earth';
import Sky from '../components/Sky';

import { Group } from 'three';

export interface MainProps { }

const ANGLE = 0;
const a = 1000000000000;
const b = a * Math.sin(Math.PI * ANGLE / 180);

function getDayOfYear(date: any) {
  const startOfYear: any = new Date(date.getFullYear(), 0, 0); // January 0 (December 31 of previous year)
  const diff = date - startOfYear; // Difference in milliseconds
  const oneDay = 1000 * 60 * 60 * 24; // Milliseconds in one day
  return Math.floor(diff / oneDay); // Convert to days
}

const getSeasonAndDate = (angle: any) => {
  // Normalize angle to [0, 2π]
  const normalizedAngle = ((angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);

  // Calculate the date based on the angle
  const daysInYear = 365.5;
  const daysPerRadian = daysInYear / (Math.PI * 2);
  const daysSinceSpring = normalizedAngle * daysPerRadian;

  // Start from March 22 (first day of spring)
  const startDate = new Date(2023, 5, 21); // March 22, 2023
  const currentDate = new Date(startDate);
  currentDate.setDate(startDate.getDate() - Math.round(daysSinceSpring) + 2);

  const month = currentDate.toLocaleString('default', { month: 'long' });
  const day = currentDate.getDate();

  let season = 'Winter';
  const monthDay = getDayOfYear(currentDate)

  if (monthDay > 79) {
    season = "Sprint";
  }

  if (monthDay > 170) {
    season = "Summer";
  }

  if (monthDay > 265) {
    season = "Fall";
  }

  if (monthDay > 354) {
    season = "Winter";
  }

  return { season, month, day };
};

function SeasonOverlay({ angle }: any) {
  const { season, month, day } = getSeasonAndDate(angle);

  return (
    <div
      style={{
        position: 'absolute',
        top: 30,
        left: '50%',
        transform: 'translateX(-50%)',
        color: 'white',
        fontSize: '24px',
        fontFamily: 'Arial, sans-serif',
        zIndex: 1,
        textAlign: 'center',
      }}
    >
      <div>{`${month} ${day}`}</div>
      <div>{`${season}`}</div>
    </div>
  );
}

function Sun() {
  const earthMap = useLoader(TextureLoader, sunTexture);

  return (
    <mesh position={[0, 0, -50]}>
      <sphereGeometry args={[0.5, 32, 32]} />
      <meshBasicMaterial map={earthMap} />
      <directionalLight
        color={0xffffff}
        intensity={15}
        position={[0, 0, -5]}
        target-position={[0, 0, 0]} // Ensure the light is directed towards the center
      />
    </mesh>
  );
}


function MainCanvas(props: any) {
  const inclinationRef = useRef(0);
  const textRef = useRef<{ text: string } | null>(null);
  const sceneRef = useRef<Group>(null);

  const getAngleDisplay = () => {
    if (inclinationRef.current > 23) {
      return '23.5°';
    }
    if (inclinationRef.current < -23) {
      return '-23.5°';
    }
    return `${(Math.round(inclinationRef.current - 0.8))}.0°`;
  }

  useFrame(() => {
    if (textRef.current && inclinationRef.current) {
      textRef.current!.text = getAngleDisplay();
    }
  });

  const setInclination = (x: number) => {
    inclinationRef.current = x;
  };

  return (
    <>
      <group ref={sceneRef} rotation={[0, Math.PI / 2, 0]}> Rotate the entire scene 90 degrees around the X-axis
        <ambientLight color={0xffffff} intensity={0.2} />
        <directionalLight
          color={0xffffff}
          intensity={0.3}
          position={[a, b, a]}
        />
        <Sun />
        <Earth
          setInclination={setInclination}
          showHelpers={props.showHelpers}
          setAngle={props.setAngle}
          freeze={props.freeze}
          getSeasonAndDate={getSeasonAndDate}
        />
        {props.showHelpers && (
          <Text
            ref={textRef}
            position={[0, EARTH_SIZE + .5, 0.2]} // Position the text above the Earth
            rotation={[0, -Math.PI / 2, 0]} // Rotate the text to lie in the X-Y plane
            fontSize={0.2} // Adjust the font size as needed
            color="#ffffff" // Text color
            anchorX="right" // Anchor the text horizontally to the center
            anchorY="middle" // Anchor the text vertically to the middle
          > </Text>
        )}
        {/* <OrbitControls /> */}
      </group>
    </>
  );
}

const ControlPanel = ({ showHelpers, setShowHelpers, freeze, setFreeze }: any) => {
  return (
    <div style={{ position: 'absolute', top: 0, left: 0, padding: 10 }}>
      <div>
        <label>
          <input
            type="checkbox"
            checked={showHelpers}
            onChange={() => setShowHelpers(!showHelpers)}
          />
          Show Helpers
        </label>
      </div>
      <div>
        <label>
          <input
            type="checkbox"
            checked={freeze}
            onChange={() => setFreeze(!freeze)}
          />
          Freeze
        </label>
      </div>
    </div>
  );
};

const Main = (props: MainProps) => {
  const [showHelpers, setShowHelpers] = useState(false);
  const [freeze, setFreeze] = useState(true);
  const [angle, setAngle] = useState(null);

  return (
    <Container>
      <Sky />
      <Canvas camera={{ far: 10000 }}>
        {/* <Suspense fallback={null}> */}
        <MainCanvas
          {...props}
          showHelpers={showHelpers}
          setAngle={setAngle}
          freeze={freeze}
        />;
        {/* </Suspense> */}
      </Canvas>
      {angle !== null && <SeasonOverlay angle={angle} />}

      <ControlPanel
        showHelpers={showHelpers}
        setShowHelpers={setShowHelpers}
        freeze={freeze}
        setFreeze={setFreeze}
      />
    </Container>
  );
};

export default Main;
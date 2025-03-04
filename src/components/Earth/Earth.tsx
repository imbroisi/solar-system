import { Mesh, TextureLoader } from 'three';
import { useLoader, useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import earthTexture from './images/texture.webp';
import cloudsTexture from './images/clouds.webp';
import bumpTexture from './images/bump.webp';
import specularTexture from './images/specular.webp';

export interface EarthProps {
  setInclination: (inclination: number) => void;
}

const EARTH_ROTATION_SPEED = 0.02;

const Earth = ({ showHelpers, setInclination, setAngle, freeze, getSeasonAndDate }: any) => {
  const earthMap = useLoader(TextureLoader, earthTexture);
  const cloudsMap = useLoader(TextureLoader, cloudsTexture);
  const bumpMap = useLoader(TextureLoader, bumpTexture);
  const specularMap = useLoader(TextureLoader, specularTexture);
  const earthRef = useRef<Mesh>(null);
  const cloudsRef = useRef<Mesh>(null);
  const equatorRef = useRef<Mesh>(null);
  const oscillationSpeed = 0.1; // Speed of oscillation
  const maxInclination = 23.5 * (Math.PI / 180); // Convert degrees to radians
  const time = useRef(0);

  const poleGeometry = useMemo(() => (
    <cylinderGeometry args={[0.02, 0.02, 0.4, 32]} />
  ), []);

  const poleMaterial = useMemo(() => (
    <meshStandardMaterial color="#b0b0b0" />
  ), []);

  const equatorGeometry = useMemo(() => (
    <torusGeometry args={[1.01, 0.01, 16, 100]} />
  ), []);

  const equatorMaterial = useMemo(() => (
    <meshStandardMaterial color="#ffffff" />
  ), []);

  useFrame(({ clock }, delta) => {
    const inclination = maxInclination * Math.sin(oscillationSpeed * time.current);
    // const time = clock.getElapsedTime();


    // const inclination = maxInclination * Math.sin(oscillationSpeed * time.current);


    setInclination(inclination * (180 / Math.PI)); // Convert radians to degrees
    if (earthRef.current) {
      earthRef.current.rotation.x = inclination; // Oscillate in the X-axis
      earthRef.current.rotation.y += EARTH_ROTATION_SPEED; // Adjust the rotation speed as needed
    }
    if (cloudsRef.current) {
      cloudsRef.current.rotation.x = inclination; // Oscillate in the X-axis
      cloudsRef.current.rotation.y += EARTH_ROTATION_SPEED; // Adjust the rotation speed as needed
    }
    // if (equatorRef.current) {
    //   equatorRef.current.rotation.x = inclination; // Oscillate in the X-axis
    //   equatorRef.current.rotation.y += 0.01; // Adjust the rotation speed as needed
    // }

    if (earthRef.current) {
      const newAngle = -(time.current * oscillationSpeed + Math.PI / 2);
      setAngle(newAngle);

      const { month, day } = getSeasonAndDate(newAngle);
      
      if (
        freeze && (
        (month === 'March' && day === 22) ||
        (month === 'June' && day === 21) ||
        (month === 'September' && day === 23) ||
        (month === 'December' && day === 21)
      )) {
        return;
      }
    }


    time.current += oscillationSpeed;

  });

  return (
    <>
      <mesh ref={earthRef} rotation={[0, 0, 0]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial
          map={earthMap}
          bumpMap={bumpMap}
          bumpScale={0.05}
          metalnessMap={specularMap}
        />
        {/* North Pole Pin */}
        {showHelpers && (
          <mesh position={[0, 1.05, 0]}>
            {poleGeometry}
            {poleMaterial}
          </mesh>
        )}

        {/* South Pole Pin */}
        {showHelpers && (
          <mesh position={[0, -1.05, 0]}>
            {poleGeometry}
            {poleMaterial}
          </mesh>
        )}

        {/* Equator Line */}
        {showHelpers && (
          <mesh ref={equatorRef} rotation={[(Math.PI / 2), 0, 0]}> {/* No rotation needed for the equator line */}
          {equatorGeometry}
          {equatorMaterial}
        </mesh>
        )}
      </mesh>

      <mesh ref={cloudsRef} rotation={[0, 0, 0]}>
        <sphereGeometry args={[1.01, 32, 32]} /> {/* Slightly larger than the Earth sphere */}
        <meshStandardMaterial map={cloudsMap} transparent={true} opacity={0.8} />
      </mesh>
    </>
  );
};

export default Earth;
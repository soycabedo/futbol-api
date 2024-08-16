// src/TestZone.jsx
import React from 'react';
import { useSpring, animated } from '@react-spring/web';

function TestZone() {
  const teams = [
    { id: 1, name: 'Team A', logo: 'https://via.placeholder.com/100' },
    { id: 2, name: 'Team B', logo: 'https://via.placeholder.com/100' },
    { id: 3, name: 'Team C', logo: 'https://via.placeholder.com/100' },
  ];

  return (
    <div style={{ display: 'flex', justifyContent: 'space-around', padding: '50px' }}>
      {teams.map((team) => (
        <AnimatedTeamLogo key={team.id} logoSrc={team.logo} teamName={team.name} />
      ))}
    </div>
  );
}

function AnimatedTeamLogo({ logoSrc, teamName }) {
  const styles = useSpring({
    from: { opacity: 0, transform: 'scale(0.5)' },
    to: { opacity: 1, transform: 'scale(1)' },
    config: { tension: 180, friction: 12 },
  });

  return (
    <animated.div style={styles}>
      <img src={logoSrc} alt={`${teamName} logo`} style={{ width: '100px', height: '100px' }} />
      <p>{teamName}</p>
    </animated.div>
  );
}

export default TestZone;


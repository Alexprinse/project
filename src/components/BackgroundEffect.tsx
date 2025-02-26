import React from 'react';
import './BackgroundEffect.css'; // Import the CSS file

const BackgroundEffect: React.FC = () => {
  return (
    <div className="background-effect">
      <div className="grid-pattern"></div>
      <div className="blue-blur"></div>
    </div>
  );
};

export default BackgroundEffect;
import React from 'react';
import Svg, { Circle, Path, Ellipse } from 'react-native-svg';

// Simple, calming illustration for mental health theme
const MentalHealthIllustration = ({ style }: { style?: any }) => (
  <Svg width={120} height={100} viewBox="0 0 120 100" fill="none" style={style}>
    <Ellipse cx="60" cy="85" rx="45" ry="12" fill="#F3E9F9" />
    <Circle cx="60" cy="45" r="35" fill="#B67BD7" opacity="0.15" />
    <Circle cx="60" cy="45" r="28" fill="#B67BD7" />
    <Path d="M60 30 Q70 45 60 60 Q50 45 60 30 Z" fill="#fff" opacity="0.9" />
    <Circle cx="60" cy="45" r="8" fill="#fff" />
    <Path d="M60 53 Q62 55 64 53" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
    <Path d="M56 43 Q58 41 60 43 Q62 41 64 43" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
  </Svg>
);

export default MentalHealthIllustration;

import React from 'react';
import Svg, { Path, Circle, G } from 'react-native-svg';

import { SvgProps } from 'react-native-svg';

const OnboardingIllustration = (props: SvgProps) => (
  <Svg width={280} height={280} viewBox="0 0 280 280" {...props}>
    <G transform="translate(20, 20)">
      {/* Person Figure */}
      <Path
        d="M120 160 Q120 130, 140 120 L160 130 Q180 140, 160 180 L140 190 Z"
        fill="#A78BFA" // Light purple
      />
      <Circle cx={140} cy={90} r={30} fill="#C4B5FD" /> // Head

      {/* Abstract Shapes */}
      <Circle cx={60} cy={70} r={25} fill="#FBBF24" opacity={0.7} />
      <Circle cx={200} cy={150} r={35} fill="#818CF8" opacity={0.6} />
      <Path
        d="M50 180 Q80 150, 110 180 T170 180"
        stroke="#60A5FA"
        strokeWidth={8}
        fill="none"
        strokeLinecap="round"
      />
      <Path
        d="M190 60 Q220 90, 190 120"
        stroke="#F472B6"
        strokeWidth={6}
        fill="none"
        strokeLinecap="round"
      />
    </G>
  </Svg>
);

export default OnboardingIllustration;


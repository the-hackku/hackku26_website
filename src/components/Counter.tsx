import { motion, useSpring, useTransform } from 'motion/react';
import { useEffect } from 'react';

import './Counter.css';

function Number({ mv, number, height }) {
  let y = useTransform(mv, latest => {
    let placeValue = latest % 10;
    let offset = (10 + number - placeValue) % 10;
    let memo = offset * height;
    if (offset > 5) {
      memo -= 10 * height;
    }
    return memo;
  });
  return (
    <motion.span className="counter-number" style={{ y }}>
      {number}
    </motion.span>
  );
}

function Digit({ place, value, height, digitStyle }) {
  let valueRoundedToPlace = Math.floor(value / place);
  let animatedValue = useSpring(valueRoundedToPlace);
  useEffect(() => {
    animatedValue.set(valueRoundedToPlace);
  }, [animatedValue, valueRoundedToPlace]);
  return (
    <div className="counter-digit" style={{ height, ...digitStyle }}>
      {Array.from({ length: 10 }, (_, i) => (
        <Number key={i} mv={animatedValue} number={i} height={height} />
      ))}
    </div>
  );
}

export default function Counter({
  value,
  fontSize = 50,
  places = [100, 10, 1],
  gap = 4,
  borderRadius = 4,
  horizontalPadding = 15,
  textColor = 'inherit',
  fontWeight = 'normal',
  containerStyle,
  counterStyle,
  digitStyle,
  gradientHeight = 5,
  gradientFrom = 'var(--bg)',
  gradientTo = 'transparent',
  followUp = "",
  topGradientStyle,
  bottomGradientStyle
}) {
  const height = 2 * fontSize;
  const defaultCounterStyle = {
    fontSize: 'inherit',
    gap: gap,
    borderRadius: borderRadius,
    paddingLeft: horizontalPadding,
    paddingRight: horizontalPadding,
    color: textColor,
    fontWeight: fontWeight,
  };
  const defaultTopGradientStyle = {
    height: gradientHeight,
    background: `linear-gradient(to bottom, ${gradientFrom}, ${gradientTo})`
  };
  const defaultBottomGradientStyle = {
    height: gradientHeight,
    background: `linear-gradient(to top, ${gradientFrom}, ${gradientTo})`
  };
  return (
    <div className="counter-container" style={containerStyle}>
      <div className="counter-counter" style={{ ...defaultCounterStyle, ...counterStyle }}>
        {places.map(place => (
          <Digit key={place} place={place} value={value} height={height} digitStyle={digitStyle} />
        ))}
        {followUp !== "" && followUp}
      </div>
      <div className="gradient-container">
        <div className="top-gradient" style={topGradientStyle ? topGradientStyle : defaultTopGradientStyle}></div>
        <div
          className="bottom-gradient"
          style={bottomGradientStyle ? bottomGradientStyle : defaultBottomGradientStyle}
        ></div>
      </div>
    </div>
  );
}


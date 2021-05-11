import PropTypes from 'prop-types';
import React from 'react';

function getFeatures(size, sides, centralAngle) {
  if (sides % 2) {
    // odd number of sides
    const circumradius =
      size / Math.sin(((sides - 1) / (sides * 2)) * Math.PI) / 2;
    const inradius = Math.cos(centralAngle / 2) * circumradius;
    const a = circumradius ** 2 * 2;
    return {
      sideLength: Math.sqrt(a - a * Math.cos(centralAngle)),
      height: inradius + circumradius
    };
  }

  const radius = size / 2;
  const isHalfOdd = (sides / 2) % 2;
  const ratio = isHalfOdd ? Math.sin : Math.tan;
  return {
    sideLength: radius * (ratio(centralAngle / 2) * 2),
    height: (isHalfOdd ? Math.cos(centralAngle / 2) * radius : radius) * 2
  };
}

function Spiral({size, sides, spacing, segments}) {
  const centralAngle = (Math.PI * 2) / sides;
  const {sideLength, height} = getFeatures(size, sides, centralAngle);
  const interiorAngle = Math.PI - centralAngle;
  const inset = Math.cos(interiorAngle) * spacing * 2;
  const spacingRatio = spacing / size;
  return (
    <div
      style={{
        overflow: 'hidden',
        padding: '0.5em'
      }}
    >
      <div
        style={{
          width: size,
          height: size,
          paddingTop: (size - height) / 2,
          paddingLeft: (size - sideLength) / 2
        }}
      >
        {segments
          .slice()
          .reverse()
          .reduce((child, value, index, array) => {
            const side = array.length - index;
            const [a, b, c] = Array.from({length: 3}, (value, index) =>
              Math.max(Math.floor((side - index) / sides), 0)
            );
            const innerWidth = sideLength - (a + c) * spacing - inset * b;

            if (innerWidth < spacing) {
              return null;
            }

            return (
              <div
                style={{
                  display: 'flex',
                  transformOrigin: 'left',
                  transform:
                    side > 1
                      ? `rotate(${centralAngle * (180 / Math.PI)}deg)`
                      : 'translateY(-50%)'
                }}
              >
                <span
                  style={{
                    flexShrink: 0,
                    display: 'flex',
                    whiteSpace: 'pre',
                    justifyContent: 'space-evenly',
                    width: innerWidth,
                    padding: `0 ${(innerWidth * spacingRatio) / 2}px`
                  }}
                >
                  {value.split('').map((char, index) => (
                    <span key={index}>{char}</span>
                  ))}
                </span>
                {child}
              </div>
            );
          }, null)}
      </div>
    </div>
  );
}

Spiral.propTypes = {
  sides: PropTypes.number.isRequired,
  size: PropTypes.number.isRequired,
  spacing: PropTypes.number.isRequired,
  segments: PropTypes.arrayOf(PropTypes.node).isRequired
};

import PropTypes from 'prop-types';
import React from 'react';

function Spiral({size, sides, spacing, segments}) {
  const centralAngle = (Math.PI * 2) / sides;
  const circumradius = size / 2;
  const sideLength = circumradius * Math.sin(centralAngle / 2) * 2;
  const inset = Math.cos(Math.PI - centralAngle) * spacing * 2;
  const inradius = Math.cos(centralAngle / 2) * circumradius;
  const height = sides % 2 ? inradius + circumradius : inradius * 2;
  const spacingRatio = spacing / size;
  return (
    <div
      style={{
        width: size,
        height: size,
        padding: `${(size - height) / 2}px ${(size - sideLength) / 2}px`,
        overflow: 'hidden'
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
  );
}

Spiral.propTypes = {
  sides: PropTypes.number.isRequired,
  size: PropTypes.number.isRequired,
  spacing: PropTypes.number.isRequired,
  segments: PropTypes.arrayOf(PropTypes.node).isRequired
};

import PropTypes from 'prop-types';
import React from 'react';

function Spiral({sides, width, spacing, segments}) {
  const centralAngle = (Math.PI * 2) / sides;
  const interiorAngle = Math.PI - centralAngle;
  const inset = Math.cos(interiorAngle) * spacing * 2;
  const sideLength = (width / 2) * Math.sin(centralAngle / 2) * 2;
  return (
    <div
      style={{
        width,
        height: width,
        padding: `0 ${(width - sideLength) / 2}px`,
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
                  side > 1 && `rotate(${centralAngle * (180 / Math.PI)}deg)`
              }}
            >
              <span
                style={{
                  flexShrink: 0,
                  display: 'flex',
                  whiteSpace: 'pre',
                  justifyContent: 'space-evenly',
                  width: innerWidth,
                  padding: `0 ${(innerWidth * (spacing / width)) / 2}px`,
                  backgroundColor: 'paleturquoise'
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
  width: PropTypes.number.isRequired,
  spacing: PropTypes.number.isRequired,
  segments: PropTypes.arrayOf(PropTypes.node).isRequired
};

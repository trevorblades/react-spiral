import PropTypes from 'prop-types';
import React from 'react';

function Spiral({sides, width, spacing, segments}) {
  const sumAngles = (sides - 2) * 180;
  const eachAngle = sumAngles / sides;
  const inset = Math.cos(eachAngle * (Math.PI / 180)) * spacing * 2;
  return (
    <div
      style={{
        width,
        height: width
      }}
    >
      {segments
        .slice()
        .reverse()
        .reduce((child, value, index, array) => {
          const offset = array.length - index;

          const ahead = Math.floor(offset / sides);
          const middle = Math.max(Math.floor((offset - 1) / sides), 0);
          const behind = Math.max(Math.floor((offset - 2) / sides), 0);
          const combined = ahead + behind;

          const innerWidth = width - combined * spacing - inset * middle;
          if (innerWidth < spacing) {
            return null;
          }

          return (
            <div
              style={{
                display: 'flex',
                transformOrigin: 'left',
                transform: offset > 1 && `rotate(${180 - eachAngle}deg)`
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

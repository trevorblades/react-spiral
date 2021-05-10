import PropTypes from 'prop-types';
import React from 'react';

function getSideLength(width, sides) {
  const centralAngle = (Math.PI * 2) / sides;
  if (sides % 2) {
    // odd number of sides
    const circumradius =
      width / Math.sin(((sides - 1) / (sides * 2)) * Math.PI) / 2;
    const b2 = circumradius ** 2 * 2;
    return Math.sqrt(b2 - b2 * Math.cos(centralAngle));
  }

  // use different ratio depending if N/2 is odd or even
  const ratio = (sides / 2) % 2 ? Math.sin : Math.tan;
  return (width / 2) * (ratio(centralAngle / 2) * 2);
}

function Spiral({sides, width, spacing, segments}) {
  // shoutout
  // https://www.mathsisfun.com/geometry/interior-angles-polygons.html
  // https://educationisaround.com/sohcahtoa/
  // right triangle with two equal sides: http://www.math.com/school/subject3/lessons/S3U3L4DP.html#:~:text=A%20right%20triangle%20can%20also,that%20is%20an%20isosceles%20triangle.
  // bounding box of ngon: http://calcresource.com/geom-ngon.html
  const sumAngles = (sides - 2) * 180;
  const eachAngle = sumAngles / sides;
  const inset = Math.cos(eachAngle * (Math.PI / 180)) * spacing * 2;

  const sideLength = getSideLength(width, sides);
  console.log(sideLength);
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
          const offset = array.length - index;

          const ahead = Math.floor(offset / sides);
          const middle = Math.max(Math.floor((offset - 1) / sides), 0);
          const behind = Math.max(Math.floor((offset - 2) / sides), 0);
          const combined = ahead + behind;

          const innerWidth = sideLength - combined * spacing - inset * middle;
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

import React from 'react';

interface Measurements {
  height: number;
  sideLength: number;
}

function measure(
  size: number,
  sides: number,
  centralAngle: number
): Measurements {
  if (sides % 2) {
    // odd number of sides
    const circumradius =
      size / Math.sin(((sides - 1) / (sides * 2)) * Math.PI) / 2;
    const inradius = Math.cos(centralAngle / 2) * circumradius;
    const a = circumradius ** 2 * 2;
    return {
      height: inradius + circumradius,
      sideLength: Math.sqrt(a - a * Math.cos(centralAngle))
    };
  }

  const radius = size / 2;
  const isHalfOdd = (sides / 2) % 2;
  const ratio = isHalfOdd ? Math.sin : Math.tan;
  return {
    height: (isHalfOdd ? Math.cos(centralAngle / 2) * radius : radius) * 2,
    sideLength: radius * (ratio(centralAngle / 2) * 2)
  };
}

interface SpiralProps {
  boxSize: number;
  fontSize: number;
  sides: number;
  spacing: number;
  segments: string[];
}

export const Spiral = (props: SpiralProps): JSX.Element => {
  const {boxSize, fontSize, sides, spacing, segments} = props;
  const centralAngle = (Math.PI * 2) / sides;
  const interiorAngle = Math.PI - centralAngle;
  const inset = Math.cos(interiorAngle) * spacing * 2;

  const totalSize = boxSize - fontSize;
  const {height, sideLength} = measure(totalSize, sides, centralAngle);
  const spacingRatio = spacing / totalSize;

  return (
    <div
      style={{
        overflow: 'hidden',
        lineHeight: 1,
        fontSize,
        padding: fontSize / 2
      }}
    >
      <div
        style={{
          width: totalSize,
          height: totalSize,
          paddingTop: (totalSize - height) / 2,
          paddingLeft: (totalSize - sideLength) / 2
        }}
      >
        {segments
          .slice()
          .reverse()
          .reduce((child: React.ReactNode, segment, index, array) => {
            const side = array.length - index;
            const [a, b, c] = Array.from({length: 3}, (segment, index) =>
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
                  {segment.split('').map((char: string, index: number) => (
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
};

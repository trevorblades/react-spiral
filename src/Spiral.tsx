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

function wordsFromText(text: string) {
  // replace all extra space and then split on spaces
  return text.trim().replace(/\s+/, ' ').split(' ');
}

interface Segment {
  side: number;
  width: number;
  padding: number;
  text: string;
}

interface SpiralProps {
  boxSize: number;
  fontSize: number;
  sides: number;
  spacing: number;
  text: string;
}

export const Spiral = (props: SpiralProps): JSX.Element => {
  const {boxSize, fontSize, sides, spacing, text} = props;
  const centralAngle = (Math.PI * 2) / sides;
  const interiorAngle = Math.PI - centralAngle;

  const totalSize = boxSize - fontSize;
  const {height, sideLength} = measure(totalSize, sides, centralAngle);

  const segments = [];
  const charWidth = fontSize / 1.5; // 0.5em - same as 1ch
  const spacingRatio = spacing / totalSize;
  const inset = Math.cos(interiorAngle) * spacing * 2;

  let spaceRemaining = sideLength - spacing;
  const words = wordsFromText(text);

  while (spaceRemaining > 0) {
    const side = segments.length + 1;

    // get 3 different numbers that are offset by the index
    const [a, b, c] = Array.from({length: 3}, (_, index) =>
      Math.max(Math.floor((side - index) / sides), 0)
    );

    // calculate final side length
    const outerWidth = sideLength - (a + c) * spacing - inset * b;
    const padding = (outerWidth * spacingRatio) / 2;
    const innerWidth = outerWidth - padding * 2;

    // shift the first word off the stack and put it back at the end
    let segment = words.shift();
    words.push(segment);

    // add 1 to account for space before next word
    let chars = innerWidth / charWidth - (segment.length + 1);
    if (chars < 0) {
      break;
    }

    while (chars > 0) {
      if (words[0].length > chars) {
        break;
      }

      // shift and put back on end
      const word = words.shift();
      words.push(word);

      // update the segment and char count for that side
      segment += ' ' + word;
      chars -= word.length + 1;
    }

    segments.unshift({
      side,
      segment,
      outerWidth,
      padding
    });
    spaceRemaining = outerWidth - spacing;
  }

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
        {segments.reduce((child: React.ReactNode, segment: Segment) => {
          const {side, width, padding, text} = segment;
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
                  width,
                  padding: `0 ${padding}px`
                }}
              >
                {text.split('').map((char: string, index: number) => (
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

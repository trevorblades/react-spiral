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

interface Segment {
  side: number;
  width: number;
  text: string;
}

interface SpiralProps {
  boxSize: number;
  fontSize: number;
  sides: number;
  spacing: number;
  children: string;
}

export function Spiral(props: SpiralProps): JSX.Element {
  const {boxSize, fontSize, sides, spacing, children} = props;
  const centralAngle = (Math.PI * 2) / sides;
  const interiorAngle = Math.PI - centralAngle;

  const totalSize = boxSize - fontSize;
  const {height, sideLength} = measure(totalSize, sides, centralAngle);

  const charWidth = fontSize / 1.5; // 0.5em - same as 1ch
  const basePadding = charWidth / 2; // base padding is half a character width

  // we give progressively less padding to polygons with more than 4 sides
  const paddingModifier = 4 / sides;
  const padding = basePadding * paddingModifier;

  // the distance needed to space out parallel lines appropriately
  // this is the hypoteneuse of a triangle with an opposite side of `spacing`
  const inset = spacing / Math.sin(interiorAngle);

  // the amount needed to add or subtract from the outside of the shape
  const multiplier = interiorAngle < centralAngle ? 2 : -2;
  const outset = Math.sqrt(inset ** 2 - spacing ** 2) * multiplier;

  const segments: Segment[] = [];

  // replace all extra space and then split on spaces
  const words = children
    .trim()
    .replace(/\s+/, ' ')
    .split(' ')
    .map(text => ({
      text,
      isOriginal: true // mark as original
    }));

  let spaceRemaining = sideLength - spacing;
  while (spaceRemaining > 0) {
    const side = segments.length + 1;

    // numbers needed to calculate the amount of insets and offsets required
    // i = n / s + (n - 2) / s = a + c
    // o = (n - 1) / s = b
    const [a, b, c] = Array.from({length: 3}, (_, index) =>
      Math.max(Math.floor((side - index) / sides), 0)
    );

    const totalInset = inset * (a + c);
    const totalOutset = outset * b;
    const outerWidth = sideLength - totalInset - totalOutset;

    // account for padding on either side of the segment
    const innerWidth = outerWidth - padding * 2;

    // calculate the number of characters that can fit in the segment
    let chars = Math.floor(innerWidth / charWidth);
    if (chars <= 0) {
      break;
    }

    // fill the segment with text until all characters have been accounted for
    let segment = '';
    while (chars > 0) {
      // grab the first word
      const word = words.shift();

      // return it to the end of the stack if it's part of the original set
      if (word.isOriginal) {
        words.push(word);
      }

      // if there isn't enough space for the full word
      if (word.text.length > chars) {
        // grab the part of it that will fit
        const sub = word.text.slice(0, chars);
        // and put the rest of it back into the front of the stack
        words.unshift({
          text: word.text.slice(chars),
          isOriginal: false // mark as unoriginal
        });
        segment += sub;
        chars -= sub.length;
      } else {
        // otherwise add the word to the segment
        segment += word.text;
        chars -= word.text.length;
        if (chars > 1) {
          // add a space if there's room
          segment += ' ';
          chars -= 1;
        } else if (chars) {
          // otherwise bail out and complete the segment
          break;
        }
      }
    }

    segments.unshift({
      side,
      text: segment,
      width: outerWidth
    });

    // FIXME: redundant with the break if chars <= 0
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
        {segments.reduce((child: React.ReactNode, segment) => {
          const {side, width, text} = segment;
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
}

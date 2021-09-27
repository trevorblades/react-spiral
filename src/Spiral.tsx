import React, {useMemo} from 'react';

interface Measurements {
  height: number;
  sideLength: number;
}

export function measureShape(
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

export function calcInOutset(
  spacing: number,
  centralAngle: number
): [number, number] {
  const interiorAngle = Math.PI - centralAngle;

  // the distance needed to space out parallel lines appropriately
  // this is the hypoteneuse of a triangle with an opposite side of `spacing`
  const inset = spacing / Math.sin(interiorAngle);

  // the amount needed to add or subtract from the outside of the shape
  let outset = Math.sqrt(inset ** 2 - spacing ** 2);
  if (interiorAngle > centralAngle) {
    // triangles subtract outsets, polygons with > 4 sides add outsets
    outset *= -1;
  }

  return [inset, outset];
}

export function getNumInOutsets(
  side: number,
  numSides: number
): [number, number] {
  // key values needed to calculate the amount of insets and offsets required
  const [a, b, c] = Array.from({length: 3}, (_, index) =>
    Math.floor(Math.max(side - index, 0) / numSides)
  );

  const numInsets = a + c;
  const numOutsets = 2 * b;
  return [numInsets, numOutsets];
}

interface Segment {
  side: number;
  width: number;
  text: string;
}

interface SpiralProps {
  size: number;
  fontSize: number;
  sides: number;
  spacing: number;
  children: string;
}

export function Spiral(props: SpiralProps): JSX.Element {
  const {size, fontSize, sides, spacing, children} = props;
  const centralAngle = useMemo(() => (Math.PI * 2) / sides, [sides]);

  const totalSize = useMemo(() => size - fontSize, [size, fontSize]);
  const {height, sideLength} = useMemo(
    () => measureShape(totalSize, sides, centralAngle),
    [totalSize, sides, centralAngle]
  );

  const [inset, outset] = useMemo(() => calcInOutset(spacing, centralAngle), [
    spacing,
    centralAngle
  ]);

  const [charWidth, basePadding] = useMemo(() => {
    const charWidth = fontSize / 1.5;
    return [
      charWidth, // 0.5em - same as 1ch
      charWidth / 2 // base padding is half a character width
    ];
  }, [fontSize]);

  const padding = useMemo(() => {
    // we give progressively less padding to polygons with more than 4 sides
    const paddingModifier = 4 / sides;
    return basePadding * paddingModifier;
  }, [basePadding, sides]);

  // replace all extra space and then split on spaces
  const words = useMemo(
    () =>
      children
        .trim() // trim leading/trailing space
        .replace(/\s+/, ' ') // turn one or more consecutive spaces into one space
        .split(' ') // split into array of words
        .map(text => ({
          text,
          isFullWord: true // mark as full word
        })),
    [children]
  );

  const segments = useMemo(() => {
    const segments: Segment[] = [];
    while (sideLength > inset) {
      const side = segments.length + 1;

      const [numInsets, numOutsets] = getNumInOutsets(side, sides);
      const outerWidth = sideLength - inset * numInsets - outset * numOutsets;

      if (outerWidth < inset) {
        break;
      }

      // account for padding on either side of the segment
      const innerWidth = outerWidth - padding * 2;

      // calculate the number of characters that can fit in the segment
      let numChars = Math.floor(innerWidth / charWidth);
      if (numChars <= 0) {
        break;
      }

      // fill the segment with text until all characters have been accounted for
      let text = '';
      while (numChars > 0) {
        // grab the first word
        const word = words.shift();

        // return it to the end of the stack if it's a full word
        if (word.isFullWord) {
          words.push(word);
        }

        // if there isn't enough space for the full word
        if (word.text.length > numChars) {
          // grab the part of it that will fit
          const fragment = word.text.slice(0, numChars);
          // and put the rest of it back into the front of the stack
          words.unshift({
            text: word.text.slice(numChars),
            isFullWord: false // not a full word
          });
          text += fragment;
          numChars -= fragment.length;
        } else {
          // otherwise add the word to the segment
          text += word.text;
          numChars -= word.text.length;
          if (numChars > 1) {
            // add a space if there's room
            text += ' ';
            numChars -= 1;
          } else if (numChars) {
            // otherwise bail out and complete the segment
            break;
          }
        }
      }

      segments.unshift({
        side,
        text,
        width: outerWidth
      });
    }
    return segments;
  }, [sideLength, charWidth, inset, outset, padding, sides, words]);

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
                  side > 1 ? `rotate(${centralAngle}rad)` : 'translateY(-50%)'
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

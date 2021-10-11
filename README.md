# react-spiral

This React component renders a spiral of text. You choose the shape and the size of the spiral, and the component takes care of the rest.

## Installation

```bash
npm i react-spiral
```

## Usage

```jsx
import Spiral from 'react-spiral';

function MyComponent() {
  return (
    <Spiral
      sides={3}
      text="i'm a spiral"
      boxSize={500}
      fontSize={30}
      spacing={20}
    />
  );
}
```

## Configuration

All of the following props are required to properly render a spiral:

| Name | Type | Description |
| - | - | - |
| sides | number | The number of sides that the shape has. A triangle has 3 sides, a square has 4, a pentagon has 5, and so on. |
| text | string | The text to be rendered in the spiral. The text will continue to repeat itself until there's no room left. |
| boxSize | number | The size, in pixels, of the square that the spiral will be rendered within |
| fontSize | number | The size of the font, in pixels |
| spacing | number | The amount of space, in pixels, between parallel lines in the spiral |

## Further reading

If you're interested to learn how this component works, I wrote [a blog post](https://trevorblades.com/lab/spiral-into-madness) explaining all of the techniques that were involved in its creation. I learned a ton about math and trigonometry in the process, and I hope I can share some of my learnings in a digestible way. There's also a few interactive demos in there that are pretty fun to play with. 😊

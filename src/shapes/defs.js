/**
 * Shape library — all shapes live in a nominal 100×100 (or custom) box,
 * then get scaleX/scaleY applied so drag-resizing is stretchy like
 * Google Slides. strokeUniform keeps strokes constant while scaling.
 */
import * as fabric from 'fabric';

function regPoly(n, { rOut = 46, rIn = null, cx = 50, cy = 50, rot = -90 } = {}) {
  const pts = [];
  for (let i = 0; i < n; i++) {
    const r = rIn && i % 2 === 1 ? rIn : rOut;
    const a = ((rot + (360 / n) * i) * Math.PI) / 180;
    pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
  }
  return pts;
}

function polyPath(pts) {
  const p = pts.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(' ');
  return `M${p} Z`;
}

const FILL = '#7b46f8';

function pathObj(path, { w, h, fill = FILL, name }) {
  // Real fabric.Path instance (fill/stroke editable, stroke stays uniform
  // while scaling). Coordinates span the def's base box (usually 0..100).
  const p = new fabric.Path(path, {
    fill,
    strokeWidth: 0,
    strokeUniform: true,
    objectCaching: false,
    name
  });
  return p;
}

export const SHAPE_DEFS = {
  rect: {
    name: 'Rectangle', icon: 'Square', key: 'rect', baseW: 100, baseH: 62,
    create() {
      return new fabric.Rect({ width: 100, height: 62, rx: 0, ry: 0, fill: FILL, strokeUniform: true });
    }
  },
  rounded: {
    name: 'Rounded rectangle', icon: 'Square', key: 'rounded', baseW: 100, baseH: 62,
    create() {
      return new fabric.Rect({ width: 100, height: 62, rx: 18, ry: 18, fill: FILL, strokeUniform: true });
    }
  },
  pill: {
    name: 'Pill', icon: 'Square', key: 'pill', baseW: 100, baseH: 40,
    create() {
      return new fabric.Rect({ width: 100, height: 40, rx: 20, ry: 20, fill: FILL, strokeUniform: true });
    }
  },
  ellipse: {
    name: 'Ellipse', icon: 'Circle', key: 'ellipse', baseW: 100, baseH: 100,
    create() {
      return new fabric.Ellipse({ rx: 50, ry: 50, fill: FILL, strokeUniform: true });
    }
  },
  triangle: {
    name: 'Triangle', icon: 'Triangle', key: 'triangle', baseW: 100, baseH: 100,
    create() {
      return pathObj(polyPath([[50, 4], [97, 96], [3, 96]]), { w: 100, h: 100 });
    }
  },
  rightTriangle: {
    name: 'Right triangle', icon: 'Triangle', key: 'rightTriangle', baseW: 100, baseH: 100,
    create() {
      return pathObj(polyPath([[4, 6], [96, 96], [4, 96]]), { w: 100, h: 100 });
    }
  },
  diamond: {
    name: 'Diamond', icon: 'Diamond', key: 'diamond', baseW: 100, baseH: 100,
    create() {
      return pathObj(polyPath(regPoly(4, { rot: -45 + 180 / 4 })), { w: 100, h: 100 });
    }
  },
  pentagon: {
    name: 'Pentagon', icon: 'Pentagon', key: 'pentagon', baseW: 100, baseH: 100,
    create() {
      return pathObj(polyPath(regPoly(5)), { w: 100, h: 100 });
    }
  },
  hexagon: {
    name: 'Hexagon', icon: 'Hexagon', key: 'hexagon', baseW: 100, baseH: 100,
    create() {
      return pathObj(polyPath(regPoly(6)), { w: 100, h: 100 });
    }
  },
  octagon: {
    name: 'Octagon', icon: 'Octagon', key: 'octagon', baseW: 100, baseH: 100,
    create() {
      return pathObj(polyPath(regPoly(8)), { w: 100, h: 100 });
    }
  },
  star: {
    name: 'Star', icon: 'Star', key: 'star', baseW: 100, baseH: 100,
    create() {
      const pts = regPoly(10, { rOut: 48, rIn: 21.5, rot: -90 });
      return pathObj(polyPath(pts), { w: 100, h: 100 });
    }
  },
  heart: {
    name: 'Heart', icon: 'Heart', key: 'heart', baseW: 100, baseH: 100,
    create() {
      const d = 'M50,88 C20,63 5,44 5,28 C5,11 18,4 30,4 C39,4 46,10 50,21 C54,10 61,4 70,4 C82,4 95,11 95,28 C95,44 80,63 50,88 Z';
      return pathObj(d, { w: 100, h: 100 });
    }
  },
  arrowRight: {
    name: 'Arrow right', icon: 'MoveRight', key: 'arrowRight', baseW: 100, baseH: 50,
    create() {
      const d = 'M0,20 L62,20 L62,4 L100,25 L62,46 L62,30 L0,30 Z';
      return pathObj(d, { w: 100, h: 50 });
    }
  },
  arrowUp: {
    name: 'Arrow up', icon: 'MoveUp', key: 'arrowUp', baseW: 50, baseH: 100,
    create() {
      const d = 'M25,0 L44,30 L31,30 L31,100 L19,100 L19,30 L6,30 Z';
      return pathObj(d, { w: 50, h: 100 });
    }
  },
  line: {
    name: 'Line', icon: 'Minus', key: 'line', baseW: 100, baseH: 4, isLine: true,
    create() {
      return new fabric.Line([0, 2, 100, 2], { stroke: FILL, strokeWidth: 4, strokeUniform: true, fill: '' });
    }
  },
  slash: {
    name: 'Diagonal line', icon: 'Slash', key: 'slash', baseW: 100, baseH: 100, isLine: true,
    create() {
      return new fabric.Line([0, 0, 100, 100], { stroke: FILL, strokeWidth: 4, strokeUniform: true, fill: '' });
    }
  }
};

export const SHAPE_LIST = Object.keys(SHAPE_DEFS);

export function createShape(type) {
  const def = SHAPE_DEFS[type] || SHAPE_DEFS.rect;
  const obj = def.create();
  obj.custom = obj.custom || {};
  obj.custom.baseW = def.baseW;
  obj.custom.baseH = def.baseH;
  obj.custom.shapeKey = def.key;
  obj.custom.shapeLabel = def.name;
  return obj;
}

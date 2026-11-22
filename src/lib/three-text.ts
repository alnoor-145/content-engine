import opentype from "opentype.js";
import { useEffect, useState } from "react";
import { cancelRender, continueRender, delayRender, staticFile } from "remotion";
import * as THREE from "three";

// Builds real extruded 3D letters from a font file (public/fonts/poppins-900.woff, OFL licensed):
// opentype.js turns the text into outline paths, we convert those into three.js shapes, ExtrudeGeometry adds depth.
// Latin text only: opentype.js does not do Bangla conjunct shaping (use ExtrudedText for Bangla).
let fontPromise: Promise<opentype.Font> | null = null;
const loadFont = () => {
  fontPromise ??= fetch(staticFile("fonts/poppins-900.woff"))
    .then((r) => r.arrayBuffer())
    .then((buf) => opentype.parse(buf));
  return fontPromise;
};

// Convert one glyph's opentype commands straight into three.js shapes.
const glyphShapes = (path: opentype.Path) => {
  const sp = new THREE.ShapePath();
  let open = false;
  let last = { x: 0, y: 0 };
  const ensure = () => {
    if (!open) {
      sp.moveTo(last.x, last.y);
      open = true;
    }
  };
  for (const c of path.commands) {
    if (c.type === "M") {
      sp.moveTo(c.x, c.y);
      open = true;
      last = { x: c.x, y: c.y };
    } else if (c.type === "L") {
      ensure();
      sp.lineTo(c.x, c.y);
      last = { x: c.x, y: c.y };
    } else if (c.type === "Q") {
      ensure();
      sp.quadraticCurveTo(c.x1, c.y1, c.x, c.y);
      last = { x: c.x, y: c.y };
    } else if (c.type === "C") {
      ensure();
      sp.bezierCurveTo(c.x1, c.y1, c.x2, c.y2, c.x, c.y);
      last = { x: c.x, y: c.y };
    } else if (c.type === "Z") {
      open = false;
    }
  }
  // three.js finds holes by point-in-polygon tests, so winding direction doesn't matter.
  return sp.subPaths.length ? sp.toShapes() : [];
};

const buildGeometry = (font: opentype.Font, text: string, depth: number) => {
  // One glyph at a time, so outer contours and holes (O, B, R…) are matched within each letter
  // and never against a neighbouring letter.
  // Lay words out ourselves so word gaps are clearly visible in 3D (the font's own space is too narrow at weight 900).
  const WORD_GAP = 55;
  let x = 0;
  const shapes = text
    .split(/\s+/)
    .filter(Boolean)
    .flatMap((word) => {
      const glyphs = font.getPaths(word, x, 0, 100).flatMap(glyphShapes);
      x += font.getAdvanceWidth(word, 100) + WORD_GAP;
      return glyphs;
    });
  const geo = new THREE.ExtrudeGeometry(shapes, { depth, bevelEnabled: true, bevelThickness: 4, bevelSize: 2.2, bevelSegments: 5, curveSegments: 10 });
  geo.center();
  geo.computeBoundingBox();
  return geo;
};

// Use OUTSIDE the <ThreeCanvas>: render the canvas only once this returns a geometry.
// The render is held (delayRender) until React has committed the geometry, so no frame is captured empty.
export const useTextGeometry = (text: string, depth = 28) => {
  const [geometry, setGeometry] = useState<THREE.ExtrudeGeometry | null>(null);
  const [handle] = useState(() => delayRender(`3D text: ${text}`));
  useEffect(() => {
    loadFont()
      .then((font) => setGeometry(buildGeometry(font, text, depth)))
      .catch((e) => cancelRender(e));
  }, [text, depth]);
  useEffect(() => {
    if (geometry) continueRender(handle);
  }, [geometry, handle]);
  return geometry;
};

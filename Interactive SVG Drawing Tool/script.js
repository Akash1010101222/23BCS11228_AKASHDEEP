// Interactive SVG Drawing Tool
// Supports Rectangle and Line drawing with mouse events (mousedown, mousemove, mouseup).
// Negative-drag handled (drawing up/left adjusts x/y and width/height).
// Multiple shapes allowed. Toolbar controls stroke/fill/width and shape type.

const svg = document.getElementById('svgCanvas');
const shapeSelect = document.getElementById('shape-select');
const strokeColorInput = document.getElementById('stroke-color');
const fillColorInput = document.getElementById('fill-color');
const strokeWidthInput = document.getElementById('stroke-width');
const clearBtn = document.getElementById('clear-btn');

let drawing = false;
let startX = 0, startY = 0;
let currentElem = null; // the SVG element being drawn

// Convert mouse event coordinates to SVG coordinates
function getSVGPoint(evt) {
  const pt = svg.createSVGPoint();
  pt.x = evt.clientX;
  pt.y = evt.clientY;
  // transform to SVG coordinate system
  return pt.matrixTransform(svg.getScreenCTM().inverse());
}

function onPointerDown(evt) {
  // only left button
  if (evt.button !== undefined && evt.button !== 0) return;
  evt.preventDefault();

  const p = getSVGPoint(evt);
  startX = p.x;
  startY = p.y;
  drawing = true;

  const shape = shapeSelect.value;
  const stroke = strokeColorInput.value;
  const fill = fillColorInput.value;
  const sw = parseFloat(strokeWidthInput.value) || 2;

  if (shape === 'rect') {
    const rect = document.createElementNS('http://www.w3.org/2000/svg','rect');
    rect.setAttribute('x', startX);
    rect.setAttribute('y', startY);
    rect.setAttribute('width', 0);
    rect.setAttribute('height', 0);
    rect.setAttribute('stroke', stroke);
    rect.setAttribute('stroke-width', sw);
    rect.setAttribute('fill', fill);
    rect.setAttribute('fill-opacity', 0.6);
    rect.setAttribute('class','drawn-rect');
    currentElem = rect;
    svg.appendChild(rect);
  } else if (shape === 'line') {
    const line = document.createElementNS('http://www.w3.org/2000/svg','line');
    line.setAttribute('x1', startX);
    line.setAttribute('y1', startY);
    line.setAttribute('x2', startX);
    line.setAttribute('y2', startY);
    line.setAttribute('stroke', stroke);
    line.setAttribute('stroke-width', sw);
    line.setAttribute('stroke-linecap', 'round');
    currentElem = line;
    svg.appendChild(line);
  }
}

function onPointerMove(evt) {
  if (!drawing || !currentElem) return;
  evt.preventDefault();
  const p = getSVGPoint(evt);
  const shape = shapeSelect.value;

  if (shape === 'rect' && currentElem.tagName === 'rect') {
    // calculate width/height allowing negative draws
    let x = Math.min(p.x, startX);
    let y = Math.min(p.y, startY);
    let w = Math.abs(p.x - startX);
    let h = Math.abs(p.y - startY);
    currentElem.setAttribute('x', x);
    currentElem.setAttribute('y', y);
    currentElem.setAttribute('width', w);
    currentElem.setAttribute('height', h);
  } else if (shape === 'line' && currentElem.tagName === 'line') {
    currentElem.setAttribute('x2', p.x);
    currentElem.setAttribute('y2', p.y);
  }
}

function onPointerUp(evt) {
  if (!drawing) return;
  drawing = false;
  // finalize - if tiny shapes (0 size) then remove
  if (currentElem) {
    if (currentElem.tagName === 'rect') {
      const w = parseFloat(currentElem.getAttribute('width')) || 0;
      const h = parseFloat(currentElem.getAttribute('height')) || 0;
      if (w < 1 || h < 1) svg.removeChild(currentElem);
    } else if (currentElem.tagName === 'line') {
      const x1 = parseFloat(currentElem.getAttribute('x1'));
      const y1 = parseFloat(currentElem.getAttribute('y1'));
      const x2 = parseFloat(currentElem.getAttribute('x2'));
      const y2 = parseFloat(currentElem.getAttribute('y2'));
      const dist = Math.hypot(x2 - x1, y2 - y1);
      if (dist < 2) svg.removeChild(currentElem);
    }
  }
  currentElem = null;
}

// Pointer events for mouse + touch (unified)
svg.addEventListener('pointerdown', onPointerDown);
window.addEventListener('pointermove', onPointerMove);
window.addEventListener('pointerup', onPointerUp);

// Clear button
clearBtn.addEventListener('click', () => {
  // Remove all children (you could preserve grid lines if you add some)
  while (svg.lastChild) svg.removeChild(svg.lastChild);
});

// Optional: allow escape to cancel current drawing
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && drawing) {
    drawing = false;
    if (currentElem && svg.contains(currentElem)) svg.removeChild(currentElem);
    currentElem = null;
  }
});

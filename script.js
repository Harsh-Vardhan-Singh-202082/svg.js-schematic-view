document.addEventListener('DOMContentLoaded', () => {
  // Create an SVG drawing area and add it to the svgContainer div
  const draw = SVG().addTo('#svgContainer').size(1000, 1000);
  // List to store all rectangles
  const rectangles = [];

  // Function to create a draggable rectangle
  function createRectangle(length, breadth) {
    // Create a rectangle with specified dimensions and random position
    const rect = draw.rect(length, breadth).attr({
      fill: 'cornflowerblue',
      stroke: 'blue',
      'stroke-width': 2,
      x: 50,
      y: 50,
    });

    // Add dragging functionality to the rectangle
    let isDragging = false;
    let startX, startY, rectX, rectY;

    rect.on('mousedown', (event) => {
      isDragging = true;
      startX = event.clientX;
      startY = event.clientY;
      const bbox = rect.bbox();
      rectX = bbox.x;
      rectY = bbox.y;
    });

    document.addEventListener('mousemove', (event) => {
      if (isDragging) {
        const dx = event.clientX - startX;
        const dy = event.clientY - startY;
        rect.move(rectX + dx, rectY + dy);
        checkCollisions(rect);
      }
    });

    document.addEventListener('mouseup', () => {
      isDragging = false;
    });

    // Add the rectangle to the list
    rectangles.push(rect);
  }

  // Function to check for collisions between rectangles
  function checkCollisions(draggedRect) {
    rectangles.forEach((rect) => {
      if (rect !== draggedRect) {
        if (isColliding(draggedRect, rect)) {
          rect.attr({ fill: 'red' });
          draggedRect.attr({ fill: 'red' });
        } else {
          rect.attr({ fill: 'cornflowerblue' });
          draggedRect.attr({ fill: 'cornflowerblue' });
        }
      }
    });
  }

  // Function to detect if two rectangles are colliding
  function isColliding(rect1, rect2) {
    const bbox1 = rect1.bbox();
    const bbox2 = rect2.bbox();

    return !(
      bbox1.x2 < bbox2.x ||
      bbox1.x > bbox2.x2 ||
      bbox1.y2 < bbox2.y ||
      bbox1.y > bbox2.y2
    );
  }

  // Event listener for the Generate button
  document.getElementById('generateBtn').addEventListener('click', () => {
    const length = parseInt(document.getElementById('length').value, 10);
    const breadth = parseInt(document.getElementById('breadth').value, 10);

    if (!isNaN(length) && !isNaN(breadth) && length > 0 && breadth > 0) {
      createRectangle(length, breadth);
    } else {
      alert('Please enter valid length and breadth values.');
    }
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const draw = SVG().addTo('#svgContainer').size(1000, 1000);
  const rectangles = []; // List of rectangles and their data
  const groups = []; // Groups of connected rectangles

  function createRectangle(length, breadth) {
    const rect = draw.rect(length, breadth).attr({
      fill: 'cornflowerblue',
      stroke: 'blue',
      'stroke-width': 1,
      x: 50,
      y: 50,
    });

    const midpoints = createMidpoints(rect);

    let isDragging = false;
    let startX, startY;

    rect.on('mousedown', (event) => {
      isDragging = true;
      startX = event.clientX;
      startY = event.clientY;
    });

    document.addEventListener('mousemove', (event) => {
      if (isDragging) {
        const dx = event.clientX - startX;
        const dy = event.clientY - startY;
        moveConnectedRectangles(rect, dx, dy); // Move connected rectangles
        startX = event.clientX;
        startY = event.clientY;
      }
    });

    document.addEventListener('mouseup', () => {
      isDragging = false;
    });

    rectangles.push({ rect, midpoints });
  }

  function createMidpoints(rect) {
    const bbox = rect.bbox();
    const points = [
      { x: bbox.x + bbox.width / 2, y: bbox.y }, // Top midpoint
      { x: bbox.x + bbox.width / 2, y: bbox.y + bbox.height }, // Bottom midpoint
      { x: bbox.x, y: bbox.y + bbox.height / 2 }, // Left midpoint
      { x: bbox.x + bbox.width, y: bbox.y + bbox.height / 2 }, // Right midpoint
    ];

    return points.map(point =>
      draw.circle(6).attr({ fill: 'green', cx: point.x, cy: point.y })
    );
  }

  function updateMidpoints(rect, midpoints) {
    const bbox = rect.bbox();
    const newPositions = [
      { x: bbox.x + bbox.width / 2, y: bbox.y },
      { x: bbox.x + bbox.width / 2, y: bbox.y + bbox.height },
      { x: bbox.x, y: bbox.y + bbox.height / 2 },
      { x: bbox.x + bbox.width, y: bbox.y + bbox.height / 2 },
    ];

    midpoints.forEach((circle, index) => {
      circle.attr({ cx: newPositions[index].x, cy: newPositions[index].y });
    });
  }

function highlightCloseMidpoints(draggedMidpoints) {
    rectangles.forEach(({ midpoints }) => {
      midpoints.forEach(circle => circle.attr({ fill: 'green' })); // Reset all to green
    });

    rectangles.forEach(({ rect, midpoints }) => {
      midpoints.forEach((circle1) => {
        draggedMidpoints.forEach((circle2) => {
          const dx = circle1.cx() - circle2.cx();
          const dy = circle1.cy() - circle2.cy();
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 5) { // Threshold for "close"
            circle1.attr({ fill: 'yellow' });
            circle2.attr({ fill: 'yellow' });
          }
        });
      });
    });
  }

  function connectRectangles() {
    rectangles.forEach(({ rect, midpoints }, index) => {
      midpoints.forEach((circle1) => {
        rectangles.forEach(({ rect: otherRect, midpoints: otherMidpoints }, otherIndex) => {
          if (rect !== otherRect) {
            otherMidpoints.forEach((circle2) => {
              const dx = circle1.cx() - circle2.cx();
              const dy = circle1.cy() - circle2.cy();
              const distance = Math.sqrt(dx * dx + dy * dy);

              if (distance < 5) { // Close enough to connect
                mergeGroups(index, otherIndex); // Merge the groups of the two rectangles
              }
            });
          }
        });
      });
    });
  }

  function mergeGroups(index1, index2) {
    const group1 = findGroup(index1);
    const group2 = findGroup(index2);

    if (group1 && group2) {
      if (group1 !== group2) {
        // Merge two groups
        group1.push(...group2);
        groups.splice(groups.indexOf(group2), 1); // Remove the second group
      }
    } else if (group1) {
      group1.push(index2); // Add rect2 to group1
    } else if (group2) {
      group2.push(index1); // Add rect1 to group2
    } else {
      groups.push([index1, index2]); // Create a new group
    }
  }

  function findGroup(index) {
    return groups.find(group => group.includes(index));
  }

  function moveConnectedRectangles(draggedRect, dx, dy) {
    const draggedIndex = rectangles.findIndex(({ rect }) => rect === draggedRect);
    const group = findGroup(draggedIndex);

    if (group) {
      group.forEach((rectIndex) => {
        const { rect, midpoints } = rectangles[rectIndex];
        rect.dmove(dx, dy); // Move each rectangle in the group
        updateMidpoints(rect, midpoints); // Update its midpoints
      });
    } else {
      // No group, move only the dragged rectangle
      const { rect, midpoints } = rectangles[draggedIndex];
      rect.dmove(dx, dy);
      updateMidpoints(rect, midpoints);
    }
  }

  // Function to check if two rectangles are colliding
function isRectColliding(rect1, rect2) {
  const bbox1 = rect1.bbox();
  const bbox2 = rect2.bbox();

  return !(
    bbox1.x2 < bbox2.x ||  // rect1 is left of rect2
    bbox1.x > bbox2.x2 ||  // rect1 is right of rect2
    bbox1.y2 < bbox2.y ||  // rect1 is above rect2
    bbox1.y > bbox2.y2     // rect1 is below rect2
  );
}

// Function to check for collisions between individual rectangles or groups
function isColliding() {
  const allGroups = groups.length > 0 ? groups : rectangles.map((_, i) => [i]); // Handle both grouped and ungrouped rectangles

  allGroups.forEach((group1) => {
    allGroups.forEach((group2) => {
      if (group1 !== group2) {
        group1.forEach((rectIndex1) => {
          group2.forEach((rectIndex2) => {
            const rect1 = rectangles[rectIndex1].rect;
            const rect2 = rectangles[rectIndex2].rect;

            if (isRectColliding(rect1, rect2)) {
              // Change colors to indicate collision
              rect1.attr({ fill: 'red' });
              rect2.attr({ fill: 'red' });

              // Update all rectangles in their respective groups
              group1.forEach((idx) => rectangles[idx].rect.attr({ fill: 'red' }));
              group2.forEach((idx) => rectangles[idx].rect.attr({ fill: 'red' }));
            }
          });
        });
      }
    });
  });
}


  document.getElementById('generateBtn').addEventListener('click', () => {
    const length = parseInt(document.getElementById('length').value, 10);
    const breadth = parseInt(document.getElementById('breadth').value, 10);

    if (!isNaN(length) && !isNaN(breadth) && length > 0 && breadth > 0) {
      createRectangle(length, breadth);
    } else {
      alert('Please enter valid length and breadth values.');
    }
  });

  document.addEventListener('mousedown', () => {
    connectRectangles();
  });
});


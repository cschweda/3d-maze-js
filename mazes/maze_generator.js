/**
 * Maze generation utility functions
 *
 * This module provides functions for generating mazes of different types
 */

// Generate a maze with a guaranteed path from start to exit
function generateMaze(width, height) {
  // Initialize maze with all walls
  const maze = Array(height)
    .fill()
    .map(() => Array(width).fill("#"));

  // Define start and exit points
  const startX = 1;
  const startY = 1;
  const exitX = width - 2;
  const exitY = height - 2;

  // Mark the start position
  maze[startY][startX] = " ";

  // Use a modified DFS algorithm with guaranteed path
  const visited = new Set();
  visited.add(`${startX},${startY}`);

  // First, ensure there's a path from start to exit
  ensurePathExists(maze, startX, startY, exitX, exitY, visited, width, height);

  // Then, fill in the rest of the maze with random paths
  fillRemainingMaze(maze, visited, width, height);

  // Set exit cell
  maze[exitY][exitX] = "E";

  return maze;
}

// Helper method to ensure a path exists from start to exit
function ensurePathExists(
  maze,
  startX,
  startY,
  exitX,
  exitY,
  visited,
  width,
  height
) {
  // If we've reached very close to the exit, make the final connection
  if (Math.abs(startX - exitX) <= 2 && Math.abs(startY - exitY) <= 2) {
    // Make a direct path to the exit
    const dx = exitX - startX;
    const dy = exitY - startY;

    // Carve a straight path
    if (dx !== 0) {
      // Horizontal connection
      const stepX = dx > 0 ? 1 : -1;
      for (let x = startX + stepX; x !== exitX + stepX; x += stepX) {
        maze[startY][x] = " ";
        visited.add(`${x},${startY}`);
      }
    }

    if (dy !== 0) {
      // Vertical connection
      const stepY = dy > 0 ? 1 : -1;
      for (let y = startY + stepY; y !== exitY + stepY; y += stepY) {
        maze[y][exitX] = " ";
        visited.add(`${exitX},${y}`);
      }
    }

    return true;
  }

  // Directions to try, prioritizing moving towards the exit
  const directions = [
    { dx: 0, dy: -2 }, // Up
    { dx: 2, dy: 0 }, // Right
    { dx: 0, dy: 2 }, // Down
    { dx: -2, dy: 0 }, // Left
  ];

  // Sort directions based on how much closer they get us to the exit
  directions.sort((a, b) => {
    const distA =
      Math.abs(startX + a.dx - exitX) + Math.abs(startY + a.dy - exitY);
    const distB =
      Math.abs(startX + b.dx - exitX) + Math.abs(startY + b.dy - exitY);
    return distA - distB;
  });

  for (const dir of directions) {
    const nx = startX + dir.dx;
    const ny = startY + dir.dy;

    // Skip if out of bounds or already visited
    if (!isValidCell(nx, ny, width, height) || visited.has(`${nx},${ny}`)) {
      continue;
    }

    // Carve the path
    maze[startY + dir.dy / 2][startX + dir.dx / 2] = " ";
    maze[ny][nx] = " ";
    visited.add(`${nx},${ny}`);

    // Recursively continue path finding
    if (ensurePathExists(maze, nx, ny, exitX, exitY, visited, width, height)) {
      return true;
    }
  }

  return false;
}

// Helper method to fill in the rest of the maze with random paths
function fillRemainingMaze(maze, visited, width, height) {
  // Standard DFS algorithm to fill in the rest of the maze
  const stack = Array.from(visited).map((coord) => {
    const [x, y] = coord.split(",").map(Number);
    return { x, y };
  });

  while (stack.length > 0) {
    const current = stack[stack.length - 1];

    // Check neighbors (up, right, down, left)
    const neighbors = [];
    const directions = [
      { dx: 0, dy: -2 }, // Up
      { dx: 2, dy: 0 }, // Right
      { dx: 0, dy: 2 }, // Down
      { dx: -2, dy: 0 }, // Left
    ];

    for (const dir of directions) {
      const nx = current.x + dir.dx;
      const ny = current.y + dir.dy;

      // Check if neighbor is valid and unvisited
      if (
        isValidCell(nx, ny, width, height) &&
        maze[ny][nx] === "#" &&
        !visited.has(`${nx},${ny}`)
      ) {
        neighbors.push({
          x: nx,
          y: ny,
          dx: dir.dx / 2,
          dy: dir.dy / 2,
        });
      }
    }

    if (neighbors.length > 0) {
      // Choose a random neighbor
      const next = neighbors[Math.floor(Math.random() * neighbors.length)];

      // Create path between current and next
      maze[current.y + next.dy][current.x + next.dx] = " ";
      maze[next.y][next.x] = " ";

      // Mark as visited
      visited.add(`${next.x},${next.y}`);

      // Push next cell to stack
      stack.push({ x: next.x, y: next.y });
    } else {
      // Dead end, backtrack
      stack.pop();
    }
  }
}

// Helper method to check if a cell position is valid within the maze
function isValidCell(x, y, width, height) {
  return x > 0 && x < width - 1 && y > 0 && y < height - 1;
}

module.exports = {
  generateMaze,
  ensurePathExists,
  fillRemainingMaze,
  isValidCell,
};

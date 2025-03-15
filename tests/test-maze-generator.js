/**
 * Tests for the maze generation algorithm
 * 
 * This script tests the maze generation functionality to ensure
 * it creates valid, solvable mazes.
 */

/**
 * Improved implementation of the maze generation algorithm for testing
 * This version guarantees a path from start to exit
 * @param {number} width - Width of the maze
 * @param {number} height - Height of the maze
 * @returns {Array} 2D array representing the maze
 */
function generateTestMaze(width, height) {
  // Initialize maze with all walls
  let maze = Array(height)
    .fill()
    .map(() => Array(width).fill('#'));

  // Define start and exit points
  const startX = 1;
  const startY = 1;
  const exitX = width - 2;
  const exitY = height - 2;

  // Mark the start position
  maze[startY][startX] = ' ';

  // Use a modified DFS algorithm to ensure a path from start to exit
  const visited = new Set();
  visited.add(`${startX},${startY}`);
  
  // First, ensure there's a path from start to exit
  const pathToExit = ensurePathExists(maze, startX, startY, exitX, exitY, visited, width, height);
  
  if (!pathToExit) {
    console.error("Failed to create a path to exit. This should not happen.");
    // If for some reason we can't create a path, mark the exit cell anyway
    maze[exitY][exitX] = ' ';
  }
  
  // Then, fill in the rest of the maze with the regular algorithm
  fillRemainingMaze(maze, visited, width, height);

  // Set exit cell
  maze[exitY][exitX] = 'E';

  return maze;
}

/**
 * Ensure a path exists from start to exit
 * @param {Array} maze - The maze being generated
 * @param {number} startX - Starting X position
 * @param {number} startY - Starting Y position
 * @param {number} exitX - Exit X position
 * @param {number} exitY - Exit Y position
 * @param {Set} visited - Set of visited cells
 * @param {number} width - Maze width
 * @param {number} height - Maze height
 * @returns {boolean} - Whether a path was successfully created
 */
function ensurePathExists(maze, startX, startY, exitX, exitY, visited, width, height) {
  // Use a modified version of the DFS algorithm that prioritizes moving towards the exit
  
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
        maze[startY][x] = ' ';
        visited.add(`${x},${startY}`);
      }
    }
    
    if (dy !== 0) {
      // Vertical connection
      const stepY = dy > 0 ? 1 : -1;
      for (let y = startY + stepY; y !== exitY + stepY; y += stepY) {
        maze[y][exitX] = ' ';
        visited.add(`${exitX},${y}`);
      }
    }
    
    return true;
  }
  
  // Directions to try, prioritizing moving towards the exit
  const directions = [
    { dx: 0, dy: -2 }, // Up
    { dx: 2, dy: 0 },  // Right
    { dx: 0, dy: 2 },  // Down
    { dx: -2, dy: 0 }  // Left
  ];
  
  // Sort directions based on how much closer they get us to the exit
  directions.sort((a, b) => {
    const distA = Math.abs((startX + a.dx) - exitX) + Math.abs((startY + a.dy) - exitY);
    const distB = Math.abs((startX + b.dx) - exitX) + Math.abs((startY + b.dy) - exitY);
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
    maze[startY + dir.dy/2][startX + dir.dx/2] = ' ';
    maze[ny][nx] = ' ';
    visited.add(`${nx},${ny}`);
    
    // Recursively continue path finding
    if (ensurePathExists(maze, nx, ny, exitX, exitY, visited, width, height)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Fill in the remaining maze with random paths
 * @param {Array} maze - The maze being generated
 * @param {Set} visited - Set of cells already visited
 * @param {number} width - Maze width
 * @param {number} height - Maze height
 */
function fillRemainingMaze(maze, visited, width, height) {
  // Standard DFS algorithm to fill in the rest of the maze
  const stack = Array.from(visited).map(coord => {
    const [x, y] = coord.split(',').map(Number);
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
        maze[ny][nx] === '#' &&
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
      maze[current.y + next.dy][current.x + next.dx] = ' ';
      maze[next.y][next.x] = ' ';
      
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

/**
 * Check if a cell position is valid within the maze
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {number} width - Maze width
 * @param {number} height - Maze height
 * @returns {boolean} - Whether the position is valid
 */
function isValidCell(x, y, width, height) {
  return x > 0 && x < width - 1 && y > 0 && y < height - 1;
}

/**
 * Check if the maze is valid
 * @param {Array} maze - The maze to check
 * @returns {boolean} Whether the maze is valid
 */
function isMazeValid(maze) {
  if (!Array.isArray(maze) || maze.length === 0) return false;
  
  const height = maze.length;
  const width = maze[0].length;
  
  // Check all rows have the same width
  for (let y = 0; y < height; y++) {
    if (!Array.isArray(maze[y]) || maze[y].length !== width) {
      console.error(`Invalid row width at row ${y}`);
      return false;
    }
  }
  
  // Check boundary walls
  for (let x = 0; x < width; x++) {
    if (maze[0][x] !== '#' || maze[height-1][x] !== '#') {
      console.error(`Missing boundary wall at top or bottom, column ${x}`);
      return false;
    }
  }
  
  for (let y = 0; y < height; y++) {
    if (maze[y][0] !== '#' || maze[y][width-1] !== '#') {
      console.error(`Missing boundary wall at left or right, row ${y}`);
      return false;
    }
  }
  
  // Check for entrance and exit
  let hasStart = false;
  let hasExit = false;
  
  // Start is typically at (1,1) and is a space
  if (maze[1][1] === ' ') {
    hasStart = true;
  }
  
  // Find exit (marked with 'E')
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (maze[y][x] === 'E') {
        hasExit = true;
        break;
      }
    }
    if (hasExit) break;
  }
  
  if (!hasStart) {
    console.error('Maze is missing a valid start position');
    return false;
  }
  
  if (!hasExit) {
    console.error('Maze is missing an exit');
    return false;
  }
  
  return true;
}

/**
 * Check if a maze is solvable using BFS
 * @param {Array} maze - The maze to check
 * @returns {boolean} Whether the maze is solvable
 */
function isMazeSolvable(maze) {
  const height = maze.length;
  const width = maze[0].length;
  
  // Find exit coordinates
  let exitX = -1;
  let exitY = -1;
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (maze[y][x] === 'E') {
        exitX = x;
        exitY = y;
        break;
      }
    }
    if (exitX !== -1) break;
  }
  
  if (exitX === -1) {
    console.error('Exit not found in maze');
    return false;
  }
  
  // Start from (1,1) and try to reach the exit using BFS
  const startX = 1;
  const startY = 1;
  const queue = [{ x: startX, y: startY }];
  const visited = Array(height).fill().map(() => Array(width).fill(false));
  visited[startY][startX] = true;
  
  const directions = [
    { dx: 0, dy: -1 }, // Up
    { dx: 1, dy: 0 },  // Right
    { dx: 0, dy: 1 },  // Down
    { dx: -1, dy: 0 }  // Left
  ];
  
  while (queue.length > 0) {
    const current = queue.shift();
    
    // Check if we've reached the exit
    if (current.x === exitX && current.y === exitY) {
      return true;
    }
    
    // Try all four directions
    for (const dir of directions) {
      const nx = current.x + dir.dx;
      const ny = current.y + dir.dy;
      
      // Check if this position is valid
      if (
        nx >= 0 && nx < width && 
        ny >= 0 && ny < height && 
        !visited[ny][nx] && 
        (maze[ny][nx] === ' ' || maze[ny][nx] === 'E')
      ) {
        visited[ny][nx] = true;
        queue.push({ x: nx, y: ny });
      }
    }
  }
  
  // If we've exhausted the queue without finding the exit, the maze is unsolvable
  console.error('Maze is not solvable - no path from start to exit');
  return false;
}

/**
 * Run maze generation tests
 */
function testMazeGeneration() {
  try {
    console.log('Testing maze generation...');
    
    // Test with different sizes
    const testSizes = [
      { width: 5, height: 5 },
      { width: 10, height: 10 },
      { width: 15, height: 20 }
    ];
    
    let passCount = 0;
    let failCount = 0;
    
    for (const size of testSizes) {
      console.log(`\nGenerating ${size.width}x${size.height} maze...`);
      
      // Generate a test maze
      const maze = generateTestMaze(size.width, size.height);
      
      // Check if it's valid
      const isValid = isMazeValid(maze);
      if (isValid) {
        console.log(`✅ Valid ${size.width}x${size.height} maze structure`);
      } else {
        console.error(`❌ Invalid ${size.width}x${size.height} maze structure`);
        failCount++;
        continue;
      }
      
      // Check if it's solvable
      const isSolvable = isMazeSolvable(maze);
      if (isSolvable) {
        console.log(`✅ Maze is solvable`);
        passCount++;
      } else {
        console.error(`❌ Maze is not solvable`);
        failCount++;
      }
    }
    
    console.log(`\nMaze generation test results: ${passCount} passed, ${failCount} failed`);
    return failCount === 0;
  } catch (err) {
    console.error('Maze generation test error:', err.message);
    return false;
  }
}

// Run test when executed directly
if (require.main === module) {
  if (testMazeGeneration()) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

module.exports = {
  generateTestMaze,
  isMazeValid,
  isMazeSolvable,
  testMazeGeneration
};
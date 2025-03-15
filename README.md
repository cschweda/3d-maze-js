# TRS-80 Style Maze Explorer

A retro-style 3D maze game inspired by the classic TRS-80 maze games from the early 1980s.

## Features

- First-person 3D perspective rendered in HTML5 Canvas
- Procedurally generated mazes with guaranteed solutions
- Multiple pre-built maze designs with varying complexity
- Visual maze map with current position indicator
- Smooth animation for movement and turning

## How to Play

1. Open `index.html` in a modern web browser
2. Use arrow keys to navigate:
   - ↑ (Up Arrow): Move forward
   - ↓ (Down Arrow): Move backward
   - ← (Left Arrow): Turn left
   - → (Right Arrow): Turn right
3. Find the exit marked in green

## Testing Mazes

You can use the Maze Tester to test all available mazes:

1. Open `maze_tester.html` in your browser
2. Browse through the different maze options
3. Click "TEST THIS MAZE" to load that specific maze in the game

### Generating the Huge Maze

The huge maze (40x40) uses procedural generation. To generate its content:

```bash
cd mazes
node generate_huge_maze.js
```

## Maze Types

This project includes several maze types for testing different aspects of the game:

1. **Tiny Maze (5×5)**: Quick testing of basic functionality
2. **Small Maze (10×10)**: Simple navigation test
3. **Medium Maze (15×15)**: Moderate complexity
4. **Large Maze (25×25)**: Tests performance with larger mazes
5. **Huge Maze (40×40)**: Stress test for performance
6. **Spiral Maze (15×15)**: Special layout with a spiral pattern
7. **Complex Maze (20×20)**: Many dead ends and complex paths
8. **Simple Maze (12×12)**: Few dead ends, more straightforward
9. **Multi-Exit Maze (18×18)**: Multiple exits for testing special cases

## Contributing

Feel free to contribute by:

1. Creating new maze designs (add JSON files to the `mazes` directory)
2. Improving the rendering algorithms
3. Adding new features to enhance gameplay

## License

This project is open source and available under the MIT License.

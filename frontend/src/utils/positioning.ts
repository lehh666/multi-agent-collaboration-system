/**
 * Utility functions for responsive agent positioning
 */

/**
 * Calculate optimal positions for agents to avoid overlapping
 * @param agents Array of agents to position
 * @param canvasWidth Width of the canvas
 * @param canvasHeight Height of the canvas
 * @returns Array of agents with updated positions
 */
export function calculateResponsivePositions(
  agents: Array<{ id: string; x: number; y: number; [key: string]: any }>,
  canvasWidth: number = 800,
  canvasHeight: number = 700
): Array<{ id: string; x: number; y: number; [key: string]: any }> {
  // Define grid positions to distribute agents evenly
  const gridPositions = [
    { x: Math.floor(canvasWidth * 0.15), y: Math.floor(canvasHeight * 0.3) },   // Top-left
    { x: Math.floor(canvasWidth * 0.35), y: Math.floor(canvasHeight * 0.3) },   // Top-center-left
    { x: Math.floor(canvasWidth * 0.55), y: Math.floor(canvasHeight * 0.3) },   // Top-center-right
    { x: Math.floor(canvasWidth * 0.75), y: Math.floor(canvasHeight * 0.3) },   // Top-right
    { x: Math.floor(canvasWidth * 0.25), y: Math.floor(canvasHeight * 0.6) },   // Bottom-left
    { x: Math.floor(canvasWidth * 0.45), y: Math.floor(canvasHeight * 0.6) },   // Bottom-center
    { x: Math.floor(canvasWidth * 0.65), y: Math.floor(canvasHeight * 0.6) },   // Bottom-right
  ];

  // Shuffle grid positions to add some randomness
  const shuffledPositions = [...gridPositions].sort(() => Math.random() - 0.5);

  return agents.map((agent, index) => {
    const posIndex = index % shuffledPositions.length;
    const position = shuffledPositions[posIndex];
    
    // Add slight random offset to prevent perfect alignment
    const offsetX = Math.floor(Math.random() * 20 - 10);
    const offsetY = Math.floor(Math.random() * 20 - 10);
    
    return {
      ...agent,
      x: Math.max(40, Math.min(canvasWidth - 40, position.x + offsetX)),
      y: Math.max(60, Math.min(canvasHeight - 60, position.y + offsetY))
    };
  });
}

/**
 * Adjust agent positions based on screen size
 * @param agents Array of agents to position
 * @param screenWidth Current screen width
 * @returns Array of agents with adjusted positions
 */
export function adjustPositionsForScreenSize(
  agents: Array<{ id: string; x: number; y: number; [key: string]: any }>,
  screenWidth: number
): Array<{ id: string; x: number; y: number; [key: string]: any }> {
  // Scale factor based on screen size (assuming 1200px as baseline)
  const scaleFactor = Math.min(screenWidth / 1200, 1);
  
  // Calculate canvas dimensions based on scale factor
  const canvasWidth = Math.floor(800 * scaleFactor);
  const canvasHeight = Math.floor(700 * scaleFactor);
  
  return calculateResponsivePositions(agents, canvasWidth, canvasHeight);
}
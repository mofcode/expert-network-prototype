// Geometry utilities for quadrant-based exploration

export interface Point {
  x: number;
  y: number;
}

export interface TranscriptWithDistance {
  transcript: any;
  distance: number;
}

/**
 * Calculate Euclidean distance between two points
 */
export function calculateDistance(p1: Point, p2: Point): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Find N nearest transcripts to a given position
 */
export function findNearestTranscripts<T extends { coordinates?: { technical: number; strategic: number } }>(
  transcripts: T[],
  position: Point,
  count: number = 5
): T[] {
  // Filter transcripts that have coordinates
  const transcriptsWithCoordinates = transcripts.filter(t => t.coordinates);
  console.log(`[findNearestTranscripts] Input: ${transcripts.length} transcripts, ${transcriptsWithCoordinates.length} with coordinates, requesting ${count}`);

  // Calculate distances
  const withDistances = transcriptsWithCoordinates.map(transcript => ({
    transcript,
    distance: calculateDistance(position, {
      x: transcript.coordinates!.technical,
      y: transcript.coordinates!.strategic,
    }),
  }));

  // Sort by distance and take top N
  const result = withDistances
    .sort((a, b) => a.distance - b.distance)
    .slice(0, count)
    .map(item => item.transcript);

  console.log(`[findNearestTranscripts] Returning ${result.length} transcripts`);
  return result;
}

/**
 * Clamp a value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Convert canvas coordinates to quadrant coordinates (-1 to 1)
 */
export function canvasToQuadrant(
  canvasX: number,
  canvasY: number,
  canvasWidth: number,
  canvasHeight: number,
  padding: number = 40
): Point {
  const usableWidth = canvasWidth - 2 * padding;
  const usableHeight = canvasHeight - 2 * padding;

  // Convert to 0-1 range
  const normalizedX = (canvasX - padding) / usableWidth;
  const normalizedY = (canvasY - padding) / usableHeight;

  // Convert to -1 to 1 range
  const x = clamp(normalizedX * 2 - 1, -1, 1);
  const y = clamp(1 - normalizedY * 2, -1, 1); // Flip Y axis (canvas Y grows downward)

  return { x, y };
}

/**
 * Convert quadrant coordinates (-1 to 1) to canvas coordinates
 */
export function quadrantToCanvas(
  point: Point,
  canvasWidth: number,
  canvasHeight: number,
  padding: number = 40
): Point {
  const usableWidth = canvasWidth - 2 * padding;
  const usableHeight = canvasHeight - 2 * padding;

  // Convert from -1 to 1 range to 0-1 range
  const normalizedX = (point.x + 1) / 2;
  const normalizedY = (1 - point.y) / 2; // Flip Y axis

  // Convert to canvas coordinates
  const x = normalizedX * usableWidth + padding;
  const y = normalizedY * usableHeight + padding;

  return { x, y };
}

/**
 * Check if all transcripts have coordinates
 */
export function allTranscriptsHaveCoordinates<T extends { coordinates?: { technical: number; strategic: number } }>(
  transcripts: T[]
): boolean {
  if (transcripts.length === 0) return false;
  return transcripts.every(t => t.coordinates !== undefined);
}

/**
 * Count transcripts with coordinates
 */
export function countTranscriptsWithCoordinates<T extends { coordinates?: { technical: number; strategic: number } }>(
  transcripts: T[]
): number {
  return transcripts.filter(t => t.coordinates !== undefined).length;
}

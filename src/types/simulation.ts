/**
 * Represents a single needle dropped in the simulation.
 */
export interface Needle {
  /** X coordinate of the needle's center (in canvas units) */
  cx: number;
  /** Y coordinate of the needle's center (in canvas units) */
  cy: number;
  /** Angle of the needle in radians [0, π] */
  angle: number;
  /** Whether the needle crosses a line */
  crossing: boolean;
}

/**
 * User-configurable parameters for the simulation.
 */
export interface SimulationConfig {
  /** Length of each needle (in canvas units) */
  needleLength: number;
  /** Distance between parallel lines (in canvas units) */
  lineSpacing: number;
  /**
   * Needles added per animation frame.
   * Values ≥ 1 → that many needles per frame.
   * Values < 1 → 1 needle every round(1/speed) frames (slow mode).
   */
  speed: number;
  /** Maximum number of needles to drop */
  maxNeedles: number;
}

/**
 * A single data point in the π convergence history.
 */
export interface PiDataPoint {
  /** Total number of needles at this snapshot */
  total: number;
  /** π estimate at this snapshot */
  piEstimate: number;
}

/**
 * Current runtime state of the simulation.
 */
export interface SimulationStats {
  /** Total number of needles dropped */
  total: number;
  /** Number of needles crossing a line */
  crossings: number;
  /** Current π estimate — null when crossings === 0 */
  piEstimate: number | null;
  /** Absolute error from Math.PI — null when crossings === 0 */
  error: number | null;
}


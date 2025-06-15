/**
 * Tether metadata containing component information and custom data
 */
export interface TetherMetadata {
  /** Component props (excluding tetherMetadata) */
  props: Record<string, unknown>
  /** Custom metadata provided by the user */
  metadata?: unknown
}

/**
 * Tether context value providing registration and retrieval functions
 */
export interface TetherContextValue {
  /** Register tether information for a DOM element */
  registerTether: (element: Element, metadata: TetherMetadata) => void
  /** Retrieve tether information from a DOM element */
  getTether: (element: Element) => TetherMetadata | undefined
}

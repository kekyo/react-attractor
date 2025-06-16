/**
 * Tether metadata containing component information and custom data
 */
export interface TetherMetadata<TMetadata = unknown> {
  /** Component props (excluding tetherMetadata) */
  props: Record<string, unknown>
  /** Custom metadata provided by the user */
  metadata?: TMetadata
}

/**
 * Tether context value providing registration and retrieval functions
 */
export interface TetherContextValue<TMetadata = unknown> {
  /** Register tether information for a DOM element */
  registerTether: (element: Element, metadata: TetherMetadata<TMetadata>) => void
  /** Retrieve tether information from a DOM element */
  getTether: (element: Element) => TetherMetadata<TMetadata> | undefined
}

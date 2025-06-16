import { createContext, useContext, useCallback, useRef, ReactNode } from 'react';
import { TetherContextValue, TetherMetadata } from './types';

/**
 * Internal context interface with fixed types for createContext
 */
interface InternalTetherContextValue {
  /** Register tether information for a DOM element */
  registerTether: (element: Element, metadata: TetherMetadata<unknown>) => void
  /** Retrieve tether information from a DOM element */
  getTether: (element: Element) => TetherMetadata<unknown> | undefined
}

const TetherContext = createContext<InternalTetherContextValue | null>(null);

export interface TetherProviderProps {
  children: ReactNode
}

/**
 * Provider component that manages tether registrations using WeakMap
 *
 * @example
 * ```tsx
 * // Usage
 * <TetherProvider>
 *   <App />
 * </TetherProvider>
 * ```
 */
export const TetherProvider = ({ children }: TetherProviderProps) => {
  const tetherMapRef = useRef(new WeakMap<Element, TetherMetadata<unknown>>());

  const registerTether = useCallback((element: Element, metadata: TetherMetadata<unknown>) => {
    if (!element) return;
    tetherMapRef.current.set(element, metadata);
  }, []);

  const getTether = useCallback((element: Element): TetherMetadata<unknown> | undefined => {
    return tetherMapRef.current.get(element);
  }, []);

  const contextValue: InternalTetherContextValue = {
    registerTether,
    getTether,
  };

  return (
    <TetherContext.Provider value={contextValue}>
      {children}
    </TetherContext.Provider>
  );
};

/**
 * Hook to access tether context
 *
 * @template TMetadata - Type of custom metadata
 * @throws {Error} When used outside of TetherProvider
 * @returns {TetherContextValue<TMetadata>} Context value with register and get functions
 */
export const useTetherContext = <TMetadata = unknown>(): TetherContextValue<TMetadata> => {
  const context = useContext(TetherContext);
  if (!context) {
    throw new Error('useTetherContext must be used within a TetherProvider');
  }
  return context as TetherContextValue<TMetadata>;
};

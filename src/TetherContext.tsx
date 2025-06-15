import { createContext, useContext, useCallback, useRef, ReactNode } from 'react';
import { TetherContextValue, TetherMetadata } from './types';

const TetherContext = createContext<TetherContextValue | null>(null);

export interface TetherProviderProps {
  children: ReactNode
}

/**
 * Provider component that manages tether registrations using WeakMap
 *
 * @example
 * ```tsx
 * <TetherProvider>
 *   <App />
 * </TetherProvider>
 * ```
 */
export const TetherProvider = ({ children }: TetherProviderProps) => {
  const tetherMapRef = useRef(new WeakMap<Element, TetherMetadata>());

  const registerTether = useCallback((element: Element, metadata: TetherMetadata) => {
    if (!element) return;
    tetherMapRef.current.set(element, metadata);
  }, []);

  const getTether = useCallback((element: Element): TetherMetadata | undefined => {
    return tetherMapRef.current.get(element);
  }, []);

  const contextValue: TetherContextValue = {
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
 * @throws {Error} When used outside of TetherProvider
 * @returns {TetherContextValue} Context value with register and get functions
 */
export const useTetherContext = (): TetherContextValue => {
  const context = useContext(TetherContext);
  if (!context) {
    throw new Error('useTetherContext must be used within a TetherProvider');
  }
  return context;
};

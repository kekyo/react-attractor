// Core implementation
export { TetherProvider, useTetherContext } from './TetherContext';

// Higher-order component
export { withTether, isForwardRefComponent } from './withTether';

// Type definitions
export type { TetherMetadata, TetherContextValue } from './types';
export type { TetherProps, RefCapableProps, ForwardRefComponent } from './withTether';

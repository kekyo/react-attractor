import { useCallback } from 'react';
import { useTetherContext } from './TetherContext';
import { TetherMetadata } from './types';

/**
 * Props interface for components enhanced with tether functionality
 *
 * @template TMetadata - Type of custom metadata (defaults to Record<string, unknown>)
 */
export interface TetherProps<TMetadata = Record<string, unknown>> {
  /** Custom metadata for tether registration */
  tetherMetadata?: TMetadata
}

/**
 * Base props interface for components that can receive refs
 */
export interface RefCapableProps {
  ref?: React.Ref<HTMLElement>
}

/**
 * Type for forwardRef-wrapped components
 *
 * @template P - Component props type
 */
export type ForwardRefComponent<P = Record<string, never>> = React.ForwardRefExoticComponent<
  React.PropsWithoutRef<P> & React.RefAttributes<HTMLElement>
>

/**
 * Type guard to check if a component is a forwardRef component
 *
 * @param component - Component to check
 * @returns True if component is a forwardRef component
 */
export function isForwardRefComponent(component: unknown): component is ForwardRefComponent {
  return component !== null && typeof component === 'object' && component !== null && '$$typeof' in component;
}

/**
 * Higher-order component that adds tether functionality to a component
 *
 * The wrapped component must be able to receive and properly handle refs:
 * - Components wrapped with React.forwardRef()
 * - Components that accept ref props and bind them to DOM elements
 *
 * @template TMetadata - Type of custom metadata (defaults to Record<string, unknown>)
 * @template P - Component props type (automatically inferred)
 *
 * @param WrappedComponent - Component to enhance with tether functionality
 * @returns Enhanced component with tether capabilities
 *
 * @example
 * ```tsx
 * // Basic usage with flexible metadata
 * const TetheredBox = withTether(Box)
 * <TetheredBox tetherMetadata={{ userId: 123, category: 'ui' }} />
 *
 * // Type-safe metadata
 * interface UserMetadata {
 *   userId: number
 *   permissions: string[]
 *   lastUpdated: Date
 * }
 * const TetheredUserBox = withTether<UserMetadata>(Box)
 * <TetheredUserBox
 *   label="User Profile"
 *   tetherMetadata={{
 *     userId: 123,
 *     permissions: ['read'],
 *     lastUpdated: new Date()
 *   }}
 * />
 * ```
 */
export function withTether<TMetadata = Record<string, unknown>>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  WrappedComponent: React.ComponentType<any>
): <P>(props: P & TetherProps<TMetadata>) => React.ReactElement | null {
  const TetheredComponent = <P,>(props: P & TetherProps<TMetadata>) => {
    const { tetherMetadata, ...restProps } = props;
    const { registerTether } = useTetherContext<TMetadata>();

    const finalMetadata: TetherMetadata<TMetadata> = {
      props: restProps,
      metadata: tetherMetadata,
    };

    const tetherRef = useCallback((element: Element | null) => {
      if (element) {
        registerTether(element, finalMetadata);
      }
    }, [registerTether, finalMetadata]);

    const componentProps = {
      ...restProps,
      ref: tetherRef,
    } as P & { ref: (element: Element | null) => void };

    return <WrappedComponent {...componentProps} />;
  };

  TetheredComponent.displayName = `withTether(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return TetheredComponent;
}

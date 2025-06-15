# React Attractor

Enables you to retrieve React component information from DOM elements.

## What is this?

A lightweight React library that enables you to retrieve React component information and custom metadata from DOM elements. Perfect for debugging, analytics, testing, and building developer tools.

Short example:

```tsx
import { TetherProvider, withTether } from 'react-attractor';

// Apply tether ability on already declared component
const TetheredBox = withTether(Box);

// Handle click events to retrieve component data
const handleClick = (event) => {
  const element = event.target;
  const tether = getTether(element);
  if (tether) {
    console.log('Metadata:', tether.metadata);
  }
};

const App = () => {
  return (
    <TetherProvider>
      <TetheredBox tetherMetadata={{ data: 123 }} />
      <TetheredBox tetherMetadata={{ data: 456 }} />
      <TetheredBox tetherMetadata={{ data: 789 }} />
    </TetherProvider>
  )
}
```

## Installation

```bash
npm install react-attractor
```

## Quick Start

### Wrap your app with TetherProvider

TetherProvider manages tether information registered by components under its scope, enabling retrieval of component information from DOM elements. Multiple providers can be arranged hierarchically to enable scoped management.

```tsx
import { TetherProvider } from 'react-attractor'

const App = () => {
  return (
    <TetherProvider>
      <YourApp />
    </TetherProvider>
  )
}
```

### Enhance components with withTether

withTether is a higher-order component (HOC) that adds tether functionality to existing React components. Enhanced components become capable of retrieving component information and custom metadata from DOM elements.

```tsx
import { withTether } from 'react-attractor';
import { forwardRef } from 'react';

// Apply tether ability already declared component
const TetheredBox = withTether(Box);

// For components that don't expose ref, add ref forwarding with forwardRef
const Box = forwardRef<HTMLDivElement>((props, ref) => (
  <div ref={ref} {...props} />
));
```

Note: Many UI libraries like Material UI already expose refs on most components, so you can apply `withTether` directly.

### Use the enhanced component

Components enhanced with withTether gain a `tetherMetadata` property that allows you to set custom data associated with DOM elements. This metadata can be retrieved later from the DOM elements.

```tsx
const MyComponent = () => {
  return (
    <TetheredBox 
      label="Hello World" 
      color="#ff6b6b"
      tetherMetadata={{ userId: 123, category: 'greeting' }}
    />
  )
}
```

### Retrieve component data from DOM elements

Once tethered components are rendered, you can retrieve component information and metadata from DOM elements. Use the getTether function from the useTetherContext hook to access component data from click events and other interactions.

```tsx
import { useTetherContext } from 'react-attractor'

function Inspector() {
  const { getTether } = useTetherContext()
  
  const handleClick = (event: React.MouseEvent) => {
    const element = event.target as Element
    const tether = getTether(element)
    
    if (tether) {
      console.log('Component:', tether.component.displayName)
      console.log('Props:', tether.props)
      console.log('Custom metadata:', tether.metadata)
    }
  }
  
  return <div onClick={handleClick}>Click any tethered element</div>
}
```

----

## Advanced Usage

### Type-Safe Custom Metadata

Define custom metadata types for better type safety:

```tsx
interface UserMetadata {
  userId: number
  permissions: ('read' | 'write' | 'delete')[]
  lastUpdated: Date
  department: string
}

const TetheredUserCard = withTether<UserMetadata>(UserCard)

// Usage with type checking
<TetheredUserCard 
  name="John Doe"
  tetherMetadata={{
    userId: 123,                    // Type checked
    permissions: ['read', 'write'], // Type checked
    lastUpdated: new Date(),        // Type checked
    department: 'Engineering'       // Type checked
    // invalidField: 'test'         // TypeScript error
  }}
/>
```

### Retrieving Typed Metadata

```tsx
const { getTether } = useTetherContext()

const handleElementInspection = (element: Element) => {
  const tether = getTether(element)
  
  if (tether?.metadata) {
    // Fully typed metadata access
    const userId = tether.metadata.userId           // number
    const permissions = tether.metadata.permissions // string[]
    const department = tether.metadata.department   // string
    
    // Type-safe business logic
    if (permissions.includes('write')) {
      enableEditMode(element)
    }
  }
}
```

### Multiple Component Types

```tsx
const TetheredButton = withTether(Button)
const TetheredCard = withTether(Card)
const TetheredModal = withTether(Modal)

// Each maintains its own props and metadata
<TetheredButton onClick={handleClick} tetherMetadata={{ action: 'submit' }}>
  Submit
</TetheredButton>

<TetheredCard title="User Profile" tetherMetadata={{ userId: 456 }}>
  Card content
</TetheredCard>
```

----

## API Reference

### TetherProvider

Provider component that manages tether registrations.

```tsx
<TetherProvider>
  <App />
</TetherProvider>
```

### withTether

Higher-order component that adds tether functionality to a component.

```tsx
export const withTether<TMetadata = Record<string, any>>(
  WrappedComponent: ComponentType<any> | ForwardRefComponent<any>
): ComponentType<OriginalProps & TetherProps<TMetadata>>;
```

Requirements:
- Component must accept and forward a `ref` to a DOM element
- If the component doesn't expose `ref`, wrap it with `React.forwardRef()`

### useTetherContext

Hook to access tether functionality.

```tsx
const { getTether, registerTether } = useTetherContext();
```

Returns:
- `getTether(element: Element)` - Retrieve tether data from DOM element
- `registerTether(element: Element, metadata: TetherMetadata)` - Register tether data (used internally)

### TetherMetadata

Interface for tether data structure.

```tsx
interface TetherMetadata {
  component: ComponentType<any>;    // React component type
  props: Record<string, any>;       // Component props (excluding tetherMetadata)
  metadata?: any;                   // Custom metadata
}
```

### TetherProps

Interface for enhanced component props.

```tsx
interface TetherProps<TMetadata = Record<string, any>> {
  tetherMetadata?: TMetadata       // Custom metadata
}
```

----

## License

MIT License - see LICENSE file for details. 

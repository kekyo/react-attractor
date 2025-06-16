import React, { forwardRef } from 'react';
import { TetherProvider, withTether, useTetherContext } from '../src';

// Metadata type definitions
interface UserMetadata {
  userId: number;
  permissions: ('read' | 'write' | 'delete')[];
  department: string;
  lastUpdated: Date;
}

interface ProductMetadata {
  productId: string;
  category: string;
  price: number;
  inStock: boolean;
}

// Test components
const UserCard = forwardRef<HTMLDivElement, { name: string; email: string }>((props, ref) => (
  <div ref={ref} className="user-card">
    <h3>{props.name}</h3>
    <p>{props.email}</p>
  </div>
));

const ProductCard = forwardRef<HTMLDivElement, { title: string; description: string }>((props, ref) => (
  <div ref={ref} className="product-card">
    <h3>{props.title}</h3>
    <p>{props.description}</p>
  </div>
));

UserCard.displayName = 'UserCard';
ProductCard.displayName = 'ProductCard';

// Typed components
const TetheredUserCard = withTether<UserMetadata>(UserCard);
const TetheredProductCard = withTether<ProductMetadata>(ProductCard);

// Inspector component
const Inspector = () => {
  const { getTether } = useTetherContext<UserMetadata | ProductMetadata>();

  const handleClick = (event: React.MouseEvent) => {
    const element = event.target as Element;
    const tether = getTether(element);

    if (tether?.metadata) {
      // Type-safe metadata access
      if ('userId' in tether.metadata) {
        // UserMetadata case
        const userMetadata = tether.metadata as UserMetadata;
        console.log('User ID:', userMetadata.userId);
        console.log('Permissions:', userMetadata.permissions);
        console.log('Department:', userMetadata.department);
        console.log('Last Updated:', userMetadata.lastUpdated);
        
        // Type-safe business logic
        if (userMetadata.permissions.includes('write')) {
          console.log('User has write permission');
        }
      } else if ('productId' in tether.metadata) {
        // ProductMetadata case
        const productMetadata = tether.metadata as ProductMetadata;
        console.log('Product ID:', productMetadata.productId);
        console.log('Category:', productMetadata.category);
        console.log('Price:', productMetadata.price);
        console.log('In Stock:', productMetadata.inStock);
        
        // Type-safe business logic
        if (!productMetadata.inStock) {
          console.log('Product is out of stock');
        }
      }
    }
  };

  return <div onClick={handleClick}>Click any element to inspect</div>;
};

// Example 1: Single typed provider
export const UserApp = () => {
  return (
    <TetherProvider<UserMetadata>>
      <div>
        <h1>User Management</h1>
        <TetheredUserCard
          name="John Doe"
          email="john@example.com"
          tetherMetadata={{
            userId: 123,
            permissions: ['read', 'write'],
            department: 'Engineering',
            lastUpdated: new Date('2023-12-01')
          }}
        />
        <TetheredUserCard
          name="Jane Smith"
          email="jane@example.com"
          tetherMetadata={{
            userId: 456,
            permissions: ['read', 'write', 'delete'],
            department: 'Marketing',
            lastUpdated: new Date('2023-12-02')
          }}
        />
        <Inspector />
      </div>
    </TetherProvider>
  );
};

// Example 2: Union type provider
export const MixedApp = () => {
  return (
    <TetherProvider<UserMetadata | ProductMetadata>>
      <div>
        <h1>Mixed Content App</h1>
        <TetheredUserCard
          name="Alice Johnson"
          email="alice@example.com"
          tetherMetadata={{
            userId: 789,
            permissions: ['read'],
            department: 'Sales',
            lastUpdated: new Date('2023-12-03')
          }}
        />
        <TetheredProductCard
          title="Laptop"
          description="High-performance laptop"
          tetherMetadata={{
            productId: 'LAPTOP-001',
            category: 'Electronics',
            price: 1299.99,
            inStock: true
          }}
        />
        <Inspector />
      </div>
    </TetherProvider>
  );
};

// Example 3: Type-safe custom hook
export const useTypedTether = <T,>() => {
  const { getTether } = useTetherContext<T>();
  
  const getTypedMetadata = (element: Element): T | undefined => {
    const tether = getTether(element);
    return tether?.metadata;
  };

  return { getTypedMetadata };
};

// Example 4: Safe access with type guards
export const useUserTether = () => {
  const { getTether } = useTetherContext<UserMetadata>();

  const getUserMetadata = (element: Element): UserMetadata | undefined => {
    const tether = getTether(element);
    if (tether?.metadata && 'userId' in tether.metadata) {
      return tether.metadata as UserMetadata;
    }
    return undefined;
  };

  return { getUserMetadata };
}; 
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import React, { forwardRef } from 'react'
import { TetherProvider, withTether, useTetherContext, TetherMetadata } from '../src'

// Type definitions for test metadata
interface BasicMetadata {
  userId?: number
  category?: string
}

interface TestMetadata {
  data: number
}

interface UserMetadata {
  userId: number
  permissions: ('read' | 'write' | 'delete')[]
  lastUpdated: Date
  department: string
}

interface InspectorMetadata {
  section: string
  priority: string
}

interface ActionMetadata {
  action: string
}

interface ModalMetadata {
  modalId: string
}



// Test components
const SimpleBox = forwardRef<HTMLDivElement, { label: string; color?: string }>((props, ref) => (
  <div ref={ref} data-testid="box" style={{ backgroundColor: props.color }}>
    {props.label}
  </div>
))

SimpleBox.displayName = 'SimpleBox'

const Button = forwardRef<HTMLButtonElement, { children: React.ReactNode; onClick?: () => void }>((props, ref) => (
  <button ref={ref} onClick={props.onClick} data-testid="button">
    {props.children}
  </button>
))

Button.displayName = 'Button'

// Additional components for README validation
const Box = forwardRef<HTMLDivElement, { label?: string; color?: string }>((props, ref) => (
  <div ref={ref} data-testid="readme-box" style={{ backgroundColor: props.color }}>
    {props.label}
  </div>
))

Box.displayName = 'Box'

const UserCard = forwardRef<HTMLDivElement, { name: string; title?: string }>((props, ref) => (
  <div ref={ref} data-testid="user-card">
    <h3>{props.name}</h3>
    {props.title && <p>{props.title}</p>}
  </div>
))

UserCard.displayName = 'UserCard'

describe('React Tether', () => {
  describe('Basic functionality', () => {
    it('should register and retrieve tether data', () => {
      const TetheredBox = withTether(SimpleBox)
      let tetherData: TetherMetadata | undefined = undefined
      
      const TestComponent = () => {
        const { getTether } = useTetherContext()
        
        const handleClick = () => {
          const element = document.querySelector('[data-testid="box"]')
          if (element) {
            tetherData = getTether(element)
          }
        }
        
        return (
          <div>
            <TetheredBox label="Test Label" color="#ff0000" />
            <button onClick={handleClick} data-testid="get-tether">
              Get Tether
            </button>
          </div>
        )
      }
      
      render(
        <TetherProvider>
          <TestComponent />
        </TetherProvider>
      )
      
      // Click to retrieve tether data
      fireEvent.click(screen.getByTestId('get-tether'))
      
      // Verify tether data was retrieved
      expect(tetherData).toBeTruthy()
      expect(tetherData!.props.label).toBe('Test Label')
      expect(tetherData!.props.color).toBe('#ff0000')
    })

    it('should handle custom metadata', () => {
      const TetheredBox = withTether<BasicMetadata>(SimpleBox)
      let tetherData: TetherMetadata<BasicMetadata> | undefined = undefined
      
      const TestComponent = () => {
        const { getTether } = useTetherContext<BasicMetadata>()
        
        const handleClick = () => {
          const element = document.querySelector('[data-testid="box"]')
          if (element) {
            tetherData = getTether(element)
          }
        }
        
        return (
          <div>
            <TetheredBox 
              label="Metadata Test" 
              tetherMetadata={{ userId: 123, category: 'test' }}
            />
            <button onClick={handleClick} data-testid="get-metadata">
              Get Metadata
            </button>
          </div>
        )
      }
      
      render(
        <TetherProvider>
          <TestComponent />
        </TetherProvider>
      )
      
      // Click to retrieve tether data
      fireEvent.click(screen.getByTestId('get-metadata'))
      
      // Verify metadata was stored
      expect(tetherData).toBeTruthy()
      expect(tetherData!.metadata?.userId).toBe(123)
      expect(tetherData!.metadata?.category).toBe('test')
    })

    it('should work without custom metadata', () => {
      const TetheredBox = withTether(SimpleBox)
      let tetherData: TetherMetadata | undefined = undefined
      
      const TestComponent = () => {
        const { getTether } = useTetherContext()
        
        const handleClick = () => {
          const element = document.querySelector('[data-testid="box"]')
          if (element) {
            tetherData = getTether(element)
          }
        }
        
        return (
          <div>
            <TetheredBox label="No Metadata" />
            <button onClick={handleClick} data-testid="get-no-metadata">
              Get No Metadata
            </button>
          </div>
        )
      }
      
      render(
        <TetherProvider>
          <TestComponent />
        </TetherProvider>
      )
      
      // Click to retrieve tether data
      fireEvent.click(screen.getByTestId('get-no-metadata'))
      
      // Verify tether data exists but metadata is undefined
      expect(tetherData).toBeTruthy()
      expect(tetherData!.props.label).toBe('No Metadata')
      expect(tetherData!.metadata).toBeUndefined()
    })

    it('should preserve original component functionality', () => {
      const TetheredButton = withTether(Button)
      const handleClick = vi.fn()
      
      render(
        <TetherProvider>
          <TetheredButton onClick={handleClick}>
            Click Me
          </TetheredButton>
        </TetherProvider>
      )
      
      // Click the button
      fireEvent.click(screen.getByTestId('button'))
      
      // Verify original onClick handler was called
      expect(handleClick).toHaveBeenCalled()
    })
  })

  describe('Multiple components', () => {
    it('should handle multiple tethered components independently', () => {
      const TetheredBox = withTether(SimpleBox)
      const tetherResults: TetherMetadata[] = []
      
      const TestComponent = () => {
        const { getTether } = useTetherContext()
        
        const handleClick = (event: React.MouseEvent) => {
          const element = event.target as Element
          const tether = getTether(element)
          if (tether) {
            tetherResults.push(tether)
          }
        }
        
        return (
          <div onClick={handleClick}>
            <TetheredBox label="Box 1" color="#ff0000" />
            <TetheredBox label="Box 2" color="#00ff00" />
            <TetheredBox label="Box 3" color="#0000ff" />
          </div>
        )
      }
      
      render(
        <TetherProvider>
          <TestComponent />
        </TetherProvider>
      )
      
      // Click each box
      const boxes = screen.getAllByTestId('box')
      boxes.forEach(box => fireEvent.click(box))
      
      // Verify all tether data was collected
      expect(tetherResults).toHaveLength(3)
      expect(tetherResults[0].props.label).toBe('Box 1')
      expect(tetherResults[1].props.label).toBe('Box 2')
      expect(tetherResults[2].props.label).toBe('Box 3')
    })
  })

  describe('Type safety', () => {
    it('should work with typed metadata', () => {
      interface UserMetadata {
        userId: number
        permissions: string[]
        lastUpdated: Date
      }
      
      const TetheredBox = withTether<UserMetadata>(SimpleBox)
      let tetherData: TetherMetadata<UserMetadata> | undefined = undefined
      const testDate = new Date('2023-01-01')
      
      const TestComponent = () => {
        const { getTether } = useTetherContext<UserMetadata>()
        
        const handleClick = () => {
          const element = document.querySelector('[data-testid="box"]')
          if (element) {
            tetherData = getTether(element)
          }
        }
        
        return (
          <div>
            <TetheredBox 
              label="Typed Metadata"
              tetherMetadata={{
                userId: 456,
                permissions: ['read', 'write'],
                lastUpdated: testDate
              }}
            />
            <button onClick={handleClick} data-testid="get-typed">
              Get Typed
            </button>
          </div>
        )
      }
      
      render(
        <TetherProvider>
          <TestComponent />
        </TetherProvider>
      )
      
      // Click to retrieve tether data
      fireEvent.click(screen.getByTestId('get-typed'))
      
      // Verify typed metadata
      expect(tetherData).toBeTruthy()
      expect(tetherData!.metadata!.userId).toBe(456)
      expect(tetherData!.metadata!.permissions).toEqual(['read', 'write'])
      expect(new Date(tetherData!.metadata!.lastUpdated)).toEqual(testDate)
    })
  })

  describe('Error handling', () => {
    it('should throw error when used outside TetherProvider', () => {
      const TetheredBox = withTether(SimpleBox)
      
      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      expect(() => {
        render(<TetheredBox label="Error Box" />)
      }).toThrow('useTetherContext must be used within a TetherProvider')
      
      consoleSpy.mockRestore()
    })

    it('should return undefined for non-tethered elements', () => {
      let tetherData: TetherMetadata | undefined | string = 'not-checked'
      
      const TestComponent = () => {
        const { getTether } = useTetherContext()
        
        const handleClick = () => {
          const element = document.querySelector('[data-testid="regular-div"]')
          if (element) {
            tetherData = getTether(element)
          }
        }
        
        return (
          <div>
            <div data-testid="regular-div">Regular div</div>
            <button onClick={handleClick} data-testid="get-regular">
              Get Regular
            </button>
          </div>
        )
      }
      
      render(
        <TetherProvider>
          <TestComponent />
        </TetherProvider>
      )
      
      // Click to retrieve tether data
      fireEvent.click(screen.getByTestId('get-regular'))
      
      // Verify no tether data for regular elements
      expect(tetherData).toBeUndefined()
    })
  })

  describe('HOC behavior', () => {
    it('should set correct displayName', () => {
      const TetheredBox = withTether(SimpleBox)
      expect((TetheredBox as any).displayName).toBe('withTether(SimpleBox)')
    })

    it('should handle components without displayName', () => {
      const AnonymousComponent = forwardRef<HTMLDivElement>((props, ref) => (
        <div ref={ref}>Anonymous</div>
      ))
      
      const TetheredAnonymous = withTether(AnonymousComponent)
      expect((TetheredAnonymous as any).displayName).toBe('withTether(Component)')
    })
  })

  // README validation tests
  describe('README Sample Code Validation', () => {
    describe('Short Example', () => {
      it('should work with the README short example pattern', () => {
        const TetheredBox = withTether<TestMetadata>(Box)
        let tetherData: TetherMetadata<TestMetadata> | undefined = undefined
        
        const TestComponent = () => {
          const { getTether } = useTetherContext<TestMetadata>()
          
          const handleClick = (event: React.MouseEvent) => {
            const element = event.target as Element
            const tether = getTether(element)
            if (tether) {
              tetherData = tether
            }
          }
          
          return (
            <div onClick={handleClick}>
              <TetheredBox tetherMetadata={{ data: 123 }} />
              <TetheredBox tetherMetadata={{ data: 456 }} />
              <TetheredBox tetherMetadata={{ data: 789 }} />
            </div>
          )
        }
        
        render(
          <TetherProvider>
            <TestComponent />
          </TetherProvider>
        )
        
        // Click on the first box
        const boxes = screen.getAllByTestId('readme-box')
        fireEvent.click(boxes[0])
        
        // Verify tether data was retrieved
        expect(tetherData).toBeTruthy()
        expect(tetherData!.metadata!.data).toBe(123)
      })
    })

    describe('Enhanced Component Usage', () => {
      it('should work with the README enhanced component example', () => {
        const TetheredBox = withTether<BasicMetadata>(Box)
        let tetherData: TetherMetadata<BasicMetadata> | undefined = undefined
        
        const MyComponent = () => {
          const { getTether } = useTetherContext<BasicMetadata>()
          
          const handleClick = () => {
            const element = document.querySelector('[data-testid="readme-box"]')
            if (element) {
              tetherData = getTether(element)
            }
          }
          
          return (
            <div>
              <TetheredBox 
                label="Hello World" 
                color="#ff6b6b"
                tetherMetadata={{ userId: 123, category: 'greeting' }}
              />
              <button onClick={handleClick} data-testid="get-hello">
                Get Hello
              </button>
            </div>
          )
        }
        
        render(
          <TetherProvider>
            <MyComponent />
          </TetherProvider>
        )
        
        // Click to retrieve tether data
        fireEvent.click(screen.getByTestId('get-hello'))
        
        // Verify tether data matches README example
        expect(tetherData).toBeTruthy()
        expect(tetherData!.props.label).toBe('Hello World')
        expect(tetherData!.props.color).toBe('#ff6b6b')
        expect(tetherData!.metadata!.userId).toBe(123)
        expect(tetherData!.metadata!.category).toBe('greeting')
      })
    })

    describe('Inspector Pattern', () => {
      it('should work with the README Inspector pattern', () => {
        const TetheredBox = withTether(Box)
        let inspectorResults: any = null
        
        const TestApp = () => {
          const { getTether } = useTetherContext()
          
          const handleClick = (event: React.MouseEvent) => {
            const element = event.target as Element
            const tether = getTether(element)
            
            if (tether) {
              inspectorResults = {
                props: tether.props,
                metadata: tether.metadata
              }
            }
          }
          
          return (
            <div onClick={handleClick} data-testid="inspector">
              Click any tethered element
              <TetheredBox 
                label="Inspectable Box"
                tetherMetadata={{ section: 'main', priority: 'high' }}
              />
            </div>
          )
        }
        
        render(
          <TetherProvider>
            <TestApp />
          </TetherProvider>
        )
        
        // Click on the tethered box
        const box = screen.getByTestId('readme-box')
        fireEvent.click(box)
        
        // Verify inspector captured the data
        expect(inspectorResults).toBeTruthy()
        expect(inspectorResults.props.label).toBe('Inspectable Box')
        expect(inspectorResults.metadata.section).toBe('main')
        expect(inspectorResults.metadata.priority).toBe('high')
      })
    })

    describe('Type-Safe Custom Metadata', () => {
      it('should work with the README typed metadata example', () => {
        interface UserMetadata {
          userId: number
          permissions: ('read' | 'write' | 'delete')[]
          lastUpdated: Date
          department: string
        }
        
        const TetheredUserCard = withTether<UserMetadata>(UserCard)
        let tetherData: TetherMetadata<UserMetadata> | undefined = undefined
        const testDate = new Date('2023-06-15')
        
        const TestComponent = () => {
          const { getTether } = useTetherContext<UserMetadata>()
          
          const handleClick = () => {
            const element = document.querySelector('[data-testid="user-card"]')
            if (element) {
              tetherData = getTether(element)
            }
          }
          
          return (
            <div>
              <TetheredUserCard 
                name="John Doe"
                tetherMetadata={{
                  userId: 123,
                  permissions: ['read', 'write'],
                  lastUpdated: testDate,
                  department: 'Engineering'
                }}
              />
              <button onClick={handleClick} data-testid="get-user">
                Get User
              </button>
            </div>
          )
        }
        
        render(
          <TetherProvider>
            <TestComponent />
          </TetherProvider>
        )
        
        // Click to retrieve tether data
        fireEvent.click(screen.getByTestId('get-user'))
        
        // Verify typed metadata
        expect(tetherData).toBeTruthy()
        expect(tetherData!.metadata!.userId).toBe(123)
        expect(tetherData!.metadata!.permissions).toEqual(['read', 'write'])
        expect(new Date(tetherData!.metadata!.lastUpdated)).toEqual(testDate)
        expect(tetherData!.metadata!.department).toBe('Engineering')
      })
    })

    describe('Typed Metadata Retrieval', () => {
      it('should work with the README typed metadata retrieval pattern', () => {
        interface UserMetadata {
          userId: number
          permissions: ('read' | 'write' | 'delete')[]
          department: string
        }
        
        const TetheredUserCard = withTether<UserMetadata>(UserCard)
        let businessLogicResult: { userId: number; permissions: string[]; department: string; canEdit: boolean } | null = null
        
        const TestComponent = () => {
          const { getTether } = useTetherContext()
          
          const handleElementInspection = (element: Element) => {
            const tether = getTether(element)
            
            if (tether?.metadata) {
              const metadata = tether.metadata as UserMetadata
              const userId = metadata.userId
              const permissions = metadata.permissions
              const department = metadata.department
              
              businessLogicResult = {
                userId,
                permissions,
                department,
                canEdit: permissions.includes('write')
              }
            }
          }
          
          const handleClick = (event: React.MouseEvent) => {
            const element = event.target as Element
            handleElementInspection(element)
          }
          
          return (
            <div onClick={handleClick}>
              <TetheredUserCard 
                name="Alice Smith"
                tetherMetadata={{
                  userId: 456,
                  permissions: ['read', 'write', 'delete'],
                  department: 'Marketing'
                }}
              />
            </div>
          )
        }
        
        render(
          <TetherProvider>
            <TestComponent />
          </TetherProvider>
        )
        
        // Click on the user card
        const userCard = screen.getByTestId('user-card')
        fireEvent.click(userCard)
        
        // Verify business logic worked correctly
        expect(businessLogicResult).toBeTruthy()
        expect(businessLogicResult!.userId).toBe(456)
        expect(businessLogicResult!.permissions).toEqual(['read', 'write', 'delete'])
        expect(businessLogicResult!.department).toBe('Marketing')
        expect(businessLogicResult!.canEdit).toBe(true)
      })
    })

    describe('Multiple Component Types', () => {
      it('should work with multiple component types as shown in README', () => {
        const TetheredButton = withTether(Button)
        const TetheredBox = withTether(Box)
        const TetheredUserCard = withTether(UserCard)
        
        const tetherResults: { metadata: any }[] = []
        
        const TestComponent = () => {
          const { getTether } = useTetherContext()
          
          const handleClick = (event: React.MouseEvent) => {
            const element = event.target as Element
            const tether = getTether(element)
            if (tether) {
              tetherResults.push({
                metadata: tether.metadata
              })
            }
          }
          
          return (
            <div onClick={handleClick}>
              <TetheredButton 
                tetherMetadata={{ action: 'submit' }}
              >
                Submit
              </TetheredButton>
              <TetheredBox 
                label="Profile Card"
                tetherMetadata={{ userId: 456 }}
              />
              <TetheredUserCard 
                name="Modal User"
                tetherMetadata={{ modalId: 'user-modal' }}
              />
            </div>
          )
        }
        
        render(
          <TetherProvider>
            <TestComponent />
          </TetherProvider>
        )
        
        // Click each component
        const button = screen.getByTestId('button')
        const box = screen.getByTestId('readme-box')
        const userCard = screen.getByTestId('user-card')
        
        fireEvent.click(button)
        fireEvent.click(box)
        fireEvent.click(userCard)
        
        // Verify all components were captured with their metadata
        expect(tetherResults).toHaveLength(3)
        
        const buttonResult = tetherResults.find(r => r.metadata?.action === 'submit')
        const boxResult = tetherResults.find(r => r.metadata?.userId === 456)
        const userCardResult = tetherResults.find(r => r.metadata?.modalId === 'user-modal')
        
        expect(buttonResult?.metadata.action).toBe('submit')
        expect(boxResult?.metadata.userId).toBe(456)
        expect(userCardResult?.metadata.modalId).toBe('user-modal')
      })
    })
  })
}) 
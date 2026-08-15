import { beforeAll, afterAll } from '@jest/globals'

// Mock DOM APIs for testing
beforeAll(() => {
  // Mock window
  global.window = {
    ...global.window,
    localStorage: {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn()
    },
    document: {
      ...global.document,
      createElement: jest.fn().mockImplementation((tag) => ({
        tagName: tag.toUpperCase(),
        style: {},
        classList: {
          add: jest.fn(),
          remove: jest.fn(),
          contains: jest.fn().mockReturnValue(false)
        },
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        appendChild: jest.fn(),
        removeChild: jest.fn(),
        querySelector: jest.fn().mockReturnValue(null),
        querySelectorAll: jest.fn().mockReturnValue([]),
        getBoundingClientRect: jest.fn().mockReturnValue({ top: 0, left: 0, width: 100, height: 100 })
      })),
      createElementNS: jest.fn().mockImplementation((namespace, tag) => ({
        tagName: tag.toUpperCase(),
        style: {},
        classList: {
          add: jest.fn(),
          remove: jest.fn(),
          contains: jest.fn().mockReturnValue(false)
        },
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        appendChild: jest.fn(),
        removeChild: jest.fn(),
        querySelector: jest.fn().mockReturnValue(null),
        querySelectorAll: jest.fn().mockReturnValue([])
      })),
      querySelector: jest.fn().mockReturnValue(null),
      querySelectorAll: jest.fn().mockReturnValue([]),
      getElementsByClassName: jest.fn().mockReturnValue([]),
      getElementsByTagName: jest.fn().mockReturnValue([]),
      getElementById: jest.fn().mockReturnValue(null),
      body: {
        appendChild: jest.fn(),
        removeChild: jest.fn(),
        getBoundingClientRect: jest.fn().mockReturnValue({ top: 0, left: 0, width: 1024, height: 768 })
      }
    },
    fetch: jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({}),
      text: jest.fn().mockResolvedValue('{}')
    }),
    URL.createObjectURL: jest.fn(),
    URL.revokeObjectURL: jest.fn(),
    Blob: jest.fn().mockImplementation((parts, options) => ({
      parts,
      options,
      type: options?.type || 'application/octet-stream'
    })),
    WebSocket: jest.fn().mockImplementation(() => ({
      readyState: 1,
      send: jest.fn(),
      close: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn()
    })),
    WebSocket.CONNECTING: 0,
    WebSocket.OPEN: 1,
    WebSocket.CLOSING: 2,
    WebSocket.CLOSED: 3
  } as any

  // Mock console in tests
  global.console = {
    ...global.console,
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    debug: jest.fn()
  }
})

afterAll(() => {
  // Cleanup mocks
  jest.restoreAllMocks()
})
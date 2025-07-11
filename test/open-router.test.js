const { OpenRouter, OpenRouterAgent } = require('..')

describe('OpenRouter', () => {
  const apiKey = '123-test-key'

  beforeEach(() => {
    delete process.env.OPEN_ROUTER_API_KEY
  })

  it('should create a valid instance with an explicit apiKey', () => {
    const instance = new OpenRouter({ apiKey })
    expect(instance).toBeInstanceOf(OpenRouter)
    expect(instance.apiKey).toBe(apiKey)
    expect(instance.client).toBeDefined()
    expect(instance.client.apiKey).toBe(apiKey)
    expect(instance.service).toBeDefined()
  })

  it('should fall back to process.env.OPEN_ROUTER_API_KEY if not provided', () => {
    process.env.OPEN_ROUTER_API_KEY = 'env-key'
    const instance = new OpenRouter()
    expect(instance.apiKey).toBe('env-key')
  })

  it('should throw if no apiKey is provided at all', () => {
    expect(() => new OpenRouter({ apiKey: undefined })).toThrow('apiKey is required and must be a string.')
  })

  it('should create a valid agent using createAgent()', () => {
    const instance = new OpenRouter({ apiKey })
    const agent = instance.createAgent({ model: 'gpt-4', system: 'You are a very helpful agent' })

    expect(agent).toBeInstanceOf(OpenRouterAgent)
    expect(agent.model).toBe('gpt-4')
    expect(agent.system).toBe('You are a very helpful agent')
    expect(agent.service).toBe(instance.service)
  })
})

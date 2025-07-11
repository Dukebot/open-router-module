const { OpenRouterClient } = require('..')

// 👇 Simulate global fetch
global.fetch = jest.fn()

describe('OpenRouterClient', () => {
  const apiKey = 'test'
  const client = new OpenRouterClient({ apiKey })

  afterEach(() => {
    jest.clearAllMocks()
  })

  // Constructor tests:

  it('should throw an error if apiKey is not provided', () => {
    expect(() => new OpenRouterClient({})).toThrow('apiKey is required and must be a string.')
  })

  it('should throw an error if apiKey is not a string', () => {
    expect(() => new OpenRouterClient({ apiKey: 123 })).toThrow('apiKey is required and must be a string.')
  })

  it('should create a valid instance with a given apiKey', () => {
    expect(client.apiKey).toBe(apiKey)
  })

  it('should return the correct endpoint', () => {
    expect(client.endpoint).toBe('https://openrouter.ai/api/v1/chat/completions')
  })

  // Headers:

  it('should build headers correctly without referer', () => {
    const headers = client.createHeaders()
    expect(headers).toMatchObject({
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    })
  })

  it('should include HTTP-Referer and X-Title if provided', () => {
    const headers = client.createHeaders({ referer: 'https://misitio.com', title: 'TestApp' })
    expect(headers['HTTP-Referer']).toBe('https://misitio.com')
    expect(headers['X-Title']).toBe('TestApp')
  })

  // Payload generation:

  it('should create a valid payload with required fields only', () => {
    const payload = client.createPayload({
      model: 'gpt-4',
      messages: [{ role: 'user', content: 'Hello' }],
    })

    expect(payload).toEqual({
      model: 'gpt-4',
      messages: [{ role: 'user', content: 'Hello' }],
    })
  })

  it('should throw if model or messages are invalid', () => {
    expect(() => client.createPayload({ model: null, messages: [] })).toThrow('model must be a string')
    expect(() => client.createPayload({ model: 'gpt-4', messages: 'hola' })).toThrow('messages must be an array')
    expect(() => client.createPayload({ model: 'gpt-4', messages: [{}] })).toThrow(
      "Each message must be an object with 'role' and 'content'"
    )
  })

  it('should validate numeric parameters and reject out of range', () => {
    expect(() =>
      client.createPayload({
        model: 'gpt-4',
        messages: [{ role: 'user', content: 'x' }],
        temperature: 5,
      })
    ).toThrow('temperature must be between 0 and 2')

    expect(() =>
      client.createPayload({
        model: 'gpt-4',
        messages: [{ role: 'user', content: 'x' }],
        topP: -1,
      })
    ).toThrow('topP must be between 0 and 1')

    expect(() =>
      client.createPayload({
        model: 'gpt-4',
        messages: [{ role: 'user', content: 'x' }],
        maxTokens: 0,
      })
    ).toThrow('maxTokens must be between 1 and Infinity (zero not allowed)')
  })

  // completeChat:

  it('should return content and raw from a successful response', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: 'Hello!' } }],
      }),
    })

    const result = await client.completeChat({
      model: 'gpt-4',
      messages: [{ role: 'user', content: 'Hello' }],
    })

    expect(result.content).toBe('Hello!')
    expect(result.raw).toEqual({
      choices: [{ message: { content: 'Hello!' } }],
    })
  })

  it('should throw on HTTP error with JSON body', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ error: 'Bad request' }),
    })

    await expect(
      client.completeChat({
        model: 'gpt-4',
        messages: [{ role: 'user', content: 'fail' }],
      })
    ).rejects.toThrow(/OpenRouter error: 400/)
  })

  it('should throw on HTTP error with text fallback', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => {
        throw new Error('bad json')
      },
      text: async () => 'Internal Server Error',
    })

    await expect(
      client.completeChat({
        model: 'gpt-4',
        messages: [{ role: 'user', content: 'error' }],
      })
    ).rejects.toThrow(/OpenRouter error: 500/)
  })
})

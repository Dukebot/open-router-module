const { jsonrepair } = require('jsonrepair')
const { OpenRouterService, OpenRouterClient } = require('..')

jest.mock('jsonrepair', () => ({
  jsonrepair: jest.fn(str => str.replace(/,}/g, '}')), // Simulación simple
}))

describe('OpenRouterService', () => {
  const mockClient = new OpenRouterClient({ apiKey: 'mock-key' })

  it('should throw an error if a valid OpenRouterClient is not provided', () => {
    expect(() => new OpenRouterService(null)).toThrow('Client must be and instance of OpenRouterClient')
    expect(() => new OpenRouterService({})).toThrow()
  })

  it('should create a valid instance with a proper client', () => {
    const service = new OpenRouterService(mockClient)
    expect(service.client).toBe(mockClient)
  })

  it('should build messages from prompt and system correctly', () => {
    const service = new OpenRouterService(mockClient)
    const messages = service.createMessages('Hello', 'System')

    expect(messages).toEqual([
      { role: 'system', content: 'System' },
      { role: 'user', content: 'Hello' },
    ])
  })

  it('should throw if prompt is missing or not a string', () => {
    const service = new OpenRouterService(mockClient)
    expect(() => service.createMessages(null)).toThrow('prompt has to be a string')
    expect(() => service.createMessages(123)).toThrow('prompt has to be a string')
  })

  it('should throw if system is not a string', () => {
    const service = new OpenRouterService(mockClient)
    expect(() => service.createMessages('Hi', {})).toThrow('system has to be a string')
  })

  it('should call client.completeChat with prompt priority over messages', async () => {
    const service = new OpenRouterService(mockClient)

    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})
    mockClient.completeChat = jest.fn().mockResolvedValue({ content: 'OK' })

    await service.completeChat({
      prompt: 'Hola',
      messages: [{ role: 'user', content: 'ignored' }],
      system: 'Sys',
      model: 'gpt-4',
    })

    expect(warnSpy).toHaveBeenCalledWith('[OpenRouterService] prompt has priority over messages – messages will be ignored')

    expect(mockClient.completeChat).toHaveBeenCalledWith(
      expect.objectContaining({
        messages: [
          { role: 'system', content: 'Sys' },
          { role: 'user', content: 'Hola' },
        ],
      }),
      expect.any(Object)
    )

    warnSpy.mockRestore()
  })

  it('should return raw response if responseAsJson is false', async () => {
    const service = new OpenRouterService(mockClient)
    const rawResponse = { content: 'response' }

    mockClient.completeChat = jest.fn().mockResolvedValue(rawResponse)

    const result = await service.completeChat({
      prompt: 'Test',
      model: 'gpt-4',
    })

    expect(result).toBe(rawResponse)
  })

  it('should parse JSON if responseAsJson is true and JSON is clean', async () => {
    const service = new OpenRouterService(mockClient)

    const cleanJson = '{ "ok": true }'
    mockClient.completeChat = jest.fn().mockResolvedValue({ content: cleanJson })

    const result = await service.completeChat({
      prompt: 'Test',
      model: 'gpt-4',
      responseAsJson: true,
    })

    expect(result.json).toEqual({ ok: true })
    expect(result.jsonRepaired).toBe(false)
  })

  it('should repair and parse malformed JSON if needed', async () => {
    const service = new OpenRouterService(mockClient)

    const brokenJson = '{ "value": 1,}'
    jsonrepair.mockImplementation(() => '{ "value": 1 }')

    mockClient.completeChat = jest.fn().mockResolvedValue({ content: brokenJson })

    const result = await service.completeChat({
      prompt: 'Test',
      model: 'gpt-4',
      responseAsJson: true,
    })

    expect(result.json).toEqual({ value: 1 })
    expect(result.jsonRepaired).toBe(true)
  })

  it('should throw if JSON is irreparable', async () => {
    const service = new OpenRouterService(mockClient)

    const unrecoverable = '<<invalid>>'
    mockClient.completeChat = jest.fn().mockResolvedValue({ content: unrecoverable })
    jsonrepair.mockImplementation(() => '{ broken json }')

    await expect(
      service.completeChat({
        prompt: 'Test',
        model: 'gpt-4',
        responseAsJson: true,
      })
    ).rejects.toThrow('[OpenRouterService] JSON parse error:')
  })
})

const { OpenRouterAgent, OpenRouterService, OpenRouterClient } = require('..')

describe('OpenRouterAgent', () => {
  const mockClient = new OpenRouterClient({ apiKey: 'test' })
  const mockService = new OpenRouterService(mockClient)

  const fullConfig = {
    name: 'test-agent',
    referer: 'https://example.com',
    title: 'AgentTest',
    system: 'You are a helpful assistant.',
    model: 'gpt-4',
    temperature: 0.7,
    topP: 0.9,
    maxTokens: 100,
    frequencyPenalty: 0.2,
    presencePenalty: 0.3,
    responseAsJson: true,
  }

  it('should throw if service is not an instance of OpenRouterService', () => {
    expect(() => new OpenRouterAgent(null, fullConfig)).toThrow('OpenRouterService instance is required')
  })

  it('should throw if model is missing or invalid', () => {
    expect(() => new OpenRouterAgent(mockService, { ...fullConfig, model: undefined })).toThrow(
      'model is required and must be a string'
    )
  })

  it('should throw if system prompt is missing or invalid', () => {
    expect(() => new OpenRouterAgent(mockService, { ...fullConfig, system: null })).toThrow(
      'system prompt is required and must be a string'
    )
  })

  it('should store configuration properties correctly', () => {
    const agent = new OpenRouterAgent(mockService, fullConfig)

    expect(agent.name).toBe(fullConfig.name)
    expect(agent.model).toBe(fullConfig.model)
    expect(agent.system).toBe(fullConfig.system)
    expect(agent.temperature).toBe(fullConfig.temperature)
    expect(agent.responseAsJson).toBe(true)
  })

  it('should default responseAsJson to false if not provided', () => {
    const config = { model: 'gpt-4', system: 'Sys' }
    const agent = new OpenRouterAgent(mockService, config)
    expect(agent.responseAsJson).toBe(undefined)
  })

  it('should call service.completeChat with the correct merged options', async () => {
    const agent = new OpenRouterAgent(mockService, fullConfig)

    const prompt = 'What is the weather like today?'
    const expectedResponse = { content: 'Sunny and 25°C' }

    mockService.completeChat = jest.fn().mockResolvedValue(expectedResponse)

    const result = await agent.completeChat({ prompt })

    expect(mockService.completeChat).toHaveBeenCalledWith({
      prompt,
      system: fullConfig.system,
      model: fullConfig.model,
      referer: fullConfig.referer,
      title: fullConfig.title,
      temperature: fullConfig.temperature,
      topP: fullConfig.topP,
      maxTokens: fullConfig.maxTokens,
      frequencyPenalty: fullConfig.frequencyPenalty,
      presencePenalty: fullConfig.presencePenalty,
      responseAsJson: fullConfig.responseAsJson,
    })

    expect(result).toBe(expectedResponse)
  })

  it('should propagate errors thrown by the service', async () => {
    const agent = new OpenRouterAgent(mockService, fullConfig)

    mockService.completeChat = jest.fn().mockRejectedValue(new Error('Internal error'))

    await expect(agent.completeChat({ prompt: 'Test' })).rejects.toThrow('Internal error')
  })

  it('should support minimal config (model + system only)', async () => {
    const minimalConfig = {
      model: 'gpt-4',
      system: 'You are concise.',
    }

    const agent = new OpenRouterAgent(mockService, minimalConfig)
    mockService.completeChat = jest.fn().mockResolvedValue({ content: 'ok' })

    const result = await agent.completeChat({ prompt: 'Hello' })

    expect(mockService.completeChat).toHaveBeenCalledWith(
      expect.objectContaining({
        model: 'gpt-4',
        system: 'You are concise.',
        prompt: 'Hello',
      })
    )

    expect(result.content).toBe('ok')
  })
})

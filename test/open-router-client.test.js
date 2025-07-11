const OpenRouterClient = require('../src/open-router-client')

describe('OpenRouterClient', () => {
  it('debería lanzar error si no se pasa apiKey', () => {
    expect(() => new OpenRouterClient({})).toThrow('apiKey is required and must be a string.')
  })

  it('debería lanzar error si apiKey no es string', () => {
    expect(() => new OpenRouterClient({ apiKey: 123 })).toThrow('apiKey is required and must be a string.')
  })

  it('debería crear una instancia válida con apiKey', () => {
    const client = new OpenRouterClient({ apiKey: 'clave123' })
    expect(client.apiKey).toBe('clave123')
  })

  it('debería devolver el endpoint correcto', () => {
    const client = new OpenRouterClient({ apiKey: 'x' })
    expect(client.endpoint).toBe('https://openrouter.ai/api/v1/chat/completions')
  })

  it('debería construir headers correctamente sin referer', () => {
    const client = new OpenRouterClient({ apiKey: 'mi-api' })
    const headers = client.createHeaders()
    expect(headers).toMatchObject({
      Authorization: 'Bearer mi-api',
      'Content-Type': 'application/json'
    })
  })

  it('debería incluir X-Title si se pasa referer', () => {
    const client = new OpenRouterClient({ apiKey: 'mi-api' })
    const headers = client.createHeaders({ referer: 'https://misitio.com' })
    expect(headers['HTTP-Referer']).toBe('https://misitio.com')
  })
})

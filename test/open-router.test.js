const dotenv = require('dotenv')
const { OpenRouter } = require('..')

dotenv.config()

describe('OpenRouter', () => {
  it('debería crear una instancia', () => {
    const instance = new OpenRouter()
    expect(instance).toBeInstanceOf(OpenRouter)
  })
})
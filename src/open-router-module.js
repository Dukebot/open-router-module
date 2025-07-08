const OpenRouterClient = require('./open-router-client.js')
const OpenRouterService = require('./open-router-service.js')
const OpenRouterAgent = require('./open-router-agent.js')

/**
 * Main module that bundles OpenRouterClient, OpenRouterService, and provides an agent factory.
 * Useful as an entry point for creating agents with shared configuration.
 */
class OpenRouterModule {
  /**
   * @param {Object} options
   * @param {string} [options.apiKey=process.env.OPEN_ROUTER_API_KEY] - OpenRouter API key
   */
  constructor({ apiKey = process.env.OPEN_ROUTER_API_KEY }) {
    this.client = new OpenRouterClient({ apiKey })
    this.service = new OpenRouterService(this.client)
  }

  /**
   * @returns {string} The current API key in use
   */
  get apiKey() {
    return this.client.apiKey
  }

  /**
   * Creates a new agent instance bound to this module's service.
   *
   * @param {Object} options - Configuration for the new agent (see OpenRouterAgent)
   * @returns {OpenRouterAgent}
   */
  createAgent(options) {
    return new OpenRouterAgent(this.service, options)
  }
}

module.exports = OpenRouterModule

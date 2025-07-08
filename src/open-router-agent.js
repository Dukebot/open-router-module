const OpenRouterService = require('./open-router-service')

/**
 * Wrapper agent around OpenRouterService for pre-configured completions.
 * Each agent instance has a fixed identity, model, and system prompt.
 */
class OpenRouterAgent {
  /**
   * @param {OpenRouterService} service - Valid instance of OpenRouterService
   * @param {Object} config - Agent configuration
   * @param {string} [config.name] - Agent name (for identification or logging)
   * @param {string} [config.referer] - Optional HTTP-Referer for requests
   * @param {string} [config.title] - Optional X-Title header to identify the client
   * @param {string} config.system - System prompt used in every request
   * @param {string} config.model - Model name (e.g., gpt-4o, mistral, etc.)
   * @param {number} [config.temperature] - Sampling temperature
   * @param {number} [config.topP] - Nucleus sampling parameter
   * @param {number} [config.maxTokens] - Maximum number of tokens in the response
   * @param {number} [config.frequencyPenalty] - Frequency penalty for repetition
   * @param {number} [config.presencePenalty] - Penalty to encourage new topics
   * @param {boolean} [config.responseAsJson=false] - Whether to parse the response as JSON
   * @throws {Error} If required fields are missing or invalid
   */
  constructor(
    service,
    {
      name,
      referer,
      title,
      system,
      model,
      temperature,
      topP,
      maxTokens,
      frequencyPenalty,
      presencePenalty,
      responseAsJson,
    }
  ) {
    if (!(service instanceof OpenRouterService)) {
      throw new Error('OpenRouterService instance is required')
    }
    if (!model || typeof model !== 'string') {
      throw new Error('model is required and must be a string')
    }
    if (!system || typeof system !== 'string') {
      throw new Error('system prompt is required and must be a string')
    }

    this.service = service

    // Identity
    this.name = name
    this.referer = referer
    this.title = title

    // Model and system configuration
    this.model = model
    this.system = system
    this.temperature = temperature
    this.topP = topP
    this.maxTokens = maxTokens
    this.frequencyPenalty = frequencyPenalty
    this.presencePenalty = presencePenalty

    // Output format
    this.responseAsJson = responseAsJson
  }

  /**
   * Sends a prompt to the model using the agent's configuration.
   *
   * @param {Object} options
   * @param {string} options.prompt - User input prompt
   * @returns {Promise<Object>} Full response from the model (may include `.json` field)
   */
  async completeChat({ prompt }) {
    return await this.service.completeChat({
      prompt,
      system: this.system,
      model: this.model,
      referer: this.referer,
      title: this.title,
      temperature: this.temperature,
      topP: this.topP,
      maxTokens: this.maxTokens,
      frequencyPenalty: this.frequencyPenalty,
      presencePenalty: this.presencePenalty,
      responseAsJson: this.responseAsJson,
    })
  }
}

module.exports = OpenRouterAgent

const { jsonrepair } = require('jsonrepair')
const OpenRouterClient = require('./open-router-client.js')

/**
 * High-level service that encapsulates logic for interacting with OpenRouterClient.
 * Adds support for simplified messages (prompt + system) and parsed JSON responses.
 */
class OpenRouterService {
  /**
   * @param {OpenRouterClient} client - Valid instance of OpenRouterClient
   * @throws {Error} If the client is not a valid instance
   */
  constructor(client) {
    if (!(client instanceof OpenRouterClient)) {
      throw new Error("Client must be and instance of OpenRouterClient")
    }
    this.client = client
  }

  /**
   * Sends a prompt or message list to the configured model.
   * Optionally attempts to parse the response as JSON if a structure is expected.
   *
   * @param {Object} options
   * @param {string} [options.prompt] - User input (simplified mode)
   * @param {string} [options.system] - Optional system message
   * @param {boolean} [options.responseAsJson=false] - If true, tries to parse the response as JSON
   * @param {string} [options.referer] - Optional HTTP-Referer
   * @param {string} [options.title] - Optional X-Title to identify the client
   * @param {string} options.model - Model to use (e.g., gpt-4o, mistral, etc.)
   * @param {Array<{ role: 'system' | 'user' | 'assistant', content: string }>} [options.messages] - Message list (ignored if `prompt` is used)
   * @param {number} [options.temperature] - Response randomness
   * @param {number} [options.maxTokens] - Output token limit
   * @param {number} [options.topP] - Cumulative probability
   * @param {number} [options.frequencyPenalty] - Frequency penalty
   * @param {number} [options.presencePenalty] - Presence penalty
   * @param {string[]} [options.stop] - Stop sequences
   * @returns {Promise<Object>} Original API response and optional `json` field if `responseAsJson` is true
   */
  async completeChat({
    prompt,
    system,
    responseAsJson,
    referer,
    title,
    model,
    messages,
    temperature,
    maxTokens,
    topP,
    frequencyPenalty,
    presencePenalty,
    stop,
  }) {
    if (prompt && messages) {
      console.warn('[OpenRouterService] prompt has priority over messages – messages will be ignored')
    }

    const headerParams = { referer, title }
    const payloadParams = {
      model,
      messages: prompt ? this.createMessages(prompt, system) : messages,
      temperature,
      maxTokens,
      topP,
      frequencyPenalty,
      presencePenalty,
      stop,
    }

    console.log(`${this.constructor.name}: completeChat model ${model}`)

    const response = await this.client.completeChat(payloadParams, headerParams)
    response.headerParams = headerParams
    response.payloadParams = payloadParams

    return responseAsJson ? this.processJsonResponse(response) : response
  }

  /**
   * Converts a prompt and optional system message into the message format compatible with OpenRouter.
   *
   * @param {string} prompt - Main user input
   * @param {string} [system] - Optional system message
   * @returns {Array<{ role: 'system' | 'user', content: string }>} Formatted messages
   * @throws {Error} If parameters are not valid strings
   */
  createMessages(prompt, system) {
    if (!prompt || typeof prompt !== 'string') {
      throw new Error('prompt has to be a string')
    }
    if (system && typeof system !== 'string') {
      throw new Error('system has to be a string')
    }
    const messages = []
    if (system) {
      messages.push({ role: 'system', content: system })
    }
    messages.push({ role: 'user', content: prompt })
    return messages
  }

  /**
   * Attempts to parse the response content as valid JSON.
   * Uses `jsonrepair` to fix malformed structures if parsing fails.
   *
   * @param {Object} response - Original response from OpenRouterClient
   * @param {string} response.content - Generated string from the model
   * @returns {Object} Response object with `.json` property and `.jsonRepaired` flag
   * @throws {Error} If parsing fails
   */
  processJsonResponse(response) {
    function sanitizeJsonString(input) {
      let output = input.trim()
      // Remove markdown-style wrappers
      return output.replace(/```json\s*|\s*```/gi, '')
    }

    const jsonString = sanitizeJsonString(response.content)

    try {
      response.json = JSON.parse(jsonString)
      response.jsonRepaired = false
    } catch (err) {
      const jsonStringRepaired = jsonrepair(jsonString)
      try {
        response.json = JSON.parse(jsonStringRepaired)
        response.jsonRepaired = true
      } catch (error) {
        console.error(
          `[OpenRouterService] Error parsing this JSON with model ${response.payloadParams.model}`,
          jsonStringRepaired
        )
        throw new Error(`[OpenRouterService] JSON parse error: ${err.message}`)
      }
    }

    return response
  }
}

module.exports = OpenRouterService

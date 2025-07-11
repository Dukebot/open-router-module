/**
 * High-level client for interacting with the OpenRouter /chat/completions endpoint.
 * Allows sending ChatGPT-style messages to models like GPT-4o, Claude, Mistral, or DeepSeek.
 * List of available models: "https://openrouter.ai/models?fmt=cards".
 */
class OpenRouterClient {
  /**
   * @param {Object} options
   * @param {string} options.apiKey - OpenRouter API key
   * @throws {Error} If a valid apiKey is not provided
   */
  constructor({ apiKey }) {
    if (!apiKey || typeof apiKey !== 'string') {
      throw new Error('apiKey is required and must be a string.')
    }
    this.apiKey = apiKey
  }

  /**
   * @returns {string} URL of the OpenRouter chat completions endpoint
   */
  get endpoint() {
    return 'https://openrouter.ai/api/v1/chat/completions'
  }

  /**
   * Creates the necessary headers for a request to OpenRouter.
   *
   * @param {Object} [options]
   * @param {string} [options.referer] - Optional HTTP referer (used for tracking)
   * @param {string} [options.title] - Title of the client app
   * @returns {Object} Headers for fetch
   */
  createHeaders({ referer, title } = {}) {
    const headers = {
      Authorization: `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    }

    if (referer) headers['HTTP-Referer'] = referer
    if (title) headers['X-Title'] = title
    
    return headers
  }

  /**
   * Validates and builds the payload to be sent to the completions endpoint.
   *
   * @param {Object} options
   * @param {string} options.model - Model name (e.g., gpt-4o, mistral, etc.)
   * @param {Array<{ role: 'system' | 'user' | 'assistant', content: string }>} options.messages - Chat history messages
   * @param {number} [options.temperature] - Controls randomness (0–2)
   * @param {number} [options.maxTokens] - Maximum number of tokens in the response
   * @param {number} [options.topP] - Cumulative probability (0–1)
   * @param {number} [options.frequencyPenalty] - Penalizes repetition (-2 to 2)
   * @param {number} [options.presencePenalty] - Encourages new topics (-2 to 2)
   * @param {string[]} [options.stop] - Optional stop sequences
   * @returns {Object} Payload ready to be sent to the API
   * @throws {Error} If any parameter is invalid
   */
  createPayload({ model, messages, temperature, maxTokens, topP, frequencyPenalty, presencePenalty, stop }) {
    if (!model || typeof model !== 'string') throw new Error('model must be a string')

    if (!Array.isArray(messages)) throw new Error('messages must be an array')
    for (const message of messages) {
      if (typeof message !== 'object' || !message.role || !message.content) {
        throw new Error("Each message must be an object with 'role' and 'content'")
      }
    }

    const isNum = val => typeof val === 'number' && !isNaN(val)
    const validateNum = (name, value, min, max, allowZero = true) => {
      if (value === undefined) return
      if (!isNum(value)) throw new Error(`${name} must be a number`)
      if (value < min || value > max || (!allowZero && value === 0)) {
        throw new Error(`${name} must be between ${min} and ${max}${allowZero ? '' : ' (zero not allowed)'}`)
      }
    }

    validateNum('temperature', temperature, 0, 2)
    validateNum('topP', topP, 0, 1)
    validateNum('frequencyPenalty', frequencyPenalty, -2, 2)
    validateNum('presencePenalty', presencePenalty, -2, 2)
    validateNum('maxTokens', maxTokens, 1, Infinity, false)

    if (stop !== undefined) {
      if (!Array.isArray(stop) || !stop.every(s => typeof s === 'string')) {
        throw new Error('stop must be an array of strings or undefined')
      }
    }

    const payload = {
      model,
      messages,
      temperature,
      top_p: topP,
      frequency_penalty: frequencyPenalty,
      presence_penalty: presencePenalty,
      max_tokens: maxTokens,
      stop,
    }

    for (const key of Object.keys(payload)) {
      if (payload[key] === undefined) {
        delete payload[key]
      }
    }

    return payload
  }

  /**
   * Sends a completion request to the model and returns the generated content.
   *
   * @param {Object} payloadParams - Payload parameters (see `createPayload`)
   * @param {Object} [headerParams] - Optional extra headers (referer, title)
   * @returns {Promise<{ content: string, raw: any }>} Generated content and full response
   * @throws {Error} If a network or API error occurs
   */
  async completeChat(payloadParams, headerParams) {
    const payload = this.createPayload(payloadParams)
    const headers = this.createHeaders(headerParams)
    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        let errorText = `OpenRouter error: ${response.status}`
        try {
          const errorJson = await response.json()
          errorText += ` – ${JSON.stringify(errorJson)}`
        } catch {
          const fallbackText = await response.text()
          errorText += ` – ${fallbackText}`
        }
        throw new Error(errorText)
      }

      const json = await response.json()
      const content = json.choices?.[0]?.message?.content ?? null

      return {
        content,
        raw: json,
      }
    } catch (err) {
      console.error('[OpenRouterClient] Error:', err.message)
      throw err
    }
  }
}

module.exports = OpenRouterClient

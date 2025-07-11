# @dukebot/open-router

> Lightweight local client for interacting with the OpenRouter API (CommonJS format).

This package provides a modular way to call large language models like GPT-4o, Claude, Mistral or DeepSeek via [OpenRouter](https://openrouter.ai/), using a clean service-based structure and optional agent wrappers.

## 🚀 Features

- Simple wrapper around OpenRouter's `/chat/completions` endpoint.
- Flexible message structure: raw messages or `prompt + system`.
- Auto-parsing of JSON responses (with fallback via `jsonrepair`).
- Preconfigured agent system for clean multi-role usage.

---

## 📦 Installation

```bash
npm install @dukebot/open-router
```

> Requires Node.js `>=18` (for native `fetch` support).

---

## ⚡ Quick Example

```js
const { OpenRouter } = require('@dukebot/open-router')

const openRouter = new OpenRouter({ apiKey: process.env.OPEN_ROUTER_API_KEY })

const response = await openRouter.service.completeChat({
  prompt: 'What is the capital of Japan?',
  system: 'You are a helpful assistant.',
  model: 'openai/gpt-4o',
})

console.log(response.content) // → "The capital of Japan is Tokyo."
```

---

## 🧠 Agent Example

```js
const agent = openRouter.createAgent({
  model: 'openai/gpt-4o',
  system: 'You are a professional blog editor.',
  temperature: 0.7,
  responseAsJson: true,
})

const result = await agent.completeChat({ prompt: 'Write a short blog post about AI in 2025' })

console.log(result.json) // Parsed blog post structure (if response is valid JSON)
```

---

## 🧱 Modular Architecture

| Component            | Description                                                   |
|---------------------|---------------------------------------------------------------|
| `OpenRouterClient`  | Low-level fetcher for `/chat/completions`                     |
| `OpenRouterService` | Adds support for simplified prompts and JSON parsing          |
| `OpenRouterAgent`   | Fixed-configuration agent using a predefined system + model   |
| `OpenRouterModule`  | Bundles client + service and exposes agent factory            |

---

## 🔐 Environment

You can provide the API key directly or via environment variable:

```env
OPEN_ROUTER_API_KEY=your-api-key-here
```

---

## 🧪 Examples

Usage examples are located in the `/examples` folder.

To run the basic example:

```bash
node examples/simple.js
```

These scripts demonstrate common use cases such as:

- Basic prompt + system completions
- Agent-based completions with JSON output
- Error handling and logging

Feel free to duplicate and adapt them to your own needs.

---

## ✅ Tests

This package includes automated tests written in [Jest](https://jestjs.io/).

To run the test suite:

```bash
npm install
npm test
```

Tests are located in the `/tests` folder and cover core functionality such as `OpenRouterClient`, `OpenRouterService`, and `OpenRouterAgent`. Mocking is used to isolate logic and ensure consistent behavior.

---

## 📋 License

MIT © [Dukebot](https://github.com/dukebot)

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

| Component           | Description                                                      |
|--------------------|------------------------------------------------------------------|
| `OpenRouterClient`  | Low-level fetcher for `/chat/completions`                      |
| `OpenRouterService` | Adds support for simplified prompts and JSON parsing           |
| `OpenRouterAgent`   | Fixed-configuration agent using a predefined system + model    |
| `OpenRouterModule`  | Bundles client + service and exposes agent factory             |

---

## 🔐 Environment

You can provide the API key directly or via environment variable:

```env
OPEN_ROUTER_API_KEY=your-api-key-here
```

---

## 🧪 Testing Locally

```bash
node examples/simple.js
```

> You can create your own scripts in a local `/examples` folder for testing.

---

## 📋 License

MIT © [Dukebot](https://github.com/dukebot)

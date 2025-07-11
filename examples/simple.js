const { OpenRouter } = require('..')

const openRouter = new OpenRouter({ apiKey: process.env.OPEN_ROUTER_API_KEY })

async function runExample() {
  try {
    const response = await openRouter.service.completeChat({
      prompt: 'What is the capital of Japan?',
      system: 'You are a helpful assistant.',
      // model: 'openai/gpt-4o',
    })

    console.log('Response:', response.content)
  } catch (error) {
    console.error('Error:', error)
  }
}

runExample()
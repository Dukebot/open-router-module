const dotenv = require('dotenv')
const { OpenRouter } = require('..')

dotenv.config()

const openRouter = new OpenRouter({ apiKey: process.env.OPEN_ROUTER_API_KEY })

async function runExample() {
  try {
    const response = await openRouter.service.completeChat({
      prompt: 'What is the capital of Japan?',
      system: 'You are a helpful assistant.',
      model: 'deepseek/deepseek-chat-v3-0324:free',
    })

    console.log('Response:', response.content)
  } catch (error) {
    console.error('Error:', error)
  }
}

runExample()
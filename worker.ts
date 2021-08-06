/// <reference lib="webworker" />

// This is a module worker, so we can use imports (in the browser too!)
import { solve } from './solver/solver'
let shouldContinue = true

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

addEventListener('message', async (event) => {
  if (event.data.type === 'start' || event.data.type === 'stop') {
    shouldContinue = false
    await sleep(1)
  }
  if (event.data.type === 'start') {
    let i = 0
    const input = event.data.input
    for (const x of solve(...input)) {
      postMessage({
        type: 'result',
        ...x,
        formatted: `${x.expression.join(' ')} = ${x.output} :: (${x.distance})`,
      })
      if (++i % 5000 === 0) {
        await sleep(1)
        if (!shouldContinue) break
      }
    }
  }
})

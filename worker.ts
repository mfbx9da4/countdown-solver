/// <reference lib="webworker" />

// This is a module worker, so we can use imports (in the browser too!)
import { solve } from './solver/solver'
let shouldContinue = true

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

addEventListener('message', async (event) => {
  let i = 0
  if (event.data.type === 'start' || event.data.type === 'stop') {
    if (event.data.type === 'stop') console.log('done', i) // eslint-disable-line no-console
    shouldContinue = false
    await sleep(1)
    i = 0
    shouldContinue = true
  }
  if (event.data.type === 'start') {
    const input = event.data.input as Parameters<typeof solve> // TODO: fix this
    // const input = [283, [75, 25, 8, 10, 5, 3]]
    for (const x of solve(...input)) {
      postMessage({
        type: 'result',
        ...x,
        formatted: `${x.expression.join(' ')} = ${x.output}`,
      })
      if (++i % 1000 === 0) {
        console.log('generated', i) // eslint-disable-line no-console
        await sleep(1)
        if (!shouldContinue) break
      }
    }
  }
})

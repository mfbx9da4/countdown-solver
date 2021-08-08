/// <reference lib="webworker" />

// This is a module worker, so we can use imports (in the browser too!)
import { solve } from './solver/solver'
let shouldContinue = true
let i = 0
let strings = new Set<string>()

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

addEventListener('message', async (event) => {
  if (event.data.type === 'start' || event.data.type === 'stop') {
    shouldContinue = false
  }
  if (event.data.type === 'start') {
    strings = new Set<string>()
    i = 0
    shouldContinue = true
    const input = event.data.input as Parameters<typeof solve> // TODO: fix this
    for (const x of solve(...input)) {
      const asStr = x.expression.join(' ')
      if (strings.has(asStr)) {
        // console.log('dupe', asStr)
      } else {
        strings.add(asStr)
        postMessage({
          type: 'result',
          ...x,
          formatted: `${asStr} = ${x.output} :: (${x.distance})`,
        })
      }
      if (++i % 20000 === 0) {
        console.log('generated', i) // eslint-disable-line no-console
        await sleep(0)
        if (!shouldContinue) {
          console.log('break') // eslint-disable-line no-console
          break
        }
      }
    }
    console.log('done', i) // eslint-disable-line no-console
  }
})

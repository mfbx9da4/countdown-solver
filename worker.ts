/// <reference lib="webworker" />

import { solve } from './solver/solver'
let shouldContinue = true
let i = 0
let strings = new Set<string>()

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

addEventListener('message', async (event) => {
  if (event.data.type === 'start' || event.data.type === 'stop') {
    shouldContinue = false
    // TODO: this is flakey, race condition, is it not a queue?
    // wait for the the ack that the iterator has stopped
    await sleep(0)
  }
  if (event.data.type === 'start') {
    strings = new Set<string>()
    i = 0
    shouldContinue = true
    const input = event.data.input as Parameters<typeof solve>
    for (const x of solve(...input)) {
      const asStr = x.expression.join(' ')
      if (!strings.has(asStr)) {
        // we can get duplicates if the list has dupes
        strings.add(asStr)
        postMessage({ type: 'result', ...x, permutations: i })
      }
      if (++i % 20000 === 0) {
        await sleep(0)
        if (!shouldContinue) {
          break
        }
      }
    }
    postMessage({ type: 'done', permutations: i })
  }
})

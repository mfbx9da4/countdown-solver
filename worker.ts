/// <reference lib="webworker" />

import { solve } from './solver/solver'
import { AbortSignal } from './utils/AbortSignal'
let abortSignal: AbortSignal | undefined

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const start = async (input: Parameters<typeof solve>) => {
  abortSignal = new AbortSignal()
  let i = 0
  const strings = new Set<string>()
  for (const x of solve(...input)) {
    const asStr = x.expression.join(' ')
    if (!strings.has(asStr)) {
      // we can get duplicates if the list has dupes
      strings.add(asStr)
      postMessage({ type: 'result', ...x, permutations: i })
    }
    if (++i % 20000 === 0) {
      await sleep(0)
      if (abortSignal.pending) break
    }
  }
  postMessage({ type: 'done', permutations: i })
  abortSignal.done()
}

addEventListener('message', async (event) => {
  if (event.data.type === 'start' || event.data.type === 'stop') {
    if (abortSignal) await abortSignal.abort()
  }
  if (event.data.type === 'start') {
    await start(event.data.input)
  }
})

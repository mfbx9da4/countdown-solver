/// <reference lib="webworker" />

import { solve } from './solver/solver'
import { Result } from './solver/Result'
import { AbortSignal } from './utils/AbortSignal'
let abortSignal: AbortSignal | undefined

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export type DisplayResult = Result & {
  type: 'result'
  permutations: number
}

const start = async (input: Parameters<typeof solve>) => {
  abortSignal = new AbortSignal()
  let i = 0
  const strings = new Set<string>()
  for (const x of solve(...input)) {
    const asStr = x.resultId
    if (!strings.has(asStr)) {
      // we can get duplicates if the input list has dupes
      strings.add(asStr)
      const result: DisplayResult = { type: 'result', permutations: i, ...x }
      // console.log('result', result)
      postMessage(result)
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

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
  const strings: { [k: string]: number } = {}
  for (const x of solve(...input)) {
    const asStr = x.resultId
    if (!(asStr in strings)) {
      // we can get duplicates if the input list has dupes
      const result: DisplayResult = { type: 'result', permutations: i, ...x }
      // console.log('result', result)
      postMessage(result)
    }
    strings[asStr] = (strings[asStr] || 0) + 1
    if (++i % 20000 === 0) {
      console.log('i', i)
      await sleep(0)
      if (abortSignal.pending) break
    }
  }
  postMessage({ type: 'done', permutations: i })
  abortSignal.done()
  console.log(
    'strings',
    Object.fromEntries(Object.entries(strings).filter((x) => x[1] > 1))
  )
}

addEventListener('message', async (event) => {
  if (event.data.type === 'start' || event.data.type === 'stop') {
    if (abortSignal) await abortSignal.abort()
  }
  if (event.data.type === 'start') {
    await start(event.data.input)
  }
})

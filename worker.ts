/// <reference lib="webworker" />

import { Result, solve } from './solver/solver'
import { AbortSignal } from './utils/AbortSignal'
let abortSignal: AbortSignal | undefined

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export type DisplayResult = Result & {
  type: 'result'
  path: string[]
  permutations: number
}

const formatPath = (x: Result) => {
  const path: string[] = [x.expression[0].toString()]
  for (let i = 1; i < x.expression.length; i += 2) {
    const char = `${x.expression[i]}${x.expression[i + 1]}`
    path.push(char)
  }
  return path
}

const start = async (input: Parameters<typeof solve>) => {
  abortSignal = new AbortSignal()
  let i = 0
  const strings = new Set<string>()
  for (const x of solve(...input)) {
    const asStr = x.expression.join(' ')
    if (!strings.has(asStr)) {
      // we can get duplicates if the input list has dupes
      strings.add(asStr)
      const path = formatPath(x)
      const result: DisplayResult = {
        type: 'result',
        path,
        ...x,
        permutations: i,
      }
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

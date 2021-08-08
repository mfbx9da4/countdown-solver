/// <reference lib="webworker" />

import { solve } from './solver/solver'
let abortController = new AbortController()

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const start = async (input: Parameters<typeof solve>) => {
  abortController = new AbortController()
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
      if (abortController.signal.aborted) {
        break
      }
    }
  }
  postMessage({ type: 'done', permutations: i })
}

const createQueue = () => {
  let tasks = []
  let running = false
  const run = async () => {
    running = true
    while (tasks.length) {
      const fn = tasks.pop()
      await fn()
    }
    running = false
  }
  const push = (fn) => {
    tasks[0] = fn
    if (!running) run()
  }
  return { push }
}

const queue = createQueue()

addEventListener('message', async (event) => {
  if (event.data.type === 'start' || event.data.type === 'stop') {
    abortController.abort()
  }
  if (event.data.type === 'start') {
    queue.push(() => start(event.data.input))
  }
})

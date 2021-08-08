const ops = ['*', '/', '+', '-'] as const
type Op = typeof ops[number]
const open = '('
const close = ')'
type Paren = typeof open | typeof close
type Expression = Array<Op | Paren | number>

/**
 * Not sure how to encode this finite state machine in
 * types. Maybe with conditional types?
 * start: [open, num]
 * open: [open, num]
 * num: [op, end]
 * op: [num, open]
 * close: [op, end]
 */
type State = 'start' | 'open' | 'num' | 'close'

interface Node {
  expression: Expression
  openCount: number
  balance: number
  remaining: number[]
  state: State
  /** distance to the target */
  priority: number
}

interface Result {
  expression: Expression
  output: number
  distance: number
}

class MinHeap<T extends { priority: number }> {
  private heap: T[] = []
  push(node: T) {
    // TODO: implement
    this.heap.push(node)
  }
  pop() {
    // TODO: implement
    return this.heap.pop()
  }

  get length() {
    return this.heap.length
  }
}

function closeTrailingParens(node: Node) {
  let balance = node.balance
  const expression = [...node.expression]
  while (balance > 0) {
    expression.push(close)
    balance--
  }
  return expression
}

function evaluate(expression: Expression): number {
  try {
    return eval(expression.join(''))
  } catch (e) {
    console.log('failed to evaluate', expression.join('')) // eslint-disable-line
    return NaN
  }
}

/**
 * the idea of this variant is to add one char at a time
 * so that we can have beautiful tree like visualizations.
 */
export function* solve(target: number, inputs: number[]) {
  if (!inputs.length) throw new Error('no inputs')
  const root: Node = {
    expression: [],
    balance: 0,
    openCount: 0,
    priority: target,
    remaining: inputs,
    state: 'start',
  }
  const results: Result[] = []
  const heap = new MinHeap<Node>()
  heap.push(root)
  while (heap.length) {
    const node = heap.pop()

    // console.log('node.state', node)

    if (node.state === 'start') {
      for (let i = 0; i < node.remaining.length; i++) {
        // pick a number from remaining
        const num = node.remaining[i]
        const remaining = [
          ...node.remaining.slice(0, i),
          ...node.remaining.slice(i + 1),
        ]
        const child: Node = {
          ...node,
          remaining,
          expression: [...node.expression, num],
          state: 'num',
        }
        heap.push(child)
      }

      if (node.openCount < inputs.length - 2 && node.remaining.length >= 2) {
        // open a paren
        const child: Node = {
          ...node,
          expression: [...node.expression, open],
          balance: node.balance + 1,
          openCount: node.openCount + 1,
          state: 'start',
        }
        heap.push(child)
      }
    }

    if (node.state === 'num' || node.state === 'close') {
      const expression = closeTrailingParens(node)
      const output = evaluate(expression)
      const distance = Math.abs(target - output)
      if (isNaN(output)) continue
      const result: Result = { expression, output, distance }
      results.push(result)
      yield result

      if (node.remaining.length !== 0) {
        // add an op
        for (const op of ops) {
          const child: Node = {
            ...node,
            expression: [...node.expression, op],
            priority: distance,
            state: 'start',
          }
          heap.push(child)
        }
      }
    }

    if (
      node.state === 'num' &&
      node.balance > 0 &&
      last(node.expression) !== open &&
      last(node.expression, -2) !== open
    ) {
      // close a paren
      const child: Node = {
        ...node,
        expression: [...node.expression, close],
        balance: node.balance - 1,
        state: 'close',
      }
      heap.push(child)
    }
  }
  return results
}

const last = <T>(arr: T[], i = -1) => arr[arr.length + i]

// .state num
// node.state close
// node.state start
// node.state num
// node.state close
// node.state start
// node.state num
// node.state close
// node.state start
// node.state num
// node.state close
// node.state start
// node.state num
// node.state close
// node.state start
// node.state num
// node.state close
// node.state start
// node.state num
// node.state close

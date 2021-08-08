const ops = ['*', '/', '+', '-'] as const
const applyOp: Record<Op, (a: number, b: number) => number> = {
  '*': (a, b) => a * b,
  '/': (a, b) => a / b,
  '+': (a, b) => a + b,
  '-': (a, b) => a - b,
}
type Op = typeof ops[number]
const open = '('
const close = ')'
type Paren = typeof open | typeof close
type Expression = Array<Op | Paren | number>

interface Node {
  output?: number
  expression: Expression
  needsOp: boolean
  remaining: number[]
  /** distance to the target */
  priority: number
}

export interface Result {
  expression: Expression
  output: number
  distance: number
}

function evaluate(expression: Expression): number {
  try {
    let ret = 0
    let lastOp = '+'
    for (let i = 0; i < expression.length; i += 2) {
      const num = expression[i]
      ret = applyOp[lastOp](ret, num)
      lastOp = expression[i + 1] as Op
    }
    return ret
  } catch (e) {
    console.log('failed to evaluate', expression.join('')) // eslint-disable-line
    return NaN
  }
}

/**
 * Explores every permutation of the inputs.
 * Dedupes associative operations.
 */
export function* solve(
  target: number,
  inputs: number[]
): Generator<Result, void, Result> {
  if (!inputs.length) throw new Error('no inputs')
  const root: Node = {
    expression: [],
    needsOp: false,
    priority: target,
    remaining: inputs,
  }

  const heap = []
  heap.push(root)
  while (heap.length) {
    const node = heap.pop()

    if (node.needsOp) {
      let bestDistance = Infinity
      const output = evaluate(node.expression)
      // as per countdown rules can never go below zero, must be int
      const isValid = Number.isSafeInteger(output) && output > 0
      const distance = isValid ? Math.abs(target - output) : Infinity
      bestDistance = Math.min(distance, bestDistance)
      const result: Result = { expression: node.expression, output, distance }
      yield result
      if (!isValid) continue // early exit exploring further

      if (node.remaining.length !== 0) {
        // add an op
        for (const op of ops) {
          const child: Node = {
            ...node,
            output,
            expression: [...node.expression, op],
            priority: bestDistance,
            needsOp: false,
          }
          heap.push(child)
        }
      }
    } else {
      for (let i = 0; i < node.remaining.length; i++) {
        // pick a number from remaining
        const num = node.remaining[i]

        // Dedupes associative operations.
        const op = node.expression[node.expression.length - 1]
        const lastNum = node.expression[node.expression.length - 2]
        const lastOp = node.expression[node.expression.length - 3]
        if (
          op === '+' &&
          (lastOp === '+' || lastOp === undefined) &&
          num > lastNum
        ) {
          continue // dedupe addition
        }
        if (
          op === '*' &&
          (lastOp === '*' || lastOp === undefined) &&
          num > lastNum
        ) {
          continue // dedupe multiplication
        }

        const remaining = [
          ...node.remaining.slice(0, i),
          ...node.remaining.slice(i + 1),
        ]
        const child: Node = {
          ...node,
          remaining,
          expression: [...node.expression, num],
          needsOp: true,
        }
        heap.push(child)
      }
    }
  }
}

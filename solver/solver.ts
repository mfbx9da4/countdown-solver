const ops = ['*', '/', '+', '-'] as const
const applyOp: Record<Op, (a: number, b: number) => number> = {
  '*': (a, b) => a * b,
  '/': (a, b) => a / b,
  '+': (a, b) => a + b,
  '-': (a, b) => a - b,
}
export type Op = typeof ops[number]
const open = '('
const close = ')'
type Paren = typeof open | typeof close
export type Expression = Array<Op | Paren | number>

interface Node {
  outputs: number[]
  expression: Expression
  needsOp: boolean
  remaining: number[]
}

export interface Result {
  expression: Expression
  outputs: number[]
  distance: number
}

export function evaluatePair(a: number, b: number, op: Op): number {
  return applyOp[op](a, b)
}

function evaluate(node: Node) {
  return evaluatePair(
    node.outputs[node.outputs.length - 1] || 0,
    (node.expression[node.expression.length - 1] as number) || 0,
    (node.expression[node.expression.length - 2] as Op) || '+'
  )
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
    outputs: [],
    expression: [],
    needsOp: false,
    remaining: inputs,
  }

  const queue = []
  queue.push(root)
  while (queue.length) {
    const node = queue.pop()

    if (node.needsOp) {
      let bestDistance = Infinity
      const output = evaluate(node)
      // as per countdown rules can never go below zero, must be int
      const isValid = Number.isSafeInteger(output) && output > 0
      const distance = isValid ? Math.abs(target - output) : Infinity
      bestDistance = Math.min(distance, bestDistance)
      const outputs = [...node.outputs, output]
      const result: Result = { expression: node.expression, outputs, distance }
      yield result
      if (!isValid) continue // early exit from exploring further

      if (node.remaining.length !== 0) {
        // add an op
        for (const op of ops) {
          const child: Node = {
            ...node,
            outputs,
            expression: [...node.expression, op],
            needsOp: false,
          }
          queue.push(child)
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
        queue.push(child)
      }
    }
  }
}

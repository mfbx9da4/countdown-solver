import { MinHeap } from './MinHeap'

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
 * goal is to explore every permutation of the inputs.
 * We consider these unique permutations:
 *   3 - (4 + 5)
 *   3 - (5 + 4)
 *   3 - 4 - 5
 * or even these are considered unique
 *   3 + 3
 *   3 + 3
 * Even though mathematically they are the same expression rearranged.
 * We go through every permutation of numbers and every permutation of parens
 * the root is `(0)+(`
 * balance is `(` - `)`
 *
 *
 * much simpler approach is to do as I originally thought and two steps
 * one which build number op, number op
 * second which does paren permutations
 *
 *
 *
 * at every even step we can choose from one of the ops
 * at every odd step we can choose from:
 *  either: one of the remaining numbers
 *  or: an opening paren if the balance is < inputs.length + 1
 *  or: a closing paren if the balance is > 0 and prev not open paren
 * after every even step we can emit the expression
 * in evaluate we strip out empty () and add trailing close parens
 * and eval
 * we add the children to the min heap with a priority
 * priority will be difference to the target
 * a priority 0 is better
 * all evaluated expressions are added to a separate min heap
 * Enhancements:
 *  * add leading minus (-4 - 5) + 3
 *  * discard zero sums
 *  * handle non integer division
 *  * handle zero division
 *  * Remove unnecessary brackets
 *  * The order of the same number shouldn't matter
 *  * Under addition or multiplication order should not matter
 *  * Division can only be performed if it has no remainder
 *  * Smart parens - not needed if associative
 *    * if next and prev ops are associative - skip parens
 *  * If we've precomputed for the remaining distance then use it
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
  // const inputCounts: Record<number, number> = {}
  // for (const input of inputs) {
  //   inputCounts[input] = (inputCounts[input] || 0) + 1
  // }
  // const isValidComplement = (a: Expression, b: Expression) => {
  //   const totalCounts: Record<number, number> = {}
  //   for (const num of a) {
  //     if (typeof num === 'number') {
  //       totalCounts[num] = (totalCounts[num] || 0) + 1
  //       if (totalCounts[num] > inputCounts[num]) return false
  //     }
  //   }
  //   for (const num of b) {
  //     if (typeof num === 'number') {
  //       totalCounts[num] = (totalCounts[num] || 0) + 1
  //       if (totalCounts[num] > inputCounts[num]) return false
  //     }
  //   }
  //   return true
  // }

  // const precomputed = new Map<number, Expression>()
  const heap = new MinHeap<Node>()
  heap.push(root)
  while (heap.length) {
    const node = heap.pop()

    // console.log('node.state', node)

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
      // precomputed.set(output, node.expression)
      // try looking for if we have precomputed the complement
      // const complement = target / output
      // const complementExpression = precomputed.get(complement)
      // if (complementExpression) {
      //   if (isValidComplement(complementExpression, node.expression)) {
      //     yield {
      //       expression: [...node.expression, '*', ...complementExpression],
      //       output: target,
      //       distance: 0,
      //     }
      //   }
      // }
      // complement = output / target
      // complement = target - output
      // complement = output - target

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

        // if the op is + and last op is (+|undefined)
        // and num < last num - we can skip it
        // if the op is * and last op is (*|undefined)
        // and num < last num - we can skip it
        const op = node.expression[node.expression.length - 1]
        const lastNum = node.expression[node.expression.length - 2]
        const lastOp = node.expression[node.expression.length - 3]
        if (
          op === '+' &&
          (lastOp === '+' || lastOp === undefined) &&
          num > lastNum
        ) {
          continue
        }
        if (
          op === '*' &&
          (lastOp === '*' || lastOp === undefined) &&
          num > lastNum
        ) {
          continue
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

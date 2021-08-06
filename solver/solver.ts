const ops = ['*', '/', '+', '-'] as const
type Op = typeof ops[number]
const open = '('
const close = ')'
type Paren = typeof open | typeof close
type Expression = Array<Op | Paren | number>

interface Node {
  expression: Expression
  needsOp: boolean
  remaining: number[]
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

// function closeTrailingParens(node: Node) {
//   let balance = node.balance
//   const expression = [...node.expression]
//   while (balance > 0) {
//     expression.push(close)
//     balance--
//   }
//   return expression
// }

function parenthesize(expression: Expression): Expression[] {
  if (expression.length === 3) return [[open, ...expression, close]]
  if (expression.length < 3) return [expression]
  const ret: Expression[] = []
  ret.push(expression)
  for (let size = expression.length - 2; size > 2; size -= 2) {
    for (let i = 0; i <= expression.length - size; i += 2) {
      for (const before of parenthesize(expression.slice(0, i))) {
        for (const middle of parenthesize(expression.slice(i, i + size))) {
          for (const end of parenthesize(expression.slice(i + size))) {
            ret.push([...before, ...middle, ...end])
          }
        }
      }
    }
  }
  return ret
}

// const arg = [25, '+', 25, '+', 75]
// for (const p of parenthesize(arg)) {
//   console.log('r', p.join(''))
// }

function evaluate(expression: Expression): number {
  try {
    return eval(expression.join(''))
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
 *  * Smart parens - not needed if associative
 */
export function* solve(
  target: number,
  inputs: number[]
): Generator<Result, Result[], Result> {
  if (!inputs.length) throw new Error('no inputs')
  const root: Node = {
    expression: [],
    needsOp: false,
    priority: target,
    remaining: inputs,
  }
  const results: Result[] = []
  const heap = new MinHeap<Node>()
  heap.push(root)
  while (heap.length) {
    const node = heap.pop()

    // console.log('node.state', node)

    if (node.needsOp) {
      let distance = Infinity
      for (const expression of parenthesize(node.expression)) {
        const output = evaluate(expression)
        distance = Math.abs(target - output)
        if (isNaN(output)) continue
        const result: Result = { expression, output, distance }
        results.push(result)
        yield result
      }

      if (node.remaining.length !== 0) {
        // add an op
        for (const op of ops) {
          const child: Node = {
            ...node,
            expression: [...node.expression, op],
            priority: distance,
            needsOp: false,
          }
          heap.push(child)
        }
      }
    } else {
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
          needsOp: true,
        }
        heap.push(child)
      }
    }
  }
  return results
}

import { partitions } from './combinations'
import { Result as DisplayResult } from './Result'

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

export function evaluatePair(a: number, b: number, op: Op): number {
  return applyOp[op](a, b)
}

interface NumberNode {
  type: 'number'
  value: number
}
interface ExpressionNode {
  type: 'expression'
  value: number
  left: Node
  right: Node
  op: Op
}

type Node = NumberNode | ExpressionNode

function* generateExpression(remaining: number[]): Generator<Node, void, Node> {
  // console.log('remaining', remaining)
  if (remaining.length === 1) yield { type: 'number', value: remaining[0] }
  for (const partition of partitions(remaining)) {
    // console.log('partition', partition)
    for (const left of generateExpression(partition.left)) {
      for (const right of generateExpression(partition.right)) {
        for (const op of ops) {
          const value = evaluatePair(left.value, right.value, op)
          // const xl = format(left, 1).resultId
          // const xr = format(right, 1).resultId
          if (!isValid(value)) continue
          yield { type: 'expression', value, op, left, right }
        }
      }
    }
  }
}

function isValid(value: number) {
  return value > 0 && Number.isSafeInteger(value)
}

export function* solve(
  target: number,
  inputs: number[]
): Generator<DisplayResult, void, DisplayResult> {
  for (const expression of generateExpression(inputs)) {
    let res = format(expression, target).resultId
    // console.log(res)
    yield format(expression, target)
  }
}

function formatPath(node: Node): DisplayResult['path'] {
  if (node.type === 'number') {
    return [{ value: node.value.toString(), partialOutput: node.value }]
  }
  const ret: DisplayResult['path'] = []
  if (node.left.type === 'number') {
    ret.push({
      value: node.left.value.toString(),
      partialOutput: node.left.value,
    })
  } else {
    ret.push({ value: '(', partialOutput: node.left.value })
    ret.push(...formatPath(node.left))
    ret.push({ value: ')', partialOutput: node.left.value })
  }
  ret.push({ value: node.op, partialOutput: node.value })
  if (node.right.type === 'number') {
    ret.push({
      value: node.right.value.toString(),
      partialOutput: node.right.value,
    })
  } else {
    ret.push({ value: '(', partialOutput: node.right.value })
    ret.push(...formatPath(node.right))
    ret.push({ value: ')', partialOutput: node.right.value })
  }
  return ret
}

function format(node: Node, target: number): DisplayResult {
  const path = formatPath(node)
  return {
    output: node.value,
    distance: target - node.value,
    path,
    resultId: path.map((x) => x.value).join(' '),
  }
}

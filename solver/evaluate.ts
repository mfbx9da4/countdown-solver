import { Expression, evaluatePair, Op } from './solver'

export function evaluate(expression: Expression): number {
  try {
    let ret = 0
    let lastOp = '+'
    for (let i = 0; i < expression.length; i += 2) {
      const num = expression[i]
      ret = evaluatePair(ret, num as number, lastOp as Op)
      lastOp = expression[i + 1] as Op
    }
    return ret
  } catch (e) {
    console.log('failed to evaluate', expression.join('')) // eslint-disable-line
    return NaN
  }
}

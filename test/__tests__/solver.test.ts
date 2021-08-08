import { solve as solveIter } from '../../solver/solver'
import assert from 'assert'

const solve = (...args: Parameters<typeof solveIter>) => [...solveIter(...args)]

describe('solver', () => {
  it('base case', () => {
    const results = solve(1, [1])
    assert.strictEqual(results.length, 1, 'too many')
    const [result] = results
    assert.strictEqual(result.distance, 0, 'bad')
    expect(results).toMatchSnapshot()
  })

  it('2 permutations', () => {
    const results = solve(4, [1, 2])
    assert.strictEqual(results.length, 8, 'too many')
    const result = results.find((x) => x.distance === 1)
    assert.ok(result.distance, 'did not find closest')
    expect(results).toMatchSnapshot()
  })

  it('3 permutations', () => {
    const results = solve(5, [4, 2, 3])
    // console.log('results', results)
    assert.strictEqual(results.length, 8, 'too many')
    const result = results.find((x) => x.distance === 1)
    assert.ok(result.distance, 'did not find closest')
    expect(results).toMatchSnapshot()
  })
})

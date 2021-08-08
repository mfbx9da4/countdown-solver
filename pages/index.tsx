import { useCallback, useEffect, useState } from 'react'
import { Tree } from '../components/Tree'
import { BaseTreeNode, layout } from '../layout/layout'
import { choose, randInt } from '../randInt'

const bigOneGenerator = () => choose([25, 50, 75, 100])
const smallOneGenerator = () => {
  const smalls = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  return choose([...smalls, ...smalls])
}
const randomInputs = (size = 6) => {
  const bigOne = bigOneGenerator()
  const smallOne = smallOneGenerator()
  const ret: number[] = []
  let bigOnes = randInt(0, size - 2)
  let smallOnes = size - bigOnes
  while (bigOnes--) ret.push(bigOne())
  while (smallOnes--) ret.push(smallOne())
  return ret
}

const randomTarget = () => randInt(100, 999)

const worker =
  process.browser && new Worker(new URL('../worker.ts', import.meta.url))

export type Attributes = {
  char: string
  isOp?: boolean
  isLeaf?: boolean
  isTarget?: boolean
  expression?: string[]
  output?: number
  distance?: number
}

export const Home = (): JSX.Element => {
  const [out, setOut] = useState<any>({})
  const [inputTree, setTree] = useState<BaseTreeNode<Attributes> | undefined>()

  const { tree, width, height } = inputTree ? layout(inputTree) : ({} as any)

  const run = useCallback(() => {
    const inputArgs = [randomTarget(), randomInputs(6)] as const
    // const input = [ 966, [ 75, 25, 100, 50, 4, 3 ] ] // only one solution
    // const input = [13, [11, 6, 8]] as const // few solutions
    // const input = [156, [50, 25, 75, 100, 2, 8]] as const // 207 solutions
    // const input = [ 662, [ 100, 50, 2, 5, 1, 5 ] ] as const // no solution
    const [target, input] = inputArgs
    const root = {
      attributes: { char: '', distance: target, output: 0 },
      children: [],
    }
    setTree(root)
    setOut({ input, target })
    const results = []
    worker.postMessage({ type: 'start', input: inputArgs })
    worker.onmessage = ({ data }) => {
      if (data.type === 'done') {
        return setOut({
          input,
          target,
          length: results.length,
          done: true,
          permutations: data.permutations,
        })
      }
      if (data.type === 'result') {
        const x = data
        if (x.distance === 0) {
          results.push(x.formatted)

          let isLeaf = 0 === x.expression.length - 1
          let subtree = root.children.find(
            (y) => y.attributes.char === x.expression[0]
          )
          if (!subtree) {
            subtree = {
              attributes: {
                ...x,
                char: x.expression[0],
                isLeaf,
                isTarget: isLeaf && x.distance === 0,
              },
              children: [],
            }
            root.children.push(subtree)
          }
          let node = subtree
          for (let i = 1; i < x.expression.length; i += 2) {
            isLeaf = i === x.expression.length - 2
            const char = x.expression[i] + x.expression[i + 1]
            let child = node.children.find((y) => y.attributes.char === char)
            if (!child) {
              child = {
                attributes: {
                  ...x,
                  char,
                  isLeaf,
                  isTarget: isLeaf && x.distance === 0,
                },
                children: [],
              }
              node.children.push(child)
            }
            node = child
          }
          setTree(root)
          setOut({
            input,
            target,
            length: results.length,
            permutations: x.permutations,
          })
        }
      }
    }
  }, [])

  useEffect(run, [])

  return (
    <div className="">
      <div style={{ display: 'flex', padding: '20px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flex: 1,
          }}
        >
          <pre style={{ width: '188px' }}>{JSON.stringify(out, null, 2)}</pre>
          <button
            style={{
              width: '60%',
              height: '70px',
              maxWidth: '400px',
              borderRadius: '10px',
              fontSize: '18px',
            }}
            onClick={run}
          >
            New numbers
          </button>
        </div>
      </div>
      <div
        style={{
          position: 'relative',
          margin: '0 auto',
          maxWidth: '500px',
        }}
      >
        <svg
          viewBox={`0 0 ${(height || 0) * 50 + 50} ${(width || 0) * 50 + 50}`}
        >
          <Tree tree={tree} />
        </svg>
      </div>
      <style jsx global>{`
        :root {
          --background: #202124;
          --font-color: #b7bec5;
        }

        html,
        body {
          padding: 0;
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
            Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue,
            sans-serif;
          background: var(--background);
          color: var(--font-color);
        }

        * {
          box-sizing: border-box;
        }
      `}</style>
    </div>
  )
}

export default Home

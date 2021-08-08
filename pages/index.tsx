import { useEffect, useState } from 'react'
import { Tree } from '../components/Tree'
import { BaseTreeNode, layout } from '../layout/layout'
import { choose, randInt } from '../randInt'
import { Result } from '../solver/solver'

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

  // Error.stackTraceLimit = Infinity
  const outputTree = inputTree ? layout(inputTree) : undefined

  useEffect(() => {
    // const input = [randomTarget(), randomInputs(6)] as const
    // many solutions
    const input = [550, [50, 75, 5, 2, 9, 3]] as const
    // const input = [13, [11, 6, 8]] as const
    const [target] = input
    const root = {
      attributes: { char: '', distance: target, output: 0 },
      children: [],
    }
    setTree(root)
    // let bestDistance = Infinity
    const results = []
    worker.postMessage({ type: 'start', input })
    worker.onmessage = ({ data }) => {
      if (data.type === 'result') {
        const x = data
        // if (x.distance <= 10) {
        // if (x.distance <= bestDistance) {
        if (x.distance === 0) {
          // bestDistance = x.distance
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
          setOut({ input, length: results.length, results })
        }
        // if (x.distance === 0) worker.postMessage({ type: 'stop' })
      }
    }
  }, [])

  return (
    <div className="">
      <pre>
        {JSON.stringify(
          { input: out.input, length: out.results?.length },
          null,
          2
        )}
      </pre>
      <div
        style={{
          position: 'relative',
          margin: '20px',
        }}
      >
        <svg viewBox="0 0 600 50000">
          <Tree tree={outputTree} />
        </svg>
      </div>
      {/* <pre>{JSON.stringify(outputTree, null, 2)}</pre>
      <pre>{JSON.stringify(out, null, 2)}</pre> */}

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

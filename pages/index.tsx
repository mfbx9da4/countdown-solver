import { useCallback, useEffect, useState } from 'react'
import { Head } from '../components/Head'
import { Tree } from '../components/Tree'
import { BaseTreeNode, layout } from '../layout/layout'
import { choose, randInt } from '../solver/randInt'
import { DisplayResult } from '../worker'

const bigOneGenerator = () => choose([25, 50, 75, 100])
const smallOneGenerator = () => {
  const smalls = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  return choose([...smalls, ...smalls])
}
const randomInputs = (size = 6) => {
  const bigOne = bigOneGenerator()
  const smallOne = smallOneGenerator()
  const ret: number[] = []
  let bigOnes = Math.min(4, randInt(0, size - 2))
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
  expression?: string | number[]
  outputs: number[]
  distance?: number
}

interface DisplayTreeNode {
  attributes: Attributes
  children: DisplayTreeNode[]
}

export const Home = (): JSX.Element => {
  const [out, setOut] = useState<any>({})
  const [inputTree, setTree] = useState<BaseTreeNode<Attributes> | undefined>()

  const { tree, width, height } = inputTree ? layout(inputTree) : ({} as any)

  const run = useCallback(() => {
    const inputArgs = [randomTarget(), randomInputs(6)] as const
    // const inputArgs = [ 966, [ 75, 25, 100, 50, 4, 3 ] ] // only one solution
    // const inputArgs = [952, [25, 50, 75, 100, 3, 6]] as const // only one solution
    // const inputArgs = [13, [11, 6, 8]] as const // few solutions
    // const inputArgs = [180, [ 6, 5, 3, 4, 10, 8 ]] as const // 325 solutions
    // const inputArgs = [662, [100, 50, 2, 5, 1, 5]] as const // no solution
    const [target, input] = inputArgs
    const root: DisplayTreeNode = {
      attributes: { char: '', distance: target, outputs: [] },
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
          solutions: results.length,
          done: true,
          permutations: data.permutations,
        })
      }
      if (data.type === 'result') {
        const x = data as DisplayResult
        if (x.distance !== 0) return
        results.push(x)

        let node = root
        for (let i = 0; i < x.path.length; i++) {
          const char = x.path[i]
          let isLeaf = i === x.path.length - 1
          let child = node.children.find((y) => y.attributes.char === char)
          if (!child) {
            child = {
              attributes: {
                ...x,
                char,
                isLeaf,
                expression: undefined,
                isTarget: isLeaf && x.distance === 0,
              },
              children: [],
            }
            node.children.push(child)
          }
        }
        setTree(root)
        setOut({
          input,
          target,
          solutions: results.length,
          permutations: x.permutations,
        })
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
            flexDirection: 'column',
            flex: 1,
          }}
        >
          <div className="info-table">
            <div>Inputs:</div>
            <div>
              <div style={{ display: 'flex' }}>{out.input?.join(', ')}</div>
            </div>
            <div>Target:</div>
            <div>{out.target}</div>
            <div>Permutations:</div>
            <div>{out.permutations}</div>
            <div>Solutions:</div>
            <div>{out.solutions}</div>
            <div>Done:</div>
            <div>{out.done ? '✅' : '⏳'}</div>
          </div>

          <div style={{ width: '60%', maxWidth: '400px' }}>
            <button
              style={{
                width: '100%',
                height: '70px',
                background: 'hsl(210deg 11% 92%)',
                border: '4px solid hsl(210deg 11% 92%)',
                color: 'hsl(210deg 11% 12%)',
                outline: 0,
                cursor: 'pointer',
                borderRadius: '10px',
                fontSize: '18px',
              }}
              onClick={run}
            >
              New numbers
            </button>
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                marginTop: '12px',
              }}
            >
              <a
                href="https://github.com/mfbx9da4/countdown-solver/tree/main"
                rel="noreferrer"
                style={{
                  fontSize: '12px',
                  color: 'var(--font-color)',
                  borderBottom: '1px solid var(--font-color)',
                  textDecoration: 'none',
                }}
              >
                GitHub source
              </a>
            </div>
          </div>
        </div>
      </div>
      <div
        style={{
          position: 'relative',
          padding: '0 10px',
          margin: '0 auto',
          maxWidth: '500px',
        }}
      >
        <div
          style={{ textAlign: 'center', paddingTop: '24px', fontSize: '21px' }}
        >
          {out.solutions === 0 && 'No solutions found 🤷🏻‍♂️'}
        </div>
        {out.solutions ? (
          <svg
            viewBox={`0 0 ${(height || 0) * 50 + 50} ${(width || 0) * 50 + 50}`}
          >
            <Tree tree={tree} />
          </svg>
        ) : null}
      </div>
      <Head />
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
        .info-table {
          display: grid;
          grid-template-columns: 163px 163px;
          padding: 4px 0;
        }
        .info-table > div {
          padding: 4px;
        }

        // label
        .info-table > div:nth-child(odd) {
          color: #9e9e9e;
          text-align: right;
        }

        .input-number {
          padding-right: 5px;
        }
      `}</style>
    </div>
  )
}

export default Home

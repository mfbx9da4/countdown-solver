import { useEffect, useState } from 'react'
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

export const Home = (): JSX.Element => {
  const [out, setOut] = useState<any>({})

  useEffect(() => {
    const input = [randomTarget(), randomInputs(6)] as const
    // const input = [283, [75, 25, 8, 10, 5, 3]]
    // const input = [400, [75, 10, 5, 9, 8, 4]]
    // const input = [734, [100, 50, 8, 10, 10, 3]]
    // const input = [13, [11, 6, 8]]
    // let bestDistance = Infinity
    const results = []
    worker.postMessage({ type: 'start', input })
    worker.onmessage = ({ data }) => {
      if (data.type === 'result') {
        const x = data
        if (x.distance <= 10) {
          // bestDistance = x.distance
          results.push(x.formatted)
          setOut({ input, length: results.length, results })
        }
        // if (x.distance === 0) worker.postMessage({ type: 'stop' })
      }
    }
  }, [])

  return (
    <div className="">
      <pre>{JSON.stringify(out, null, 2)}</pre>

      <style jsx>{`
        #next {
          background: rgb(32, 36, 36);
          color: rgb(190, 186, 204);
        }
        .container {
          background: rgb(32, 36, 36);
          color: rgb(190, 186, 204);
          min-height: 100vh;
          padding: 0 0.5rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }

        main {
          padding: 5rem 0;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }

        footer {
          width: 100%;
          height: 100px;
          border-top: 1px solid #eaeaea;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        footer img {
          margin-left: 0.5rem;
        }

        footer a {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        a {
          color: inherit;
          text-decoration: none;
        }

        .title a {
          color: #0070f3;
          text-decoration: none;
        }

        .title a:hover,
        .title a:focus,
        .title a:active {
          text-decoration: underline;
        }

        .title {
          margin: 0;
          line-height: 1.15;
          font-size: 4rem;
        }

        .title,
        .description {
          text-align: center;
        }

        .description {
          line-height: 1.5;
          font-size: 1.5rem;
        }

        code {
          background: #fafafa;
          border-radius: 5px;
          padding: 0.75rem;
          font-size: 1.1rem;
          font-family: Menlo, Monaco, Lucida Console, Liberation Mono,
            DejaVu Sans Mono, Bitstream Vera Sans Mono, Courier New, monospace;
        }

        .grid {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;

          max-width: 800px;
          margin-top: 3rem;
        }

        .card {
          margin: 1rem;
          flex-basis: 45%;
          padding: 1.5rem;
          text-align: left;
          color: inherit;
          text-decoration: none;
          border: 1px solid #eaeaea;
          border-radius: 10px;
          transition: color 0.15s ease, border-color 0.15s ease;
        }

        .card:hover,
        .card:focus,
        .card:active {
          color: #0070f3;
          border-color: #0070f3;
        }

        .card h3 {
          margin: 0 0 1rem 0;
          font-size: 1.5rem;
        }

        .card p {
          margin: 0;
          font-size: 1.25rem;
          line-height: 1.5;
        }

        @media (max-width: 600px) {
          .grid {
            width: 100%;
            flex-direction: column;
          }
        }
      `}</style>

      <style jsx global>{`
        html,
        body {
          padding: 0;
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
            Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue,
            sans-serif;
        }

        * {
          box-sizing: border-box;
        }
      `}</style>
    </div>
  )
}

export default Home

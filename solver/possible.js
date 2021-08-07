const fac = (n) => !n || n * fac(n - 1)

const possible = (n) => {
  let s = 0
  for (let i = 1; i < n + 1; i++) {
    s += fac(i) * 4 ** (i - 1)
  }
  return s
}

console.log('possible(6)', possible(6))

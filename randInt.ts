export function randInt(a: number, b: number): number {
  return Math.round(Math.random() * (b - a)) + a
}
export function choose<T>(arr: T[]) {
  return (): T => {
    const i = randInt(0, arr.length - 1)
    const [item] = arr.splice(i, 1)
    return item
  }
}

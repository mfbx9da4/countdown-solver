export interface Combination<T> {
  combination: T[]
  remaining: T[]
}

function format<T>(indexes: number[], arr: T[]) {
  const combination: T[] = []
  const remaining: T[] = []
  const indexesSet = new Set(indexes)
  for (let i = 0; i < arr.length; i++) {
    const item = arr[i]
    if (indexesSet.has(i)) combination.push(item)
    else remaining.push(item)
  }

  return { combination, remaining }
}

function rec<T>(arr: T[], choices: number, lo = 0): number[][] {
  let ret: number[][] = []
  if (choices === 0) return ret
  if (choices === 1) {
    for (let i = lo; i < arr.length; i++) ret.push([i])
    return ret
  }
  for (let i = lo; i < arr.length; i++) {
    for (const subResult of rec(arr, choices - 1, i + 1)) {
      ret.push([i, ...subResult])
    }
  }
  return ret
}

export function combinations<T>(arr: T[], choices: number): Combination<T>[] {
  return rec(arr, choices).map((x) => format(x, arr))
}

export interface Partition<T> {
  left: T[]
  right: T[]
}

export function partitions<T>(arr: T[]): Partition<T>[] {
  if (arr.length <= 1) return []
  const ret: Partition<T>[] = []
  for (let i = 1; i < arr.length - 1; i++) {
    for (const combination of combinations(arr, i)) {
      ret.push({ left: combination.combination, right: combination.remaining })
      ret.push({ left: combination.remaining, right: combination.combination })
    }
  }
  return ret
}

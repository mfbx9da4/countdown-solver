type ResultPathNode = {
  value: string
  partialOutput: number
}

export interface Result {
  output: number
  distance: number
  resultId: string
  path: ResultPathNode[]
}

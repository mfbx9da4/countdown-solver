import TinyQueue from 'tinyqueue'

export class MinHeap<T extends { priority: number }> {
  private heap = new TinyQueue([], (a, b) => a.priority - b.priority)
  push(node: T): void {
    // TODO: implement
    this.heap.push(node)
  }
  pop(): T {
    // TODO: implement
    return this.heap.pop()
  }

  get length(): number {
    return this.heap.length
  }
}

export class AbortSignal {
  public pending = false
  public completed = false
  public onAbort: () => void | undefined
  private resolve: () => void | undefined

  async abort() {
    if (this.completed) return
    const promise = new Promise<void>((r) => {
      this.resolve = r
    })
    this.pending = true
    this.onAbort?.()
    await promise
  }

  done() {
    if (this.completed) throw new Error('Already aborted')
    if (this.pending) this.resolve()
    this.completed = true
  }
}

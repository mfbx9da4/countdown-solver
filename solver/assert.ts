class AssertionError extends Error {
  public extra: any
  constructor(message, extra) {
    super(message)
    this.name = 'AssertionError'
    this.message = message
    this.extra = extra
  }
}

const defaultOpts = { log: true }

function assert(
  predicate: any,
  message: string,
  extra: any = {},
  opts: Partial<typeof defaultOpts> = defaultOpts
): asserts predicate {
  if (!predicate) {
    const error = new AssertionError(message, extra)
    if (opts.log) {
      // eslint-disable-next-line no-console
      console.log('AssertionError:', message, extra)
      console.error(error)
    }
    throw error
  }
}

export default assert

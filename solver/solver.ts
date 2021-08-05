import assert from "./assert";

type Op = '*' | '/' | '+' | '-';
type Open = '('
type Close = ')'
type Paren = Open | Close;
type Expression = Array<Op | Paren | number>

interface Node {
    expression: Expression
    balance: number
    remaining: number[]
    /** distance to the target */
    priority: number
}

class MinHeap<T extends {priority: number}> {
    private heap: T[] = []
    constructor() {}
    push(node: T) {
        this.heap.push(node)
    }

}

export function solve(target: number, inputs: number[]) {
    // goal is to go through every permutation of the inputs
    // and every permutation of parens
    // the root is `(0)+(`
    // balance is `(` - `)`
    // at every even step we can choose from one of the ops
    // at every odd step we can choose from:
    //  either: one of the remaining numbers
    //  or: an opening paren if the balance is < inputs.length + 
    //  or: a closing paren if the balance is > 0 and prev not open paren
    // after every even step we can emit the expression
    // in evaluate we strip out empty () and add trailing close parens
    // and eval
    // we add the children to the min heap with a priority
    // priority will be difference to the target
    // a priority 0 is better
    // all evaluated expressions are added to a separate min heap
    const root:Node = {
        expression: ['('],
        balance: 1,
        priority: target,
        remaining: inputs
    }
    const heap = new MinHeap<Node>();
}

// (0)(1)(2)(3)(4)
// ((((01234))))
// ((01)2)(34)
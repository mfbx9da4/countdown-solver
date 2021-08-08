import { TreeNode } from './layout'

/**
 * https://llimllib.github.io/pymag-trees/
 * https://reingold.co/tidier-drawings.pdf
 * */
export function reingoldTilfordStrategy<T>(node: TreeNode<T>): void {
  addMods(setup(node))
}

function nextLeft<T>(v: TreeNode<T>): TreeNode<T> | undefined {
  if (v.thread) return v.thread
  if (v.children) return v.children[v.children.length - 1]
}

function nextRight<T>(v: TreeNode<T>): TreeNode<T> | undefined {
  if (v.thread) return v.thread
  if (v.children) return v.children[0]
}

function contour<T>(
  left: TreeNode<T>,
  right: TreeNode<T>,
  maxDiff?: number,
  leftOuter?: TreeNode<T>,
  rightOuter?: TreeNode<T>,
  lOffset = 0,
  rOffset = 0
): {
  leftInner: TreeNode<T> | undefined
  rightInner: TreeNode<T> | undefined
  maxDiff: number
  lOffset: number
  rOffset: number
  leftOuter: TreeNode<T>
  rightOuter: TreeNode<T>
} {
  // update the maxDiff
  const delta = left.position.left + lOffset - (right.position.left + rOffset)
  if (!maxDiff || delta > maxDiff) {
    maxDiff = delta
  }

  if (!leftOuter) leftOuter = left
  if (!rightOuter) rightOuter = right

  const lo = nextLeft(leftOuter)
  const li = nextRight(left)
  const ri = nextLeft(right)
  const ro = nextRight(rightOuter)

  if (li && ri) {
    lOffset += left.mod
    rOffset += right.mod
    return contour(li, ri, maxDiff, lo, ro, lOffset, rOffset)
  }

  return {
    leftInner: li,
    rightInner: ri,
    maxDiff,
    lOffset,
    rOffset,
    leftOuter,
    rightOuter,
  }
}

function fixSubtrees<T>(left: TreeNode<T>, right: TreeNode<T>): number {
  let {
    leftInner,
    rightInner,
    maxDiff,
    lOffset,
    rOffset,
    leftOuter,
    rightOuter,
  } = contour(left, right)

  // Add 1 so they don't conflict
  maxDiff += 1
  // Add another if the midpoint between r and l is odd
  // This is to ensure integral coordinates for all nodes
  maxDiff += (right.position.left + maxDiff + left.position.left) % 2

  // Move the right tree over to not conflict
  right.position.left += maxDiff
  // We shift all the children of the right subtree over
  // We actually update the children's left later
  right.mod = maxDiff

  // If this node has some children we need to update the rOffset
  if (right.children.length) rOffset += maxDiff

  // if one is deeper than the other
  // update the thread
  if (rightInner && !leftInner) {
    leftOuter.thread = rightInner
    leftOuter.mod = rOffset - lOffset
  } else if (leftInner && !rightInner) {
    rightOuter.thread = leftInner
    rightOuter.mod = lOffset - rOffset
  }

  return (left.position.left + right.position.left) / 2
}

function setup<T>(node: TreeNode<T>, depth = 0): TreeNode<T> {
  node.position.top = depth
  if (node.children.length === 0) {
    node.position.left = 0
    return node
  }

  if (node.children.length === 1) {
    node.position.left = setup(node.children[0], depth + 1).position.left
    return node
  }

  if (node.children.length > 2) {
    throw new Error('This algorithm only works for binary trees')
  }

  const left = setup(node.children[0] as TreeNode<T>, depth + 1)
  const right = setup(node.children[1] as TreeNode<T>, depth + 1)

  node.position.left = fixSubtrees(left, right)
  return node
}

function addMods<T>(node: TreeNode<T>, mod = 0): TreeNode<T> {
  node.position.left += mod
  for (let i = 0; i < node.children.length; i++) {
    const child = node.children[i]
    if (child) addMods(child, mod + node.mod)
  }
  return node
}

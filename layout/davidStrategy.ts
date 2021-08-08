import { TreeNode } from './layout'

import { DefaultDict } from './defaultDict'
export function davidStrategy<T>(
  node: TreeNode<T>,
  depth = 0,
  /** keeps track of the number of siblings at each depth */
  siblingCount = new DefaultDict<number>(-1),
  /** the left most node of any subtree */
  leftMost = -1,
  /** the right most node of any subtree */
  rightMost = -1,
  maxDepth = -1
) {
  let leftMostChild = Number.POSITIVE_INFINITY
  let rightMostChild = Number.NEGATIVE_INFINITY

  // Draw the subtrees of this node
  for (let i = 0; i < node.children.length; i++) {
    const child = node.children[i]
    if (!child) continue
    const subtree = davidStrategy(
      child,
      depth + 1,
      siblingCount,
      leftMost,
      rightMost
    )
    // Keep track of the the extremes of the contours for each subtree
    leftMost = Math.max(subtree.leftMost, leftMost)
    rightMost = Math.max(subtree.rightMost, rightMost)
    maxDepth = Math.max(subtree.maxDepth, maxDepth)

    // Keep track of extremes of locations of direct children
    leftMostChild = Math.min(leftMostChild, subtree.left)
    rightMostChild = Math.max(rightMostChild, subtree.left)
  }

  node.position.top = depth

  if (node.children.length === 0) {
    // Leaf node - don't overlap with this row or left subtree
    const leftSiblingsCount = siblingCount.get(depth)
    node.position.left = Math.max(leftSiblingsCount, rightMost) + 1
    rightMost++
  } else {
    // center the parent
    const centered =
      leftMostChild + Math.abs(rightMostChild - leftMostChild) / 2
    node.position.left = centered
  }
  siblingCount.set(depth, node.position.left)
  const out = {
    left: node.position.left,
    rightMost,
    leftMost,
    maxDepth: Math.max(depth, maxDepth),
  }
  return out
}

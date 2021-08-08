import { TreeNode } from './layout'

import { DefaultDict } from './defaultDict'
export function davidStrategy<T>(
  node: TreeNode<T>,
  depth = 0,
  siblingCount = new DefaultDict<number>(-1),
  rightMost = -1
): { rightMost: number; left: number } {
  let leftMostChild = Number.POSITIVE_INFINITY
  let rightMostChild = Number.NEGATIVE_INFINITY

  // Draw the subtrees of this node
  for (let i = 0; i < node.children.length; i++) {
    const child = node.children[i]
    if (!child) continue
    let subtree = davidStrategy(child, depth + 1, siblingCount, rightMost)
    // Keep track of the right most contour for each subtree
    // Ensure the subtrees don't overlap
    rightMost = Math.max(subtree.rightMost, rightMost)

    // Keep track of extremes of locations of direct children
    leftMostChild = Math.min(leftMostChild, subtree.left)
    rightMostChild = Math.max(rightMostChild, subtree.left)
  }

  node.position.top = depth

  const count = siblingCount.get(depth)
  if (node.children.length >= 1) {
    // center the parent
    const centered =
      leftMostChild + Math.abs(rightMostChild - leftMostChild) / 2
    node.position.left = centered
  } else {
    // Don't overlap with this row or left subtree
    node.position.left = Math.max(count, rightMost) + 1
    rightMost++
  }
  siblingCount.set(depth, node.position.left)
  const out = { left: node.position.left, rightMost }
  return out
}

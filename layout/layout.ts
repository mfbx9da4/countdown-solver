import { davidStrategy } from './davidStrategy'
import { reingoldTilfordStrategy } from './reingoldTilford'

type Position = { left: number; top: number }

export type BaseTreeNode<T> = {
  children: Array<BaseTreeNode<T>>
  attributes: T
}

export type TreeNode<T> = Omit<BaseTreeNode<T>, 'children'> & {
  attributes: T
  children: Array<TreeNode<T>>
  position: Position
  mod: number
  thread?: TreeNode<T>
}

export function layout<T>(input: BaseTreeNode<T>): TreeNode<T> {
  const tree = createTree(input)
  // reingoldTilfordStrategy(tree)
  davidStrategy(tree)
  return tree
}

function createTree<T>(input: BaseTreeNode<T>): TreeNode<T> {
  return {
    attributes: input.attributes,
    mod: 0,
    position: { top: 0, left: 0 },
    children: input.children.map((x) => createTree(x)),
  }
}
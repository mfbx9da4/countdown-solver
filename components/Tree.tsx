import React from 'react'
import { TreeNode } from '../layout/layout'
import { Attributes } from '../pages'

interface Props {
  tree?: TreeNode<Attributes>
}

const getX = (node: TreeNode<Attributes>) => {
  // inverts the tree to draw horizontally rather than vertically
  return node.position.top * 50 + 25
}

const getY = (node: TreeNode<Attributes>) => {
  // inverts the tree to draw horizontally rather than vertically
  return node.position.left * 50 + 25
}

export function Tree({ tree }: Props) {
  if (!tree) return null

  const { attributes } = tree
  const x = getX(tree)
  const y = getY(tree)

  return (
    <>
      {tree.children.map((child, i) => (
        <line
          key={i}
          x1={x}
          y1={y}
          x2={getX(child)}
          y2={getY(child)}
          strokeWidth="2"
          style={{ stroke: 'var(--font-color)' }}
        />
      ))}
      <g>
        <circle
          cx={x}
          cy={y}
          r="20"
          style={{
            fill: 'var(--background)',
          }}
          stroke={attributes.isTarget ? 'white' : 'var(--font-color)'}
          strokeWidth="2"
        >
          <title>{attributes.output}</title>
        </circle>
        <text
          x={x}
          y={y}
          alignmentBaseline="middle"
          textAnchor="middle"
          style={{
            fontSize: '12px',
            fill: attributes.isTarget ? 'white' : 'var(--font-color)',
          }}
        >
          {attributes.char || 'root'}
        </text>
      </g>
      {tree.children.map((x, i) => (
        <Tree key={i} tree={x} />
      ))}
    </>
  )
}

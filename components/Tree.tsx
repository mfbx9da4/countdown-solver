import { tryGetPreviewData } from 'next/dist/next-server/server/api-utils'
import React from 'react'
import { TreeNode } from '../layout/layout'
import { Attributes } from '../pages'

interface Props {
  tree?: TreeNode<Attributes>
}

const getX = (node: TreeNode<Attributes>) => {
  return node.position.top * 50 + 25
}

const getY = (node: TreeNode<Attributes>) => {
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
          stroke="lime"
          strokeWidth="2"
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
            fill: attributes.isTarget ? 'white' : 'var(--font-color)',
          }}
        >
          {attributes.char || 'root'}
        </text>

        {/* {attributes.distance !== undefined && (
          <div
            style={{
              position: 'absolute',
              top: '-12px',
              right: '-12px',
              fontSize: '10px',
            }}
          >
            ({attributes.distance})
          </div>
        )} */}
      </g>
      {tree.children.map((x, i) => (
        <Tree key={i} tree={x} />
      ))}
    </>
  )
}

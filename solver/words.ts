import fs from 'fs'
const dictionary = fs
  .readFileSync('/usr/share/dict/words') // unix?
  .toString()
  .split('\n')

type TrieNode = { children: Record<string, TrieNode>; words: string[] }
const trie: TrieNode = { children: {}, words: [] }
for (const word of dictionary) {
  let node = trie
  for (const char of word.split('').sort()) {
    if (!node.children[char]) {
      node.children[char] = { children: {}, words: [] }
    }
    node = node.children[char]
  }
  node.words.push(word)
}

function solve(letters: string) {
  let node = trie
  const words: string[] = []
  for (const char of letters.split('').sort()) {
    node = node.children[char]
    if (!node) break
    words.push(...node.words)
  }
  return node.words.sort((b, a) => a.length - b.length)
}

solve('slate')

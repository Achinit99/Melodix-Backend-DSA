import { SongRecord } from './SongLinkedList.js'

// One BST node stores one song and links to left/right children.
export class SongBSTNode {
  public songData: SongRecord
  public leftChild: SongBSTNode | null
  public rightChild: SongBSTNode | null

  constructor(songData: SongRecord) {
    this.songData = songData
    this.leftChild = null
    this.rightChild = null
  }
}

// Binary Search Tree for song title search.
// Smaller titles go to the left, larger titles go to the right.
export class SongBinarySearchTree {
  private rootNode: SongBSTNode | null

  constructor() {
    this.rootNode = null
  }

  // Step 1: Insert one song into the BST.
  public insert(songToInsert: SongRecord): void {
    if (this.rootNode === null) {
      this.rootNode = new SongBSTNode(songToInsert)
      return
    }

    this.insertRecursive(this.rootNode, songToInsert)
  }

  private insertRecursive(currentNode: SongBSTNode, songToInsert: SongRecord): void {
    const comparisonResult = songToInsert.title.localeCompare(currentNode.songData.title)

    if (comparisonResult < 0) {
      if (currentNode.leftChild === null) {
        currentNode.leftChild = new SongBSTNode(songToInsert)
      } else {
        this.insertRecursive(currentNode.leftChild, songToInsert)
      }
      return
    }

    if (comparisonResult > 0) {
      if (currentNode.rightChild === null) {
        currentNode.rightChild = new SongBSTNode(songToInsert)
      } else {
        this.insertRecursive(currentNode.rightChild, songToInsert)
      }
    }

    // If titles are equal, we skip duplicate insert.
  }

  // Step 2: Search by exact title.
  public search(songTitle: string): SongRecord | null {
    return this.searchRecursive(this.rootNode, songTitle)
  }

  private searchRecursive(currentNode: SongBSTNode | null, songTitle: string): SongRecord | null {
    if (currentNode === null) {
      return null
    }

    const comparisonResult = songTitle.localeCompare(currentNode.songData.title)

    if (comparisonResult === 0) {
      return currentNode.songData
    }

    if (comparisonResult < 0) {
      return this.searchRecursive(currentNode.leftChild, songTitle)
    }

    return this.searchRecursive(currentNode.rightChild, songTitle)
  }

  // Step 3: Insert many songs.
  public insertMultipleSongs(songArray: SongRecord[]): void {
    for (const currentSong of songArray) {
      this.insert(currentSong)
    }
  }

  public getRoot(): SongBSTNode | null {
    return this.rootNode
  }

  // In-order traversal returns songs in alphabetical title order.
  public getInOrderTraversal(): SongRecord[] {
    const songsInOrder: SongRecord[] = []
    this.inOrderTraversalRecursive(this.rootNode, songsInOrder)
    return songsInOrder
  }

  private inOrderTraversalRecursive(currentNode: SongBSTNode | null, result: SongRecord[]): void {
    if (currentNode === null) {
      return
    }

    this.inOrderTraversalRecursive(currentNode.leftChild, result)
    result.push(currentNode.songData)
    this.inOrderTraversalRecursive(currentNode.rightChild, result)
  }
}

export function buildSongBSTFromArray(songArray: SongRecord[]): SongBinarySearchTree {
  const songBST = new SongBinarySearchTree()
  songBST.insertMultipleSongs(songArray)
  return songBST
}

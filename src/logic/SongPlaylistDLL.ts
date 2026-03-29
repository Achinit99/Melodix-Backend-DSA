export interface SongData {
  id: number
  title: string
  artist_name: string
  duration: string
  image_url: string
  audio_url?: string
}

// A node stores one song and two pointers.
// next points to the next song.
// prev points to the previous song.
export class SongNode {
  public data: SongData
  public next: SongNode | null
  public prev: SongNode | null

  constructor(song: SongData) {
    this.data = song
    this.next = null
    this.prev = null
  }
}

export class PlaylistDoublyLinkedList {
  public head: SongNode | null
  public tail: SongNode | null
  public currentPlaying: SongNode | null

  constructor() {
    this.head = null
    this.tail = null
    this.currentPlaying = null
  }

  // Step 1: Create a new node.
  // Step 2: If list is empty, new node is head and tail.
  // Step 3: If list has items, connect old tail to new node.
  public append(song: SongData): SongNode {
    const newNode = new SongNode(song)

    if (this.head === null || this.tail === null) {
      this.head = newNode
      this.tail = newNode

      if (this.currentPlaying === null) {
        this.currentPlaying = newNode
      }

      return newNode
    }

    this.tail.next = newNode
    newNode.prev = this.tail
    this.tail = newNode

    return newNode
  }

  // Rebuild the full list from songs from database.
  public rebuildFromSongs(songs: SongData[]): void {
    this.head = null
    this.tail = null
    this.currentPlaying = null

    for (const song of songs) {
      this.append(song)
    }
  }

  // Remove one node by song id.
  // This method keeps all pointers correct after delete.
  public deleteById(songId: number): SongData | null {
    let cursor = this.head

    while (cursor !== null) {
      if (cursor.data.id === songId) {
        const deletedSong = cursor.data

        // Step 1: Link previous node to next node.
        if (cursor.prev !== null) {
          cursor.prev.next = cursor.next
        } else {
          this.head = cursor.next
        }

        // Step 2: Link next node back to previous node.
        if (cursor.next !== null) {
          cursor.next.prev = cursor.prev
        } else {
          this.tail = cursor.prev
        }

        // Step 3: If current pointer is deleted, move to next song.
        // If next is not available, move to previous.
        // If list is empty, it becomes null.
        if (this.currentPlaying?.data.id === songId) {
          this.currentPlaying = cursor.next ?? cursor.prev ?? this.head
        }

        return deletedSong
      }

      cursor = cursor.next
    }

    return null
  }

  // Move current pointer one node forward.
  public moveNext(): SongData | null {
    if (this.currentPlaying === null) {
      this.currentPlaying = this.head
      return this.currentPlaying?.data ?? null
    }

    if (this.currentPlaying.next !== null) {
      this.currentPlaying = this.currentPlaying.next
      return this.currentPlaying.data
    }

    return null
  }

  // Move current pointer one node backward.
  public movePrevious(): SongData | null {
    if (this.currentPlaying === null) {
      this.currentPlaying = this.tail
      return this.currentPlaying?.data ?? null
    }

    if (this.currentPlaying.prev !== null) {
      this.currentPlaying = this.currentPlaying.prev
      return this.currentPlaying.data
    }

    return null
  }

  public searchById(songId: number): SongData | null {
    let cursor = this.head

    while (cursor !== null) {
      if (cursor.data.id === songId) {
        return cursor.data
      }

      cursor = cursor.next
    }

    return null
  }

  public searchByTitle(title: string): SongData | null {
    const normalizedTitle = title.trim().toLowerCase()
    let cursor = this.head

    while (cursor !== null) {
      if (cursor.data.title.toLowerCase() === normalizedTitle) {
        return cursor.data
      }

      cursor = cursor.next
    }

    return null
  }

  // Convert linked list to plain array for API response.
  public toArray(): SongData[] {
    const songs: SongData[] = []
    let cursor = this.head

    while (cursor !== null) {
      songs.push(cursor.data)
      cursor = cursor.next
    }

    return songs
  }
}

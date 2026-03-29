// Song model used in backend logic
export type SongRecord = {
  id: number
  title: string
  artist: string
  duration: string
  imageSrc: string
}

// Mock data copied from frontend playlists.
export const mockPlaylistSongsFromFrontend: Record<string, SongRecord[]> = {
  'Relaxing playlist': [
    { id: 1, title: 'Lose Yourself', artist: 'Eminem', duration: '3:33', imageSrc: '/assets/lose%20yourself.jpeg' },
    { id: 2, title: 'Not Like Us', artist: 'Kendrick Lamar', duration: '3:33', imageSrc: '/assets/not%20like%20us.jpeg' },
    { id: 3, title: 'Water', artist: 'Tyla', duration: '3:33', imageSrc: '/assets/water.jpeg' },
    { id: 4, title: 'CHANEL', artist: 'Tyla', duration: '3:33', imageSrc: '/assets/cardi%20b.jpeg' },
    { id: 5, title: 'I Like It', artist: 'Cardi B', duration: '3:33', imageSrc: '/assets/i%20like%20it.jpeg' },
  ],
  'Study Vibe': [
    { id: 1, title: 'Ambient Music', artist: 'Artist Name', duration: '3:45', imageSrc: '/assets/golden.jpeg' },
    { id: 2, title: 'Focus Track', artist: 'Artist Name', duration: '3:20', imageSrc: '/assets/choosing%20texas.jpeg' },
    { id: 3, title: 'Study Flow', artist: 'Artist Name', duration: '3:15', imageSrc: '/assets/TOP.jpeg' },
    { id: 4, title: 'Concentration', artist: 'Artist Name', duration: '3:40', imageSrc: '/assets/american%20girls.jpeg' },
    { id: 5, title: 'Learning Mood', artist: 'Artist Name', duration: '3:25', imageSrc: '/assets/jazz.jpeg' },
  ],
  'Car Playlist': [
    { id: 1, title: 'Highway Song', artist: 'Drake', duration: '4:12', imageSrc: '/assets/drake.jpeg' },
    { id: 2, title: 'Road Trip', artist: 'The Weeknd', duration: '3:58', imageSrc: '/assets/bts.jpeg' },
    { id: 3, title: 'Driving Vibes', artist: 'Post Malone', duration: '3:45', imageSrc: '/assets/lose%20yourself.jpeg' },
    { id: 4, title: 'Fast Lane', artist: 'Nicki Minaj', duration: '3:52', imageSrc: '/assets/Nicki%20minaj.jpeg' },
    { id: 5, title: 'Motion', artist: 'Kendrick Lamar', duration: '3:30', imageSrc: '/assets/kendrick%20lamar.jpeg' },
  ],
}

// One linked list node stores one song and two pointers.
export class SongListNode {
  public songData: SongRecord
  public nextNode: SongListNode | null
  public previousNode: SongListNode | null

  constructor(songData: SongRecord) {
    this.songData = songData
    this.nextNode = null
    this.previousNode = null
  }
}

// Doubly linked list for playlist operations.
export class SongDoublyLinkedList {
  private headNode: SongListNode | null
  private tailNode: SongListNode | null
  private totalNodeCount: number

  constructor() {
    this.headNode = null
    this.tailNode = null
    this.totalNodeCount = 0
  }

  // Step 1: Add a song to the end of the list.
  public appendSong(songToAppend: SongRecord): void {
    const newlyCreatedNode = new SongListNode(songToAppend)

    if (this.headNode === null || this.tailNode === null) {
      this.headNode = newlyCreatedNode
      this.tailNode = newlyCreatedNode
      this.totalNodeCount += 1
      return
    }

    this.tailNode.nextNode = newlyCreatedNode
    newlyCreatedNode.previousNode = this.tailNode
    this.tailNode = newlyCreatedNode
    this.totalNodeCount += 1
  }

  public appendMultipleSongs(songArray: SongRecord[]): void {
    for (const currentSong of songArray) {
      this.appendSong(currentSong)
    }
  }

  // Step 2: Remove one song and relink neighbor pointers.
  public removeSongById(songIdToRemove: number): boolean {
    let currentNodePointer = this.headNode

    while (currentNodePointer !== null) {
      if (currentNodePointer.songData.id === songIdToRemove) {
        const previousNodePointer = currentNodePointer.previousNode
        const nextNodePointer = currentNodePointer.nextNode

        if (previousNodePointer === null) {
          this.headNode = nextNodePointer
        } else {
          previousNodePointer.nextNode = nextNodePointer
        }

        if (nextNodePointer === null) {
          this.tailNode = previousNodePointer
        } else {
          nextNodePointer.previousNode = previousNodePointer
        }

        this.totalNodeCount -= 1
        return true
      }

      currentNodePointer = currentNodePointer.nextNode
    }

    return false
  }

  public findSongById(songIdToFind: number): SongRecord | null {
    let currentNodePointer = this.headNode

    while (currentNodePointer !== null) {
      if (currentNodePointer.songData.id === songIdToFind) {
        return currentNodePointer.songData
      }
      currentNodePointer = currentNodePointer.nextNode
    }

    return null
  }

  public convertListToArray(): SongRecord[] {
    const songsAsArray: SongRecord[] = []
    let currentNodePointer = this.headNode

    while (currentNodePointer !== null) {
      songsAsArray.push(currentNodePointer.songData)
      currentNodePointer = currentNodePointer.nextNode
    }

    return songsAsArray
  }

  // This method traverses list from tail to head.
  public convertListToArrayFromTail(): SongRecord[] {
    const songsAsArrayFromTail: SongRecord[] = []
    let currentNodePointer = this.tailNode

    while (currentNodePointer !== null) {
      songsAsArrayFromTail.push(currentNodePointer.songData)
      currentNodePointer = currentNodePointer.previousNode
    }

    return songsAsArrayFromTail
  }

  public getHeadSong(): SongRecord | null {
    return this.headNode?.songData ?? null
  }

  public getTailSong(): SongRecord | null {
    return this.tailNode?.songData ?? null
  }

  public getTotalSongCount(): number {
    return this.totalNodeCount
  }
}

// Helper: build a linked list from one playlist name.
export function buildSongLinkedListFromMockPlaylist(playlistName: string): SongDoublyLinkedList {
  const selectedPlaylistSongs = mockPlaylistSongsFromFrontend[playlistName] ?? []
  const songLinkedList = new SongDoublyLinkedList()
  songLinkedList.appendMultipleSongs(selectedPlaylistSongs)
  return songLinkedList
}

export const relaxingPlaylistLinkedList = buildSongLinkedListFromMockPlaylist('Relaxing playlist')

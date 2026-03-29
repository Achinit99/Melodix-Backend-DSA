export interface GenreItem {
  id: number
  name: string
  imageSrc: string
}

export interface ArtistItem {
  id: number
  name: string
  imageSrc: string
}

export interface RecommendedPlaylistItem {
  id: number
  name: string
  description: string
  imageSrc: string
  songCount: number
}

export interface DashboardArtistItem {
  id: number
  name: string
  role: string
  imageSrc: string
}

export interface TrendingSongItem {
  id: number
  title: string
  artist: string
  duration: string
  imageSrc: string
}

export interface UpcomingSongItem {
  id: number
  title: string
  artist: string
  releaseDate: string
  imageSrc: string
}

export interface TrendingArtistItem {
  id: number
  name: string
  monthlyListeners: string
  imageSrc: string
}

export const genres: GenreItem[] = [
  { id: 1, name: 'Hip-Hop', imageSrc: '/assets/kendrick%20lamar.jpeg' },
  { id: 2, name: 'Pop', imageSrc: '/assets/TOP.jpeg' },
  { id: 3, name: 'R&B', imageSrc: '/assets/water.jpeg' },
  { id: 4, name: 'Jazz', imageSrc: '/assets/jazz.jpeg' },
  { id: 5, name: 'Lo-fi', imageSrc: '/assets/golden.jpeg' },
]

export const artists: ArtistItem[] = [
  { id: 1, name: 'Eminem', imageSrc: '/assets/lose%20yourself.jpeg' },
  { id: 2, name: 'Kendrick Lamar', imageSrc: '/assets/kendrick%20lamar.jpeg' },
  { id: 3, name: 'Tyla', imageSrc: '/assets/water.jpeg' },
  { id: 4, name: 'Drake', imageSrc: '/assets/drake.jpeg' },
  { id: 5, name: 'The Weeknd', imageSrc: '/assets/bts.jpeg' },
]

export const recommendedPlaylists: RecommendedPlaylistItem[] = [
  {
    id: 1,
    name: 'Relaxing playlist',
    description: 'Chill tracks to slow down and reset.',
    imageSrc: '/assets/lose%20yourself.jpeg',
    songCount: 5,
  },
  {
    id: 2,
    name: 'Study Vibe',
    description: 'Focus-friendly sounds for deep work.',
    imageSrc: '/assets/golden.jpeg',
    songCount: 5,
  },
  {
    id: 3,
    name: 'Car Playlist',
    description: 'High-energy songs for road trips.',
    imageSrc: '/assets/drake.jpeg',
    songCount: 5,
  },
]

export const dashboardArtists: DashboardArtistItem[] = [
  { id: 1, name: 'Kendrick Lamar', role: 'Rapper', imageSrc: '/assets/kendrick%20lamar.jpeg' },
  { id: 2, name: 'Tyla', role: 'Singer', imageSrc: '/assets/water.jpeg' },
  { id: 3, name: 'Drake', role: 'Artist', imageSrc: '/assets/drake.jpeg' },
  { id: 4, name: 'Nicki Minaj', role: 'Rapper', imageSrc: '/assets/Nicki%20minaj.jpeg' },
]

export const trendingSongs: TrendingSongItem[] = [
  { id: 1, title: 'Not Like Us', artist: 'Kendrick Lamar', duration: '3:33', imageSrc: '/assets/not%20like%20us.jpeg' },
  { id: 2, title: 'Water', artist: 'Tyla', duration: '3:33', imageSrc: '/assets/water.jpeg' },
  { id: 3, title: 'Lose Yourself', artist: 'Eminem', duration: '3:33', imageSrc: '/assets/lose%20yourself.jpeg' },
  { id: 4, title: 'Road Trip', artist: 'The Weeknd', duration: '3:58', imageSrc: '/assets/bts.jpeg' },
]

export const upcomingSongs: UpcomingSongItem[] = [
  { id: 1, title: 'Learning Mood 2', artist: 'Artist Name', releaseDate: '2026-04-10', imageSrc: '/assets/jazz.jpeg' },
  { id: 2, title: 'City Lights', artist: 'Drake', releaseDate: '2026-04-18', imageSrc: '/assets/drake.jpeg' },
  { id: 3, title: 'Night Drive', artist: 'The Weeknd', releaseDate: '2026-05-02', imageSrc: '/assets/bts.jpeg' },
]

export const trendingArtists: TrendingArtistItem[] = [
  { id: 1, name: 'Kendrick Lamar', monthlyListeners: '82M', imageSrc: '/assets/kendrick%20lamar.jpeg' },
  { id: 2, name: 'Tyla', monthlyListeners: '41M', imageSrc: '/assets/water.jpeg' },
  { id: 3, name: 'Eminem', monthlyListeners: '70M', imageSrc: '/assets/lose%20yourself.jpeg' },
  { id: 4, name: 'Drake', monthlyListeners: '84M', imageSrc: '/assets/drake.jpeg' },
]

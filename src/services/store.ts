/* Local store: likes, bookmarks and Floor replies kept in this browser.
   This is the "local fallback" so the site works with no database.
   When Supabase is connected (Phase 5) these calls move to the server,
   where the rules are enforced properly. */
import { useSyncExternalStore } from 'react'

export type Stance = 'For' | 'Against' | 'Unsure'
export type FloorPost = {
  id: string
  thread: string
  author: string
  text: string
  stance?: Stance
  at: number
  editedAt?: number
}
type State = { likes: string[]; bookmarks: string[]; posts: FloorPost[] }

const KEY = 'ramz.local-store.v1'
const day = 86_400_000
const now = Date.now()
const seed: State = {
  likes: [],
  bookmarks: [],
  posts: [
    { id: 's1', thread: 'prompt', author: 'Areeba', stance: 'For', at: now - 3 * day, text: 'Yes. If you can only argue what you already believe, you are not debating, you are testifying.' },
    { id: 's2', thread: 'prompt', author: 'Hamza', stance: 'Against', at: now - 2 * day, text: 'There is a line. Being drawn on the side of something you find cruel and performing it well is practice in the wrong skill.' },
    { id: 's3', thread: 'prompt', author: 'Zoya', stance: 'Unsure', at: now - 1 * day, text: 'Depends who is in the room. In a practice round, yes. On a public stage with an audience that does not know the format, I am less sure.' },
    { id: 's4', thread: 'article-rebuttal-is-listening', author: 'Bilal', at: now - 2 * day, text: 'The line about writing your opponent a better argument in your own notes is going on our club wall.' },
    { id: 's5', thread: 'article-rebuttal-is-listening', author: 'Mahnoor', at: now - 1 * day, text: 'Counterpoint: in a seven-minute speech you do not always have time to steelman. Sometimes the fumble is the argument.' },
    { id: 's6', thread: 'article-urdu-debate-is-not-a-translation', author: 'Saad', at: now - 4 * day, text: 'Would love to see a trial tournament with a munazara-style final.' },
  ],
}

let state: State = load()
const listeners = new Set<() => void>()

function load(): State {
  try {
    const raw = window.localStorage.getItem(KEY)
    if (raw) return { ...seed, ...(JSON.parse(raw) as State) }
  } catch {
    /* fall through to seed */
  }
  return seed
}
function set(next: State) {
  state = next
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    /* storage unavailable: keep in memory for this visit */
  }
  listeners.forEach((l) => l())
}
function subscribe(l: () => void) {
  listeners.add(l)
  return () => listeners.delete(l)
}

export function useStore(): State {
  return useSyncExternalStore(subscribe, () => state)
}

const toggle = (list: string[], key: string) => (list.includes(key) ? list.filter((k) => k !== key) : [...list, key])

export const actions = {
  toggleLike: (key: string) => set({ ...state, likes: toggle(state.likes, key) }),
  toggleBookmark: (key: string) => set({ ...state, bookmarks: toggle(state.bookmarks, key) }),
  addPost: (p: Omit<FloorPost, 'id' | 'at'>) =>
    set({ ...state, posts: [...state.posts, { ...p, id: 'p' + Date.now().toString(36), at: Date.now() }] }),
  editPost: (id: string, text: string) =>
    set({ ...state, posts: state.posts.map((p) => (p.id === id ? { ...p, text, editedAt: Date.now() } : p)) }),
  deletePost: (id: string) => set({ ...state, posts: state.posts.filter((p) => p.id !== id) }),
}

/* ---- language pre-check (layer 1 of 3: the friendly client-side note) ----
   The real enforcement is a database rule added in Phase 5; this only saves
   people a round trip. The list is a short placeholder for owners to replace. */
const BLOCKED = ['idiot', 'stupid', 'moron', 'bewakoof', 'ullu', 'jahil', 'بیوقوف', 'جاہل']
const LEET: Record<string, string> = { '0': 'o', '1': 'i', '3': 'e', '4': 'a', '5': 's', '7': 't', '@': 'a', $: 's', '!': 'i' }

export function findBlocked(text: string): string | null {
  const unleet = text.toLowerCase().replace(/[013457@$!]/g, (c) => LEET[c] ?? c)
  // join letters that were spaced or dotted apart: "s t u p i d", "s.t.u.p.i.d"
  const joined = unleet.replace(/(?<![\p{L}])((?:\p{L}[\s.\-_*]+){2,}\p{L})(?![\p{L}])/gu, (m) => m.replace(/[\s.\-_*]+/g, ''))
  // whole words only, so "class" or "Scunthorpe" style false positives cannot happen
  const words = joined.split(/[^\p{L}]+/u)
  return BLOCKED.find((b) => words.includes(b)) ?? null
}

export function timeAgo(at: number): string {
  const mins = Math.round((Date.now() - at) / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins} min ago`
  const hrs = Math.round(mins / 60)
  if (hrs < 24) return `${hrs} h ago`
  const days = Math.round(hrs / 24)
  return days === 1 ? 'yesterday' : `${days} days ago`
}

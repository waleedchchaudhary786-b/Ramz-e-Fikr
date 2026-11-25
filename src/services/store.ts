/* Local store: likes, bookmarks and Floor replies kept in this browser.
   This is the "local fallback" so the site works with no database.
   When Supabase is connected (Phase 5) these calls move to the server,
   where the rules are enforced properly. */
import { useMemo, useSyncExternalStore } from 'react'
import { CONNECTED, supabase } from './supabase'
import { articles as baseArticles, type Article } from '../data/sample'
import { articleDetails, toBlocks, wordCount, type ArticleDetail } from '../data/articles'
import { seedReplies, seedTopics, type BoardId } from '../data/forum'

export type Stance = 'For' | 'Against' | 'Unsure'
export type FloorPost = {
  id: string
  thread: string
  author: string
  /** account id of the writer: decides who may edit or delete */
  authorId: string
  /** held for owner review by the database's language check */
  flagged?: boolean
  text: string
  stance?: Stance
  at: number
  editedAt?: number
}
export type DraftStatus = 'draft' | 'pending' | 'approved' | 'rejected'
export type Draft = {
  id: string
  title: string
  authorName: string
  ramz: string
  body: string
  status: DraftStatus
  /** the owner's note when an essay is returned */
  note?: string
  postedBy: string
  postedById: string
  updatedAt: number
}
export type Topic = {
  id: string
  board: BoardId
  title: string
  body: string
  author: string
  authorId: string
  pinned: boolean
  locked: boolean
  /** held for owner review by the database's language check */
  flagged?: boolean
  at: number
  editedAt?: number
}
export type Notice = {
  id: string
  kind: string
  body: string
  link: string | null
  read: boolean
  at: number
}
type State = {
  likes: string[]
  bookmarks: string[]
  posts: FloorPost[]
  drafts: Draft[]
  notices: Notice[]
  /** how many people liked each item (connected mode: everyone's likes) */
  likeCounts: Record<string, number>
  /** ids of replies that readers have reported (owners only see this filled) */
  reported: string[]
  /** ids of replies this visitor reported during this visit */
  myReports: string[]
  /** forum threads */
  topics: Topic[]
  /** ids of forum threads that readers have reported (owners only see this filled) */
  topicReports: string[]
  /** ids of forum threads this visitor reported during this visit */
  myTopicReports: string[]
  /** false when connected but the forum's tables are not in the database yet */
  forumReady: boolean
  /** the last thing that failed to save, shown as a small message */
  error: string | null
}

const KEY = 'ramz.local-store.v1'
const day = 86_400_000
const now = Date.now()
const seed: State = {
  likes: [],
  bookmarks: [],
  drafts: [],
  notices: [],
  likeCounts: {},
  reported: [],
  myReports: [],
  error: null,
  topics: seedTopics.map((t) => ({
    id: t.id,
    board: t.board,
    title: t.title,
    body: t.body,
    author: t.author,
    authorId: 'seed',
    pinned: !!t.pinned,
    locked: !!t.locked,
    at: now - t.daysAgo * day,
  })),
  topicReports: [],
  myTopicReports: [],
  forumReady: true,
  posts: [
    {
      id: 's1',
      authorId: 'seed',
      thread: 'prompt',
      author: 'Areeba',
      stance: 'For',
      at: now - 3 * day,
      text: 'Yes. If you can only argue what you already believe, you are not debating, you are testifying.',
    },
    {
      id: 's2',
      authorId: 'seed',
      thread: 'prompt',
      author: 'Hamza',
      stance: 'Against',
      at: now - 2 * day,
      text: 'There is a line. Being drawn on the side of something you find cruel and performing it well is practice in the wrong skill.',
    },
    {
      id: 's3',
      authorId: 'seed',
      thread: 'prompt',
      author: 'Zoya',
      stance: 'Unsure',
      at: now - 1 * day,
      text: 'Depends who is in the room. In a practice round, yes. On a public stage with an audience that does not know the format, I am less sure.',
    },
    {
      id: 's4',
      authorId: 'seed',
      thread: 'article-rebuttal-is-listening',
      author: 'Bilal',
      at: now - 2 * day,
      text: 'The line about writing your opponent a better argument in your own notes is going on our club wall.',
    },
    {
      id: 's5',
      authorId: 'seed',
      thread: 'article-rebuttal-is-listening',
      author: 'Mahnoor',
      at: now - 1 * day,
      text: 'Counterpoint: in a seven-minute speech you do not always have time to steelman. Sometimes the fumble is the argument.',
    },
    {
      id: 's6',
      authorId: 'seed',
      thread: 'article-urdu-debate-is-not-a-translation',
      author: 'Saad',
      at: now - 4 * day,
      text: 'Would love to see a trial tournament with a munazara-style final.',
    },
    ...forumSeedPosts(),
  ],
}

function forumSeedPosts(): FloorPost[] {
  return seedReplies.map((r, i) => ({
    id: 'fs' + i,
    authorId: 'seed',
    thread: 'forum-' + r.topic,
    author: r.author,
    text: r.text,
    // spread replies on the same day a little apart, oldest first
    at: now - r.daysAgo * day + i * 60_000,
  }))
}

const empty: State = {
  likes: [],
  bookmarks: [],
  posts: [],
  drafts: [],
  notices: [],
  likeCounts: {},
  reported: [],
  myReports: [],
  topics: [],
  topicReports: [],
  myTopicReports: [],
  forumReady: true,
  error: null,
}
// Connected: start empty and fill from the database. Local: this browser's saved copy.
let state: State = CONNECTED ? empty : load()
const listeners = new Set<() => void>()
/** id of the signed-in account in connected mode */
let me: string | null = null

function load(): State {
  try {
    const raw = window.localStorage.getItem(KEY)
    if (raw) {
      const saved = JSON.parse(raw) as Partial<State>
      return {
        ...seed,
        ...saved,
        error: null,
        likeCounts: Object.fromEntries((saved.likes ?? []).map((k) => [k, 1])),
        reported: saved.reported ?? [],
        myReports: saved.myReports ?? [],
        posts: [
          ...(saved.posts ?? seed.posts),
          // visitors who saved before the forum existed get its sample replies too
          ...(saved.posts && !saved.topics ? forumSeedPosts() : []),
        ].map((p) => ({ ...p, authorId: p.authorId ?? 'preview-member' })),
        topics: saved.topics ?? seed.topics,
        topicReports: saved.topicReports ?? [],
        myTopicReports: saved.myTopicReports ?? [],
        forumReady: true,
        drafts: (saved.drafts ?? []).map((d) => ({
          ...d,
          postedById: d.postedById ?? 'preview-member',
        })),
      }
    }
  } catch {
    /* fall through to seed */
  }
  return seed
}
function set(next: State) {
  state = next
  if (!CONNECTED) {
    try {
      window.localStorage.setItem(KEY, JSON.stringify({ ...next, error: null }))
    } catch {
      /* storage unavailable: keep in memory for this visit */
    }
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
const uuid = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'x' + Date.now().toString(36) + Math.random().toString(36).slice(2)

/* ---- the database side. Every change is made on screen at once, then sent.
   If the database refuses (the rules in supabase/schema.sql), we reload the
   true state and show why. ---- */
type Row = Record<string, unknown>
const nameOf = (r: Row) => ((r.profiles as { display_name?: string } | null)?.display_name ?? 'Member') as string
const ms = (v: unknown) => (v ? new Date(v as string).getTime() : 0)

export async function hydrate(userId: string | null) {
  if (!supabase) return
  me = userId
  const [c, a, l, b, n, all, rep, ft, tr] = await Promise.all([
    supabase.from('comments').select('id, thread, body, stance, flagged, created_at, edited_at, author, profiles(display_name)').order('created_at'),
    supabase
      .from('articles')
      .select('id, title, author_name, ramz_line, body, status, review_note, posted_by, updated_at, profiles(display_name)')
      .order('updated_at', { ascending: false }),
    userId ? supabase.from('likes').select('item_key').eq('user_id', userId) : Promise.resolve({ data: [] as Row[] }),
    userId ? supabase.from('bookmarks').select('item_key').eq('user_id', userId) : Promise.resolve({ data: [] as Row[] }),
    userId
      ? supabase.from('notifications').select('id, kind, body, link, read, created_at').order('created_at', { ascending: false }).limit(30)
      : Promise.resolve({ data: [] as Row[] }),
    supabase.from('likes').select('item_key').limit(5000),
    userId ? supabase.from('reports').select('comment_id') : Promise.resolve({ data: [] as Row[] }),
    supabase
      .from('forum_topics')
      .select('id, board, title, body, author, pinned, locked, flagged, created_at, edited_at, profiles(display_name)')
      .order('created_at', { ascending: false }),
    userId ? supabase.from('topic_reports').select('topic_id') : Promise.resolve({ data: [] as Row[] }),
  ])
  const likeCounts: Record<string, number> = {}
  for (const r of (all.data ?? []) as Row[]) likeCounts[r.item_key as string] = (likeCounts[r.item_key as string] ?? 0) + 1
  set({
    likeCounts,
    reported: [...new Set(((rep.data ?? []) as Row[]).map((r) => r.comment_id as string))],
    myReports: state.myReports,
    // if the forum's tables are missing (forum.sql not run yet) the rest of the site still loads
    forumReady: !('error' in ft && ft.error),
    topics: ((ft.data ?? []) as Row[]).map((r) => ({
      id: r.id as string,
      board: r.board as BoardId,
      title: r.title as string,
      body: r.body as string,
      author: nameOf(r),
      authorId: r.author as string,
      pinned: !!r.pinned,
      locked: !!r.locked,
      flagged: !!r.flagged,
      at: ms(r.created_at),
      editedAt: r.edited_at ? ms(r.edited_at) : undefined,
    })),
    topicReports: [...new Set(((tr.data ?? []) as Row[]).map((r) => r.topic_id as string))],
    myTopicReports: state.myTopicReports,
    error: 'error' in c && c.error ? 'Could not reach the database. Check SETUP.md.' : null,
    posts: ((c.data ?? []) as Row[]).map((r) => ({
      id: r.id as string,
      thread: r.thread as string,
      author: nameOf(r),
      authorId: r.author as string,
      text: r.body as string,
      stance: (r.stance as Stance | null) ?? undefined,
      flagged: !!r.flagged,
      at: ms(r.created_at),
      editedAt: r.edited_at ? ms(r.edited_at) : undefined,
    })),
    drafts: ((a.data ?? []) as Row[]).map((r) => ({
      id: r.id as string,
      title: r.title as string,
      authorName: r.author_name as string,
      ramz: r.ramz_line as string,
      body: r.body as string,
      status: r.status as DraftStatus,
      note: (r.review_note as string | null) ?? undefined,
      postedBy: nameOf(r),
      postedById: r.posted_by as string,
      updatedAt: ms(r.updated_at),
    })),
    likes: ((l.data ?? []) as Row[]).map((r) => r.item_key as string),
    bookmarks: ((b.data ?? []) as Row[]).map((r) => r.item_key as string),
    notices: ((n.data ?? []) as Row[]).map((r) => ({
      id: r.id as string,
      kind: r.kind as string,
      body: r.body as string,
      link: (r.link as string | null) ?? null,
      read: !!r.read,
      at: ms(r.created_at),
    })),
  })
}

/** send a change; on refusal, show the reason and reload the truth */
function send(run: () => PromiseLike<{ error: { message: string } | null }>, after?: () => void) {
  if (!supabase) return
  void Promise.resolve(run()).then(({ error }) => {
    if (error) {
      void hydrate(me).then(() => set({ ...state, error: friendly(error.message) }))
    } else after?.()
  })
}
function friendly(message: string): string {
  if (/row-level security|permission denied/i.test(message)) return 'You do not have permission to do that.'
  if (/JWT|not authenticated/i.test(message)) return 'Please sign in again.'
  return message
}

export const actions = {
  clearError: () => set({ ...state, error: null }),

  toggleLike: (key: string) => {
    const on = !state.likes.includes(key)
    const count = Math.max(0, (state.likeCounts[key] ?? 0) + (on ? 1 : -1))
    set({
      ...state,
      likes: toggle(state.likes, key),
      likeCounts: { ...state.likeCounts, [key]: count },
    })
    if (supabase && me) {
      const uid = me
      send(() =>
        on ? supabase!.from('likes').insert({ user_id: uid, item_key: key }) : supabase!.from('likes').delete().eq('user_id', uid).eq('item_key', key),
      )
    }
  },
  toggleBookmark: (key: string) => {
    const on = !state.bookmarks.includes(key)
    set({ ...state, bookmarks: toggle(state.bookmarks, key) })
    if (supabase && me) {
      const uid = me
      send(() =>
        on ? supabase!.from('bookmarks').insert({ user_id: uid, item_key: key }) : supabase!.from('bookmarks').delete().eq('user_id', uid).eq('item_key', key),
      )
    }
  },

  addPost: (p: Omit<FloorPost, 'id' | 'at' | 'flagged'>) => {
    const id = uuid()
    set({ ...state, posts: [...state.posts, { ...p, id, at: Date.now() }] })
    if (supabase) {
      void supabase
        .from('comments')
        .insert({
          id,
          thread: p.thread,
          author: p.authorId,
          body: p.text,
          stance: p.stance ?? null,
        })
        .select('flagged')
        .single()
        .then(({ data, error }) => {
          if (error) void hydrate(me).then(() => set({ ...state, error: friendly(error.message) }))
          else if (data?.flagged)
            set({
              ...state,
              posts: state.posts.map((x) => (x.id === id ? { ...x, flagged: true } : x)),
            })
        })
    }
  },
  editPost: (id: string, text: string) => {
    set({
      ...state,
      posts: state.posts.map((p) => (p.id === id ? { ...p, text, editedAt: Date.now() } : p)),
    })
    if (supabase) {
      void supabase
        .from('comments')
        .update({ body: text })
        .eq('id', id)
        .select('flagged')
        .single()
        .then(({ data, error }) => {
          if (error) void hydrate(me).then(() => set({ ...state, error: friendly(error.message) }))
          else
            set({
              ...state,
              posts: state.posts.map((x) => (x.id === id ? { ...x, flagged: !!data?.flagged } : x)),
            })
        })
    }
  },
  deletePost: (id: string) => {
    set({ ...state, posts: state.posts.filter((p) => p.id !== id) })
    send(() => supabase!.from('comments').delete().eq('id', id))
  },
  /** any member: flag a reply for the owners to look at */
  reportPost: (id: string, reason = '') => {
    if (state.myReports.includes(id)) return
    set({
      ...state,
      myReports: [...state.myReports, id],
      reported: CONNECTED ? state.reported : [...state.reported, id],
    })
    if (supabase && me) {
      const uid = me
      send(() => supabase!.from('reports').insert({ comment_id: id, reporter: uid, reason }))
    }
  },
  /** owner: dismiss the reports on a reply */
  clearReports: (id: string) => {
    set({ ...state, reported: state.reported.filter((r) => r !== id) })
    send(() => supabase!.from('reports').delete().eq('comment_id', id))
  },
  /** owner: release a reply that the language check held */
  allowPost: (id: string) => {
    set({
      ...state,
      posts: state.posts.map((p) => (p.id === id ? { ...p, flagged: false } : p)),
    })
    send(() => supabase!.from('comments').update({ flagged: false }).eq('id', id))
  },

  /** create or update a draft; returns its id */
  saveDraft: (d: Omit<Draft, 'id' | 'updatedAt' | 'status'> & { id?: string }, submit = false): string => {
    const id = d.id ?? uuid()
    const existing = state.drafts.find((x) => x.id === id)
    // editing a returned essay turns it back into a draft
    const status: DraftStatus = submit ? 'pending' : existing ? (existing.status === 'rejected' ? 'draft' : existing.status) : 'draft'
    const next: Draft = {
      ...(existing ?? {}),
      ...d,
      id,
      status,
      updatedAt: Date.now(),
    }
    set({
      ...state,
      drafts: existing ? state.drafts.map((x) => (x.id === id ? next : x)) : [next, ...state.drafts],
    })
    send(() =>
      supabase!.from('articles').upsert({
        id,
        title: d.title || 'Untitled',
        author_name: d.authorName,
        ramz_line: d.ramz,
        body: d.body,
        posted_by: d.postedById,
        status,
      }),
    )
    return id
  },
  setDraftStatus: (id: string, status: DraftStatus, note?: string) => {
    set({
      ...state,
      drafts: state.drafts.map((d) => (d.id === id ? { ...d, status, note, updatedAt: Date.now() } : d)),
    })
    send(() =>
      supabase!
        .from('articles')
        .update({ status, review_note: note ?? null })
        .eq('id', id),
    )
  },
  deleteDraft: (id: string) => {
    set({ ...state, drafts: state.drafts.filter((d) => d.id !== id) })
    send(() => supabase!.from('articles').delete().eq('id', id))
  },

  /* ---- forum ---- */
  /** start a thread; returns its id */
  addTopic: (t: Pick<Topic, 'board' | 'title' | 'body' | 'author' | 'authorId'>): string => {
    const id = uuid()
    set({
      ...state,
      topics: [{ ...t, id, pinned: false, locked: false, at: Date.now() }, ...state.topics],
    })
    if (supabase) {
      void supabase
        .from('forum_topics')
        .insert({
          id,
          board: t.board,
          title: t.title,
          body: t.body,
          author: t.authorId,
        })
        .select('flagged')
        .single()
        .then(({ data, error }) => {
          if (error) void hydrate(me).then(() => set({ ...state, error: friendly(error.message) }))
          else if (data?.flagged)
            set({
              ...state,
              topics: state.topics.map((x) => (x.id === id ? { ...x, flagged: true } : x)),
            })
        })
    }
    return id
  },
  editTopic: (id: string, title: string, body: string, board: BoardId) => {
    set({
      ...state,
      topics: state.topics.map((t) => (t.id === id ? { ...t, title, body, board, editedAt: Date.now() } : t)),
    })
    if (supabase) {
      void supabase
        .from('forum_topics')
        .update({ title, body, board })
        .eq('id', id)
        .select('flagged')
        .single()
        .then(({ data, error }) => {
          if (error) void hydrate(me).then(() => set({ ...state, error: friendly(error.message) }))
          else
            set({
              ...state,
              topics: state.topics.map((x) => (x.id === id ? { ...x, flagged: !!data?.flagged } : x)),
            })
        })
    }
  },
  deleteTopic: (id: string) => {
    set({
      ...state,
      topics: state.topics.filter((t) => t.id !== id),
      posts: state.posts.filter((p) => p.thread !== 'forum-' + id),
    })
    send(() => supabase!.from('forum_topics').delete().eq('id', id))
  },
  /** editors and owners: pin or lock a thread */
  setTopicState: (id: string, change: Partial<Pick<Topic, 'pinned' | 'locked'>>) => {
    set({
      ...state,
      topics: state.topics.map((t) => (t.id === id ? { ...t, ...change } : t)),
    })
    send(() => supabase!.from('forum_topics').update(change).eq('id', id))
  },
  /** owner: release a thread the language check held */
  allowTopic: (id: string) => {
    set({
      ...state,
      topics: state.topics.map((t) => (t.id === id ? { ...t, flagged: false } : t)),
    })
    send(() => supabase!.from('forum_topics').update({ flagged: false }).eq('id', id))
  },
  reportTopic: (id: string, reason = '') => {
    if (state.myTopicReports.includes(id)) return
    set({
      ...state,
      myTopicReports: [...state.myTopicReports, id],
      topicReports: CONNECTED ? state.topicReports : [...state.topicReports, id],
    })
    if (supabase && me) {
      const uid = me
      send(() => supabase!.from('topic_reports').insert({ topic_id: id, reporter: uid, reason }))
    }
  },
  clearTopicReports: (id: string) => {
    set({ ...state, topicReports: state.topicReports.filter((r) => r !== id) })
    send(() => supabase!.from('topic_reports').delete().eq('topic_id', id))
  },

  markNoticesRead: () => {
    if (!state.notices.some((n) => !n.read)) return
    set({
      ...state,
      notices: state.notices.map((n) => ({ ...n, read: true })),
    })
    if (supabase && me) {
      const uid = me
      send(() => supabase!.from('notifications').update({ read: true }).eq('user_id', uid).eq('read', false))
    }
  },
}

/* ---- articles: the built-in essays plus any reader essay an owner has approved ---- */
const mins = (words: number) => Math.max(1, Math.round(words / 200))
const isoDay = (t: number) => new Date(t).toISOString().slice(0, 10)

function draftDetail(d: Draft): ArticleDetail {
  return {
    brief: [],
    blocks: toBlocks(d.body),
    inARound: [],
    bio: `Posted by ${d.postedBy}.`,
  }
}

export function useArticles(): Article[] {
  const { drafts } = useStore()
  return useMemo(() => {
    const approved: Article[] = drafts
      .filter((d) => d.status === 'approved')
      .map((d) => {
        const blocks = toBlocks(d.body)
        const first = blocks.find((b) => b.t === 'p')
        return {
          slug: 'u-' + d.id,
          title: d.title,
          authorName: d.authorName || d.postedBy,
          postedBy: d.postedBy,
          date: isoDay(d.updatedAt),
          ramz: d.ramz,
          excerpt: first && first.t === 'p' ? first.text.slice(0, 160) + (first.text.length > 160 ? '…' : '') : '',
          category: 'Reader essay',
          readMins: mins(wordCount(blocks)),
        }
      })
    const base = baseArticles.map((a) => {
      const det = articleDetails[a.slug]
      return det ? { ...a, readMins: mins(wordCount(det.blocks)) } : a
    })
    return [...approved, ...base]
  }, [drafts])
}

export function getArticleDetail(slug: string): ArticleDetail | null {
  if (articleDetails[slug]) return articleDetails[slug]
  const d = state.drafts.find((x) => 'u-' + x.id === slug)
  return d ? draftDetail(d) : null
}

/* ---- language pre-check (layer 1 of 3: the friendly client-side note) ----
   The real enforcement is a database rule added in Phase 5; this only saves
   people a round trip. The list is a short placeholder for owners to replace. */
const BLOCKED = ['idiot', 'stupid', 'moron', 'bewakoof', 'ullu', 'jahil', 'بیوقوف', 'جاہل']
const LEET: Record<string, string> = {
  '0': 'o',
  '1': 'i',
  '3': 'e',
  '4': 'a',
  '5': 's',
  '7': 't',
  '@': 'a',
  $: 's',
  '!': 'i',
}

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

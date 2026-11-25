/* Ramz Tab data layer. Connected: Supabase tables, checked functions and
   Realtime. Preview (no database): the same shapes kept in this browser, with
   the same checks, so every screen works the same way in both. */
import { useEffect, useState } from 'react'
import { CONNECTED, supabase } from '../services/supabase'
import { checkBallot, makeCode, publicCopy, uid } from './engine'
import { FORMATS, type PublicDoc, type TabDoc, type TabEvent } from './types'
import { sampleEvents } from './sample'

export type EventSummary = {
  id: string
  slug: string
  name: string
  urdu: string
  kind: TabDoc['kind']
  format: TabDoc['format']
  start: string
  end: string
  finished: boolean
  venue: string
}

export type JudgeView = {
  event: { name: string; urdu: string; format: TabDoc['format']; scoreMin: number; scoreMax: number; replyMin: number; replyMax: number; prep: number }
  judge: { id: string; name: string }
  round: { n: number; status: string; motion: string; info: string; motionAt: number | null } | null
  debate: {
    id: string
    room: string
    role: 'chair' | 'panel' | 'trainee'
    teams: { id: string; name: string; speakers: { id: string; name: string }[] }[]
    panel: { name: string; role: string }[]
  } | null
  ballot: { scores: Record<string, number[]>; reason: string; at: number } | null
}

export type SchoolView = {
  event: { name: string; urdu: string; format: TabDoc['format']; start: string; regOpen: boolean }
  institution: { id: string; name: string }
  teams: { id: string; name: string; speakers: { id: string; name: string }[] }[]
  judges: { id: string; name: string }[]
}
export type SchoolPayload = { teams: { id?: string; name: string; speakers: string[] }[]; judges: { id?: string; name: string }[] }

const summary = (id: string, slug: string, d: Pick<TabDoc, 'name' | 'urdu' | 'kind' | 'format' | 'start' | 'end' | 'finished' | 'venue'>): EventSummary => ({
  id,
  slug,
  name: d.name,
  urdu: d.urdu,
  kind: d.kind,
  format: d.format,
  start: d.start,
  end: d.end,
  finished: d.finished,
  venue: d.venue,
})

/* plain message for any database refusal */
const plain = (m: string) =>
  m.includes('row-level security')
    ? 'You do not have permission to do that.'
    : m.includes('duplicate key')
      ? 'That web address is already taken. Try another.'
      : m

/* ======================= preview (this browser only) ======================= */

const KEY = 'ramz.tab.v1'
type LocalDb = { events: (TabEvent & { createdBy: string })[] }
let mem: LocalDb | null = null
const chan = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('ramz-tab') : null
const listeners = new Set<() => void>()
chan?.addEventListener('message', () => {
  mem = null
  listeners.forEach((l) => l())
})
function readLocal(): LocalDb {
  if (mem) return mem
  try {
    const raw = window.localStorage.getItem(KEY)
    if (raw) return (mem = JSON.parse(raw) as LocalDb)
  } catch {
    /* fall through to the samples */
  }
  mem = { events: sampleEvents().map((e) => ({ ...e, createdBy: 'preview-owner' })) }
  writeLocal(mem, false)
  return mem
}
function writeLocal(db: LocalDb, notify = true) {
  mem = db
  try {
    window.localStorage.setItem(KEY, JSON.stringify(db))
  } catch {
    /* storage full or blocked: keep it in memory */
  }
  if (notify) {
    chan?.postMessage('changed')
    listeners.forEach((l) => l())
  }
}
const previewUser = (): { id: string; role: string } | null => {
  try {
    return JSON.parse(window.localStorage.getItem('ramz.preview-session') ?? 'null')
  } catch {
    return null
  }
}
const canDirect = (e: { staff: string[] }) => {
  const u = previewUser()
  return !!u && (u.role === 'owner' || e.staff.includes(u.id))
}

/* ======================= the API every screen uses ======================= */

export const tab = {
  connected: CONNECTED,

  /** events anyone can see, plus the ones you direct */
  async list(): Promise<{ open: EventSummary[]; mine: EventSummary[] }> {
    if (!supabase) {
      const db = readLocal()
      return {
        open: db.events.map((e) => summary(e.id, e.slug, e.doc)),
        mine: db.events.filter(canDirect).map((e) => summary(e.id, e.slug, e.doc)),
      }
    }
    const [pub, mine] = await Promise.all([supabase.from('tab_public').select('event_id, slug, doc'), supabase.from('tab_events').select('id, slug, doc')])
    return {
      open: ((pub.data ?? []) as { event_id: string; slug: string; doc: PublicDoc }[]).map((p) => summary(p.event_id, p.slug, p.doc)),
      mine: ((mine.data ?? []) as { id: string; slug: string; doc: TabDoc }[]).map((e) => summary(e.id, e.slug, e.doc)),
    }
  },

  async create(slug: string, doc: TabDoc, userId: string): Promise<TabEvent> {
    if (!supabase) {
      const db = readLocal()
      if (db.events.some((e) => e.slug === slug)) throw new Error('That web address is already taken. Try another.')
      const ev = { id: uid(), slug, version: 1, doc, staff: [userId], createdAt: Date.now(), createdBy: userId }
      writeLocal({ events: [...db.events, ev] })
      return ev
    }
    const { data, error } = await supabase.from('tab_events').insert({ slug, doc }).select('id, slug, version, created_at').single()
    if (error) throw new Error(plain(error.message))
    await supabase.from('tab_public').upsert({ event_id: data.id, slug, doc: publicCopy(doc) })
    return { id: data.id, slug, version: data.version, doc, staff: [userId], createdAt: Date.parse(data.created_at) }
  },

  /** the full event, for its directors */
  async load(slug: string): Promise<TabEvent | null> {
    if (!supabase) {
      const e = readLocal().events.find((x) => x.slug === slug)
      return e && canDirect(e) ? structuredClone(e) : null
    }
    const { data } = await supabase.from('tab_events').select('id, slug, version, doc, created_at').eq('slug', slug).maybeSingle()
    if (!data) return null
    const { data: st } = await supabase.from('tab_staff').select('user_id').eq('event_id', data.id)
    return {
      id: data.id,
      slug: data.slug,
      version: data.version,
      doc: data.doc as TabDoc,
      staff: (st ?? []).map((s) => s.user_id as string),
      createdAt: Date.parse(data.created_at),
    }
  },

  /** Change an event. `change` gets the newest copy; if someone else saved first it runs again on theirs. */
  async save(ev: TabEvent, change: (doc: TabDoc) => TabDoc): Promise<TabEvent> {
    if (!supabase) {
      const db = readLocal()
      const i = db.events.findIndex((x) => x.id === ev.id)
      if (i < 0) throw new Error('This event no longer exists.')
      const cur = db.events[i]
      const next = { ...cur, doc: change(structuredClone(cur.doc)), version: cur.version + 1 }
      const events = [...db.events]
      events[i] = next
      writeLocal({ events })
      return structuredClone(next)
    }
    let base = ev
    for (let attempt = 0; attempt < 4; attempt++) {
      const doc = change(structuredClone(base.doc))
      const { data, error } = await supabase
        .from('tab_events')
        .update({ doc, version: base.version + 1 })
        .eq('id', base.id)
        .eq('version', base.version)
        .select('version')
        .maybeSingle()
      if (!error && data) {
        await supabase.from('tab_public').upsert({ event_id: base.id, slug: base.slug, doc: publicCopy(doc) })
        return { ...base, doc, version: data.version }
      }
      if (error && !error.message.includes('Someone else')) throw new Error(plain(error.message))
      const fresh = await tab.load(base.slug)
      if (!fresh) throw new Error('This event no longer exists.')
      base = fresh
    }
    throw new Error('The event is changing quickly. Try again in a moment.')
  },

  /** refresh the public copy (after a judge or school wrote to the event) */
  async republish(ev: TabEvent) {
    if (supabase) await supabase.from('tab_public').upsert({ event_id: ev.id, slug: ev.slug, doc: publicCopy(ev.doc) })
  },

  async remove(ev: TabEvent) {
    if (!supabase) {
      writeLocal({ events: readLocal().events.filter((e) => e.id !== ev.id) })
      return
    }
    const { error } = await supabase.from('tab_events').delete().eq('id', ev.id)
    if (error) throw new Error(plain(error.message))
  },

  async loadPublic(slug: string): Promise<{ id: string; doc: PublicDoc } | null> {
    if (!supabase) {
      const e = readLocal().events.find((x) => x.slug === slug)
      return e ? { id: e.id, doc: publicCopy(e.doc) } : null
    }
    const { data } = await supabase.from('tab_public').select('event_id, doc').eq('slug', slug).maybeSingle()
    return data ? { id: data.event_id as string, doc: data.doc as PublicDoc } : null
  },

  /** be told when an event changes; returns a function that stops listening */
  watch(eventId: string, private_: boolean, cb: () => void): () => void {
    if (!supabase) {
      listeners.add(cb)
      return () => listeners.delete(cb)
    }
    const table = private_ ? 'tab_events' : 'tab_public'
    const col = private_ ? 'id' : 'event_id'
    const ch = supabase
      .channel(`${table}-${eventId}-${Math.random().toString(36).slice(2)}`)
      .on('postgres_changes', { event: '*', schema: 'public', table, filter: `${col}=eq.${eventId}` }, () => cb())
      .subscribe()
    // a slow fallback in case Realtime is switched off for the project
    const poll = window.setInterval(cb, 20000)
    return () => {
      window.clearInterval(poll)
      void supabase!.removeChannel(ch)
    }
  },

  async directors(ev: TabEvent): Promise<{ id: string; name: string }[]> {
    if (!supabase) return ev.staff.map((id) => ({ id, name: id.replace('preview-', 'Preview ') }))
    const { data } = await supabase.from('profiles').select('id, display_name').in('id', ev.staff)
    return (data ?? []).map((p) => ({ id: p.id as string, name: p.display_name as string }))
  },

  async addDirector(ev: TabEvent, email: string): Promise<string> {
    if (!supabase) throw new Error('Adding directors by email works on the live site, where people have accounts.')
    const { data, error } = await supabase.rpc('tab_add_director', { p_event: ev.id, p_email: email })
    if (error) throw new Error(plain(error.message))
    return data as string
  },

  /* ---------- judges ---------- */
  async judgeView(code: string): Promise<JudgeView> {
    if (!supabase) return localJudgeView(code)
    const { data, error } = await supabase.rpc('tab_judge_view', { p_code: code })
    if (error) throw new Error(plain(error.message))
    return data as JudgeView
  },
  async submitBallot(code: string, round: number, debate: string, scores: Record<string, number[]>, reason: string) {
    if (!supabase) return localSubmit(code, round, debate, scores, reason)
    const { error } = await supabase.rpc('tab_submit_ballot', { p_code: code, p_round: round, p_debate: debate, p_scores: scores, p_reason: reason })
    if (error) throw new Error(plain(error.message))
  },

  /* ---------- schools ---------- */
  async schoolView(token: string): Promise<SchoolView> {
    if (!supabase) return localSchoolView(token)
    const { data, error } = await supabase.rpc('tab_school_view', { p_token: token })
    if (error) throw new Error(plain(error.message))
    return data as SchoolView
  },
  async schoolSave(token: string, payload: SchoolPayload) {
    if (!supabase) return localSchoolSave(token, payload)
    const { error } = await supabase.rpc('tab_school_save', { p_token: token, p_payload: payload })
    if (error) throw new Error(plain(error.message))
  },

  /** every event, for the owner's impact page */
  async allEvents(): Promise<TabEvent[]> {
    if (!supabase) return readLocal().events.map((e) => structuredClone(e))
    const { data } = await supabase.from('tab_events').select('id, slug, version, doc, created_at')
    return (data ?? []).map((e) => ({ id: e.id, slug: e.slug, version: e.version, doc: e.doc as TabDoc, staff: [], createdAt: Date.parse(e.created_at) }))
  },

  /** motions from finished events, for the Motions archive */
  async archiveMotions(): Promise<{ slug: string; event: string; date: string; format: TabDoc['format']; n: number; motion: string }[]> {
    let docs: { slug: string; doc: PublicDoc | TabDoc }[]
    if (!supabase) docs = readLocal().events.map((e) => ({ slug: e.slug, doc: publicCopy(e.doc) }))
    else {
      const { data } = await supabase.from('tab_public').select('slug, doc')
      docs = (data ?? []) as { slug: string; doc: PublicDoc }[]
    }
    return docs
      .filter((e) => e.doc.finished)
      .flatMap((e) =>
        (e.doc.rounds as { n: number; motion: string }[])
          .filter((r) => r.motion)
          .map((r) => ({ slug: `${e.slug}-r${r.n}`, event: e.doc.name, date: e.doc.start, format: e.doc.format, n: r.n, motion: r.motion })),
      )
  },
}

/* ---------- preview versions of the judge and school functions (same rules) ---------- */

function findByCode(code: string) {
  const db = readLocal()
  for (const e of db.events) {
    const j = e.doc.judges.find((x) => x.code === code.trim().toUpperCase() && x.active)
    if (j) return { e, j, db }
  }
  throw new Error('That code is not valid.')
}

function localJudgeView(code: string): JudgeView {
  const { e, j } = findByCode(code)
  const d = e.doc
  const r = [...d.rounds].sort((a, b) => b.n - a.n).find((x) => x.status === 'released' || x.status === 'motion') ?? null
  const deb = r?.debates.find((x) => x.panel.some((s) => s.judge === j.id)) ?? null
  const seat = deb?.panel.find((s) => s.judge === j.id)
  const b = deb && r ? r.ballots.find((x) => x.debate === deb.id && x.judge === j.id) : null
  return {
    event: {
      name: d.name,
      urdu: d.urdu,
      format: d.format,
      scoreMin: d.scoreMin,
      scoreMax: d.scoreMax,
      replyMin: d.replyMin,
      replyMax: d.replyMax,
      prep: d.prep,
    },
    judge: { id: j.id, name: j.name },
    round: r
      ? {
          n: r.n,
          status: r.status,
          motion: r.status === 'motion' ? r.motion : '',
          info: r.status === 'motion' ? r.info : '',
          motionAt: r.status === 'motion' ? (r.motionAt ?? null) : null,
        }
      : null,
    debate:
      deb && seat
        ? {
            id: deb.id,
            room: d.rooms.find((x) => x.id === deb.room)?.name ?? '',
            role: seat.role,
            teams: deb.teams.map((tid) => {
              const t = d.teams.find((x) => x.id === tid)!
              return { id: t.id, name: t.name, speakers: t.speakers }
            }),
            panel: deb.panel.map((s) => ({ name: d.judges.find((x) => x.id === s.judge)?.name ?? '', role: s.role })),
          }
        : null,
    ballot: b ? { scores: b.scores, reason: b.reason, at: b.at } : null,
  }
}

function localSubmit(code: string, n: number, debate: string, scores: Record<string, number[]>, reason: string) {
  const { e, j, db } = findByCode(code)
  const r = e.doc.rounds.find((x) => x.n === n)
  if (!r) throw new Error('Ballots for this round are closed.')
  const problem = checkBallot(e.doc, r, { debate, judge: j.id, scores })
  if (problem) throw new Error(problem)
  if (reason.length > 800) throw new Error('Keep the reason under 800 characters.')
  const at = Date.now()
  r.ballots = [...r.ballots.filter((b) => !(b.debate === debate && b.judge === j.id)), { debate, judge: j.id, at, scores, reason }]
  r.lastBallotAt = at
  e.version += 1
  writeLocal(db)
}

/** registration closes once any round is drawn; rounds that are only planned do not count */
const drawnYet = (d: TabDoc) => d.rounds.some((r) => r.status !== 'setup')

function findByToken(token: string) {
  const db = readLocal()
  for (const e of db.events) {
    const inst = e.doc.institutions.find((i) => i.token === token)
    if (inst) return { e, inst, db }
  }
  throw new Error('That registration link is not valid.')
}

function localSchoolView(token: string): SchoolView {
  const { e, inst } = findByToken(token)
  const d = e.doc
  return {
    event: { name: d.name, urdu: d.urdu, format: d.format, start: d.start, regOpen: d.regOpen && !drawnYet(d) },
    institution: { id: inst.id, name: inst.name },
    teams: d.teams.filter((t) => t.inst === inst.id).map((t) => ({ id: t.id, name: t.name, speakers: t.speakers })),
    judges: d.judges.filter((j) => j.inst === inst.id).map((j) => ({ id: j.id, name: j.name })),
  }
}

function localSchoolSave(token: string, p: SchoolPayload) {
  const { e, inst, db } = findByToken(token)
  const d = e.doc
  if (!d.regOpen || drawnYet(d)) throw new Error('Registration is closed. Ask the tournament director to make changes.')
  const nspk = FORMATS[d.format].speakers
  if (p.teams.length > 30 || p.judges.length > 30) throw new Error('A school can register at most 30 teams and 30 judges.')
  const teams = p.teams.map((t) => {
    const name = t.name.trim()
    if (!name || name.length > 60) throw new Error('Team names must be 1 to 60 characters.')
    const old = d.teams.find((x) => x.id === t.id && x.inst === inst.id)
    const speakers = Array.from({ length: nspk }, (_, k) => {
      const nm = (t.speakers[k] ?? '').trim()
      if (!nm || nm.length > 60) throw new Error('Each speaker needs a name or initials (up to 60 characters).')
      return { id: old?.speakers[k]?.id ?? uid(), name: nm }
    })
    return { id: old?.id ?? uid(), name, inst: inst.id, speakers, active: old?.active ?? true }
  })
  const judges = p.judges.map((j) => {
    const name = j.name.trim()
    if (!name || name.length > 60) throw new Error('Judge names must be 1 to 60 characters.')
    const old = d.judges.find((x) => x.id === j.id && x.inst === inst.id)
    return { id: old?.id ?? uid(), name, inst: inst.id, rating: old?.rating ?? 3, code: old?.code ?? makeCode(10), active: old?.active ?? true }
  })
  d.teams = [...d.teams.filter((t) => t.inst !== inst.id), ...teams]
  d.judges = [...d.judges.filter((j) => j.inst !== inst.id), ...judges]
  e.version += 1
  writeLocal(db)
}

/* ---------- a tiny hook: re-run a loader whenever the event changes ---------- */
export function useLive<T>(load: () => Promise<T>, eventId: string | null, private_: boolean, deps: unknown[] = []) {
  const [state, setState] = useState<{ data: T | null; error: string | null; loading: boolean }>({ data: null, error: null, loading: true })
  useEffect(() => {
    let alive = true
    const run = () =>
      load().then(
        (data) => alive && setState({ data, error: null, loading: false }),
        (e: Error) => alive && setState({ data: null, error: e.message, loading: false }),
      )
    void run()
    const stop = eventId ? tab.watch(eventId, private_, run) : !supabase ? tab.watch('', private_, run) : () => {}
    return () => {
      alive = false
      stop()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId, private_, ...deps])
  return state
}

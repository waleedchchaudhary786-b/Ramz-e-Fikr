/* The Forum: member-started threads grouped into boards.
   /forum            every thread, with boards, search and sorting
   /forum/board/<id> one board
   /forum/<id>       one thread and its replies
   Replies reuse the Floor's Thread component (thread key 'forum-<id>'). */
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { AnimatePresence } from "motion/react";
import { Lock, Pin, Search as SearchIcon, X } from "lucide-react";
import {
  CountUp,
  DUR,
  EASE_CALM,
  EASE_SNAP,
  Reveal,
  RevealItem,
  StampIn,
  Stick,
  motion,
  useReducedMotion,
} from "../utils/motion";
import { Link, useRouter } from "../utils/router";
import { BOARDS, boardOf, type BoardId } from "../data/forum";
import {
  actions,
  findBlocked,
  timeAgo,
  useStore,
  type Topic,
} from "../services/store";
import { useSession } from "../services/session";
import { CONNECTED } from "../services/supabase";
import { Filter, Reaction } from "../components/Bits";
import { Stamp, Sym } from "../components/Symbols";
import { Scribble } from "../components/Doodles";
import { PageHead } from "./PlaceholderView";
import { Thread } from "./FloorView";

const SORTS = [
  "Latest activity",
  "Newest",
  "Most replies",
  "Unanswered",
] as const;
type Sort = (typeof SORTS)[number];
const PAGE = 10;
const TILTS = ["-0.8deg", "0.6deg", "-0.4deg", "0.9deg", "-0.6deg", "0.5deg"];

/** reply count and last activity for each thread */
function useThreadStats() {
  const { posts } = useStore();
  return useMemo(() => {
    const m = new Map<string, { n: number; last: number; lastBy: string }>();
    for (const p of posts) {
      if (!p.thread.startsWith("forum-")) continue;
      const id = p.thread.slice(6);
      const cur = m.get(id) ?? { n: 0, last: 0, lastBy: "" };
      cur.n += 1;
      if (p.at > cur.last) {
        cur.last = p.at;
        cur.lastBy = p.author;
      }
      m.set(id, cur);
    }
    return m;
  }, [posts]);
}

const isStaff = (role?: string) => role === "editor" || role === "owner";

export default function ForumView() {
  const { path } = useRouter();
  const parts = path.split("/").filter(Boolean);
  const { forumReady } = useStore();
  if (!forumReady) return <ForumNotReady />;
  if (parts[1] === "board" && parts[2])
    return <ForumIndex key={parts[2]} board={parts[2] as BoardId} />;
  if (parts[1]) return <TopicPage key={parts[1]} id={parts[1]} />;
  return <ForumIndex key="all" />;
}

function ForumNotReady() {
  return (
    <>
      <PageHead
        symbol="asterism"
        title="The Forum"
        purpose="Member-started threads on anything debate."
      />
      <div className="wrap max-w-2xl pt-6">
        <p className="measure border-l-2 border-oxblood pl-4">
          The forum needs a one-time database update before it can open. An
          owner should run <code className="font-mono">supabase/forum.sql</code>{" "}
          in the Supabase SQL Editor. Instructions are in SETUP.md.
        </p>
      </div>
    </>
  );
}

/* ============================ index ============================ */

function ForumIndex({ board }: { board?: BoardId }) {
  const { topics, posts } = useStore();
  const { user } = useSession();
  const stats = useThreadStats();
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<Sort | "All">("Latest activity");
  const [shown, setShown] = useState(PAGE);
  const [composing, setComposing] = useState(false);
  const current = board ? boardOf(board) : null;

  const forumPosts = posts.filter((p) => p.thread.startsWith("forum-"));
  const people = new Set([
    ...topics.map((t) => t.authorId + t.author),
    ...forumPosts.map((p) => p.authorId + p.author),
  ]).size;

  const list = useMemo(() => {
    const words = q.toLowerCase().split(/\s+/).filter(Boolean);
    const activity = (t: Topic) => Math.max(t.at, stats.get(t.id)?.last ?? 0);
    const replies = (t: Topic) => stats.get(t.id)?.n ?? 0;
    let l = topics.filter(
      (t) =>
        (!board || t.board === board) &&
        words.every((w) =>
          (t.title + " " + t.body + " " + t.author).toLowerCase().includes(w),
        ),
    );
    if (sort === "Unanswered") l = l.filter((t) => replies(t) === 0);
    const by: Record<string, (a: Topic, b: Topic) => number> = {
      "Latest activity": (a, b) => activity(b) - activity(a),
      Newest: (a, b) => b.at - a.at,
      "Most replies": (a, b) =>
        replies(b) - replies(a) || activity(b) - activity(a),
      Unanswered: (a, b) => b.at - a.at,
      All: (a, b) => activity(b) - activity(a),
    };
    // pinned threads stay on top whatever the order
    return [...l].sort(
      (a, b) => Number(b.pinned) - Number(a.pinned) || by[sort](a, b),
    );
  }, [topics, stats, q, sort, board]);

  useEffect(() => setShown(PAGE), [q, sort]);

  return (
    <>
      <PageHead
        symbol="asterism"
        title={current ? current.name : "The Forum"}
        purpose={
          current
            ? current.blurb
            : "Start a thread on anything debate, from motion prep to finding a partner. Members post, everyone can read."
        }
        note="Long arguments live here."
      />
      <div className="wrap">
        {current ? (
          <p className="-mt-4 mb-8 flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <Link
              to="/forum"
              className="font-mono text-[0.8125rem] text-oxblood underline underline-offset-2"
            >
              ⟵ All boards
            </Link>
            <span className="urdu text-2xl text-oxblood">{current.urdu}</span>
          </p>
        ) : (
          <>
            <dl className="mb-10 grid max-w-2xl grid-cols-3 border-y border-ink">
              {[
                ["Threads", topics.length],
                ["Replies", forumPosts.length],
                ["Voices", people],
              ].map(([label, n], i) => (
                <div
                  key={label}
                  className={`px-4 py-4 ${i ? "border-l border-border-warm" : ""}`}
                >
                  <dt className="label">{label}</dt>
                  <dd className="numeral mt-1 text-4xl text-oxblood">
                    <CountUp to={n as number} />
                  </dd>
                </div>
              ))}
            </dl>
            <BoardGrid />
          </>
        )}

        {/* toolbar */}
        <div className="mt-12 flex flex-col gap-4 border-t-2 border-ink pt-5 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-bold">
              {current ? "Threads on this board" : "Every thread"}
            </h2>
            <Scribble className="mt-1 block h-2.5 w-24 text-oxblood" />
          </div>
          {user ? (
            <button
              type="button"
              onClick={() => setComposing((c) => !c)}
              aria-expanded={composing}
              className="btn btn-primary self-start md:self-auto"
            >
              {composing ? "Close" : "Start a thread"}{" "}
              <span aria-hidden="true">{composing ? "×" : "+"}</span>
            </button>
          ) : (
            <Link
              to="/signin"
              className="btn btn-ghost self-start md:self-auto"
            >
              Sign in to start a thread
            </Link>
          )}
        </div>

        <AnimatePresence initial={false}>
          {composing && user && (
            <motion.div
              key="composer"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: DUR.slow, ease: EASE_CALM }}
              className="overflow-hidden"
            >
              <Composer
                defaultBoard={board}
                onDone={() => setComposing(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <label className="relative block w-full max-w-md">
            <span className="sr-only">Search threads</span>
            <SearchIcon
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-charcoal"
            />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search threads, words or names"
              className="paper-input !pl-9"
            />
            {q && (
              <button
                type="button"
                onClick={() => setQ("")}
                aria-label="Clear search"
                className="absolute top-1/2 right-2 grid h-8 w-8 -translate-y-1/2 place-items-center text-charcoal hover:text-oxblood"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </label>
          <Filter
            label="Order"
            options={SORTS}
            value={sort}
            onChange={setSort}
          />
        </div>

        <p className="meta mt-4" aria-live="polite">
          {list.length} {list.length === 1 ? "thread" : "threads"}
          {q && ` matching “${q}”`}
        </p>

        <ol className="mt-3 border-t border-ink">
          <AnimatePresence initial={false}>
            {list.slice(0, shown).map((t, i) => (
              <TopicRow
                key={t.id}
                t={t}
                i={i}
                stats={stats.get(t.id)}
                showBoard={!board}
              />
            ))}
          </AnimatePresence>
        </ol>
        {list.length === 0 && (
          <div className="py-10 text-center">
            <p className="font-display text-xl italic">Nothing here yet.</p>
            <p className="meta mt-2">
              {user
                ? "Start the first thread."
                : "Sign in to start the first thread."}
            </p>
          </div>
        )}
        {shown < list.length && (
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setShown((s) => s + PAGE)}
              className="btn btn-ghost"
            >
              Show {Math.min(PAGE, list.length - shown)} more
            </button>
          </div>
        )}

        {current && (
          <section className="mt-16" aria-labelledby="other-boards">
            <h2 id="other-boards" className="label !font-bold !text-ink">
              Other boards
            </h2>
            <BoardGrid exclude={current.id} compact />
          </section>
        )}
      </div>
    </>
  );
}

function BoardGrid({
  exclude,
  compact = false,
}: {
  exclude?: BoardId;
  compact?: boolean;
}) {
  const { topics } = useStore();
  const stats = useThreadStats();
  return (
    <Reveal
      stagger
      onMount
      className={`grid gap-6 sm:grid-cols-2 ${compact ? "mt-4 lg:grid-cols-5" : "lg:grid-cols-3"}`}
    >
      {BOARDS.filter((b) => b.id !== exclude).map((b, i) => {
        const inBoard = topics.filter((t) => t.board === b.id);
        const last = Math.max(
          0,
          ...inBoard.map((t) => Math.max(t.at, stats.get(t.id)?.last ?? 0)),
        );
        return (
          <RevealItem key={b.id}>
            <Link
              to={`/forum/board/${b.id}`}
              className={`index-card group block h-full px-5 pt-2.5 ${compact ? "pb-6" : "pb-9"}`}
              style={{ "--tilt": TILTS[i % TILTS.length] } as CSSProperties}
            >
              <span className="flex items-baseline justify-between gap-3">
                <span className="font-display text-xl font-bold group-hover:text-oxblood">
                  {b.name}
                </span>
                <span className="urdu text-lg text-oxblood">{b.urdu}</span>
              </span>
              {!compact && (
                <span className="mt-1 block text-[0.9375rem] leading-[1.5rem] text-charcoal">
                  {b.blurb}
                </span>
              )}
              <span className="meta mt-3 block">
                {inBoard.length} {inBoard.length === 1 ? "thread" : "threads"}
                {last > 0 && ` · active ${timeAgo(last)}`}
              </span>
            </Link>
          </RevealItem>
        );
      })}
    </Reveal>
  );
}

function TopicRow({
  t,
  i,
  stats,
  showBoard,
}: {
  t: Topic;
  i: number;
  stats?: { n: number; last: number; lastBy: string };
  showBoard: boolean;
}) {
  const reduced = !!useReducedMotion();
  const n = stats?.n ?? 0;
  return (
    <motion.li
      layout={!reduced}
      initial={reduced ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{
        duration: DUR.base,
        ease: EASE_SNAP,
        delay: reduced ? 0 : Math.min(i, 8) * 0.04,
      }}
      className="border-b border-border-warm"
    >
      <Link
        to={`/forum/${t.id}`}
        className="group grid grid-cols-[1fr_auto] items-start gap-x-5 py-4 md:grid-cols-[1fr_7rem_9rem]"
      >
        <span className="min-w-0">
          <span className="flex flex-wrap items-center gap-2">
            {t.pinned && (
              <span className="inline-flex items-center gap-1 font-mono text-[0.7rem] font-bold tracking-[0.12em] text-oxblood uppercase">
                <Pin aria-hidden="true" className="h-3.5 w-3.5" /> Pinned
              </span>
            )}
            {t.locked && (
              <span className="inline-flex items-center gap-1 font-mono text-[0.7rem] font-bold tracking-[0.12em] text-charcoal uppercase">
                <Lock aria-hidden="true" className="h-3.5 w-3.5" /> Locked
              </span>
            )}
            {showBoard && (
              <span className="font-mono text-[0.7rem] tracking-[0.12em] text-charcoal uppercase">
                {boardOf(t.board).name}
              </span>
            )}
            {t.flagged && (
              <strong className="font-mono text-[0.7rem] text-oxblood uppercase">
                Held for review
              </strong>
            )}
          </span>
          <span className="mt-1 block font-display text-lg leading-snug font-bold group-hover:text-oxblood md:text-xl">
            {t.title}
          </span>
          <span className="meta mt-1 block">
            {t.author} · {timeAgo(t.at)}
          </span>
        </span>
        <span className="text-right md:text-center">
          <span className="numeral block text-3xl leading-none text-oxblood">
            {n}
          </span>
          <span className="meta">{n === 1 ? "reply" : "replies"}</span>
        </span>
        <span className="meta hidden text-right md:block">
          {stats?.last ? (
            <>
              last reply {timeAgo(stats.last)}
              <span className="block truncate">by {stats.lastBy}</span>
            </>
          ) : (
            "no replies yet"
          )}
        </span>
      </Link>
    </motion.li>
  );
}

/* ============================ composer ============================ */

function Composer({
  defaultBoard,
  edit,
  onDone,
}: {
  defaultBoard?: BoardId;
  edit?: Topic;
  onDone: (id?: string) => void;
}) {
  const { user } = useSession();
  const { navigate } = useRouter();
  const [board, setBoard] = useState<BoardId>(
    edit?.board ?? defaultBoard ?? "prep",
  );
  const [title, setTitle] = useState(edit?.title ?? "");
  const [body, setBody] = useState(edit?.body ?? "");
  const blocked = findBlocked(title + " " + body);
  const ready = title.trim().length >= 4 && body.trim().length > 0 && !blocked;
  if (!user) return null;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !ready) return;
    if (edit) {
      actions.editTopic(edit.id, title.trim(), body.trim(), board);
      onDone(edit.id);
      return;
    }
    const id = actions.addTopic({
      board,
      title: title.trim(),
      body: body.trim(),
      author: user.name,
      authorId: user.id,
    });
    onDone(id);
    navigate(`/forum/${id}`);
  }

  return (
    <form
      onSubmit={submit}
      className="mt-6 border border-ink bg-ivory px-5 py-6 md:px-7"
    >
      <fieldset>
        <legend className="label">Board</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {BOARDS.map((b) => (
            <button
              key={b.id}
              type="button"
              aria-pressed={board === b.id}
              onClick={() => setBoard(b.id)}
              className={`min-h-11 border px-3 font-mono text-[0.8125rem] transition-colors md:min-h-9 ${
                board === b.id
                  ? "border-oxblood bg-oxblood text-ivory"
                  : "border-border-warm hover:border-oxblood"
              }`}
            >
              {b.name}
            </button>
          ))}
        </div>
      </fieldset>
      <label className="mt-5 block">
        <span className="label">Title</span>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={140}
          required
          placeholder="Ask a clear question or name the topic"
          className="paper-input mt-1"
        />
        <span className="meta mt-1 block text-right">{title.length} / 140</span>
      </label>
      <label className="mt-2 block">
        <span className="label">Your post, as {user.name}</span>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={6}
          maxLength={4000}
          required
          placeholder="Give enough context that someone can help. Leave a blank line between paragraphs."
          className="paper-area mt-1"
        />
        <span className="meta mt-1 block text-right">{body.length} / 4000</span>
      </label>
      {blocked && (
        <p className="mt-1 text-sm text-oxblood" role="alert">
          Please rephrase: “{blocked}” is not allowed here. Argue the point, not
          the person.
        </p>
      )}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={!ready}
          className="btn btn-primary disabled:opacity-50"
        >
          {edit ? "Save changes" : "Post thread"}{" "}
          <span aria-hidden="true" className="arrow">
            ⟶
          </span>
        </button>
        <button
          type="button"
          onClick={() => onDone()}
          className="btn btn-ghost"
        >
          Cancel
        </button>
        <p className="meta">
          Threads are checked for language. Anything held is seen only by you
          and the owners until it is reviewed.
        </p>
      </div>
    </form>
  );
}

/* ============================ one thread ============================ */

function TopicPage({ id }: { id: string }) {
  const { topics, myTopicReports } = useStore();
  const { user } = useSession();
  const { navigate } = useRouter();
  const stats = useThreadStats();
  const t = topics.find((x) => x.id === id);
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!t)
    return (
      <>
        <PageHead
          symbol="asterism"
          title="Thread not found"
          purpose="This thread does not exist, or it was removed."
        />
        <div className="wrap pt-4">
          <Link to="/forum" className="btn btn-primary">
            Back to the forum
          </Link>
        </div>
      </>
    );

  const b = boardOf(t.board);
  const mine = user?.id === t.authorId;
  const staff = isStaff(user?.role);
  const owner = user?.role === "owner";
  const n = stats.get(t.id)?.n ?? 0;
  const more = topics
    .filter((x) => x.board === t.board && x.id !== t.id)
    .slice(0, 4);
  const paragraphs = t.body
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <article className="wrap pt-10 md:pt-14">
      <nav aria-label="Breadcrumb" className="meta flex flex-wrap gap-2">
        <Link to="/forum" className="text-oxblood underline underline-offset-2">
          Forum
        </Link>
        <span aria-hidden="true">/</span>
        <Link
          to={`/forum/board/${b.id}`}
          className="text-oxblood underline underline-offset-2"
        >
          {b.name}
        </Link>
      </nav>

      <div className="mt-6 grid gap-12 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="min-w-0">
          <header>
            <div className="flex flex-wrap items-center gap-3">
              <StampIn>
                <Stamp>{b.name}</Stamp>
              </StampIn>
              {t.pinned && (
                <span className="inline-flex items-center gap-1 font-mono text-[0.75rem] font-bold tracking-[0.12em] text-oxblood uppercase">
                  <Pin aria-hidden="true" className="h-4 w-4" /> Pinned
                </span>
              )}
              {t.locked && (
                <span className="inline-flex items-center gap-1 font-mono text-[0.75rem] font-bold tracking-[0.12em] text-charcoal uppercase">
                  <Lock aria-hidden="true" className="h-4 w-4" /> Locked
                </span>
              )}
            </div>
            {!editing && (
              <h1 className="mt-4 max-w-3xl text-3xl leading-tight font-black md:text-5xl">
                {t.title}
              </h1>
            )}
            <p className="meta mt-3">
              Started by <strong className="text-ink">{t.author}</strong> ·{" "}
              {timeAgo(t.at)}
              {t.editedAt && ` · edited ${timeAgo(t.editedAt)}`} · {n}{" "}
              {n === 1 ? "reply" : "replies"}
            </p>
            {t.flagged && (
              <p className="mt-3 border-l-2 border-oxblood pl-3 text-[0.9375rem] font-bold text-oxblood">
                Held for review by the language check. Only you and the owners
                can see this thread until an owner allows it.
              </p>
            )}
          </header>

          {editing ? (
            <Composer edit={t} onDone={() => setEditing(false)} />
          ) : (
            <Stick rest={-0.3} className="torn-wrap relative mt-8">
              <span
                className="tape -top-2.5 left-10 z-10 -rotate-3"
                aria-hidden="true"
              />
              <div className="torn bg-ivory px-6 py-8 md:px-9">
                {paragraphs.map((p, i) => (
                  <p
                    key={i}
                    className={`measure text-[1.0625rem] leading-[1.8] whitespace-pre-line ${i ? "mt-4" : ""}`}
                  >
                    {p}
                  </p>
                ))}
              </div>
            </Stick>
          )}

          {!editing && (
            <div className="mt-6 flex flex-wrap items-center gap-2">
              <Reaction kind="like" itemKey={`forum:${t.id}`} />
              <Reaction kind="bookmark" itemKey={`forum:${t.id}`} />
              {mine && !(t.locked && !staff) && (
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="min-h-11 px-2 font-mono text-[0.8125rem] text-oxblood underline underline-offset-2"
                >
                  Edit
                </button>
              )}
              {(mine || owner) &&
                (confirmDelete ? (
                  <span className="flex items-center gap-2 font-mono text-[0.8125rem]">
                    Delete this thread and its replies?
                    <button
                      type="button"
                      onClick={() => {
                        actions.deleteTopic(t.id);
                        navigate("/forum");
                      }}
                      className="min-h-11 px-2 font-bold text-oxblood underline underline-offset-2"
                    >
                      Yes, delete
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(false)}
                      className="min-h-11 px-2 underline underline-offset-2"
                    >
                      No
                    </button>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(true)}
                    className="min-h-11 px-2 font-mono text-[0.8125rem] text-charcoal underline underline-offset-2"
                  >
                    Delete
                  </button>
                ))}
              {user && !mine && (
                <button
                  type="button"
                  disabled={myTopicReports.includes(t.id)}
                  onClick={() => actions.reportTopic(t.id)}
                  className="min-h-11 px-2 font-mono text-[0.8125rem] text-charcoal underline underline-offset-2 disabled:no-underline"
                >
                  {myTopicReports.includes(t.id)
                    ? "Reported: an owner will take a look"
                    : "Report"}
                </button>
              )}
            </div>
          )}

          {staff && !editing && (
            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border-warm pt-4">
              <span className="label mr-1">Moderate</span>
              <button
                type="button"
                aria-pressed={t.pinned}
                onClick={() =>
                  actions.setTopicState(t.id, { pinned: !t.pinned })
                }
                className="btn btn-ghost"
              >
                <Pin aria-hidden="true" className="h-4 w-4" />{" "}
                {t.pinned ? "Unpin" : "Pin to top"}
              </button>
              <button
                type="button"
                aria-pressed={t.locked}
                onClick={() =>
                  actions.setTopicState(t.id, { locked: !t.locked })
                }
                className="btn btn-ghost"
              >
                <Lock aria-hidden="true" className="h-4 w-4" />{" "}
                {t.locked ? "Unlock" : "Lock replies"}
              </button>
            </div>
          )}

          <section className="mt-12" aria-labelledby="replies-h">
            <h2
              id="replies-h"
              className="flex items-baseline gap-3 text-2xl font-bold"
            >
              <Sym name="leaf" />
              Replies
            </h2>
            {t.locked && (
              <p className="meta mt-2 flex items-center gap-1.5">
                <Lock aria-hidden="true" className="h-3.5 w-3.5" />
                {staff
                  ? "This thread is locked. As an editor or owner you can still reply."
                  : "This thread is locked. New replies are closed."}
              </p>
            )}
            <Thread thread={`forum-${t.id}`} locked={t.locked && !staff} />
          </section>
        </div>

        <aside className="space-y-10 lg:pt-2">
          <Reveal>
            <div
              className="index-card px-5 pt-2.5 pb-8"
              style={{ "--tilt": "0.7deg" } as CSSProperties}
            >
              <p className="label">This board</p>
              <p className="mt-1 flex items-baseline justify-between gap-3">
                <span className="font-display text-xl font-bold">{b.name}</span>
                <span className="urdu text-lg text-oxblood">{b.urdu}</span>
              </p>
              <p className="mt-1 text-[0.9375rem] text-charcoal">{b.blurb}</p>
              <Link
                to={`/forum/board/${b.id}`}
                className="mt-3 inline-block text-sm font-bold text-oxblood"
              >
                See all threads <span className="arrow">⟶</span>
              </Link>
            </div>
          </Reveal>
          {more.length > 0 && (
            <Reveal>
              <section aria-labelledby="more-h">
                <h2 id="more-h" className="label !font-bold !text-ink">
                  More on this board
                </h2>
                <ul className="mt-2">
                  {more.map((m) => (
                    <li key={m.id} className="border-b border-border-warm">
                      <Link
                        to={`/forum/${m.id}`}
                        className="block py-3 hover:text-oxblood"
                      >
                        <span className="font-display font-bold">
                          {m.title}
                        </span>
                        <span className="meta block">
                          {stats.get(m.id)?.n ?? 0} replies · {timeAgo(m.at)}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            </Reveal>
          )}
          <p className="meta">
            <Sym name="dagger" className="mr-1.5" />
            Argue the point, not the person. Tag people with @ and they get a
            notice{CONNECTED ? "" : " (in the live site)"}.
          </p>
        </aside>
      </div>
    </article>
  );
}

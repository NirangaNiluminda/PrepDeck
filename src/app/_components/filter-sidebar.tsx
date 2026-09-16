import {
  DIFFICULTIES,
  QUESTION_STATUSES,
  QUESTION_TYPES,
  type QuestionFacets,
  type TopicNode,
} from '@/modules/questions';
import type { BrowseParams } from '../_lib/browse-params';
import { DIFFICULTY_LABELS, STATUS_LABELS, TYPE_LABELS, topicLabel } from '../_lib/labels';
import { FilterFormEnhancer } from './filter-form-enhancer';

export const FILTER_FORM_ID = 'browse-filters';
const VISIBLE_TAGS = 12;

interface FilterSidebarProps {
  readonly params: BrowseParams;
  readonly facets: QuestionFacets;
  readonly isAdmin: boolean;
  readonly signedIn: boolean;
}

export function FilterSidebar({ params, facets, isAdmin, signedIn }: FilterSidebarProps) {
  // Ticked tags come first, and stay listed even when nothing matches them any
  // more, so they can always be unticked.
  const selected = new Set(params.tags);
  const counted = new Map(facets.tags.map((t) => [t.tag, t.count]));
  const tags = [
    ...params.tags.map((tag) => ({ tag, count: counted.get(tag) ?? 0 })),
    ...facets.tags.filter((t) => !selected.has(t.tag)),
  ];
  const visibleTags = tags.slice(0, Math.max(VISIBLE_TAGS, selected.size));
  const moreTags = tags.slice(visibleTags.length);
  const allCount = facets.topics.reduce((sum, t) => sum + t.count, 0);

  return (
    <aside id="filters" aria-label="Filters" className="scroll-mt-4 text-sm md:order-first">
      <form id={FILTER_FORM_ID} action="/" method="get" className="space-y-6">
        {signedIn && (
          <Group legend="Library">
            <Choice name="bookmarked" value="1" checked={params.bookmarked} label="Bookmarked only" />
          </Group>
        )}

        <Group legend="Topic">
          <Choice type="radio" name="topic" value="" checked={!params.topic} label="All topics" count={allCount} indent />
          <TopicTree nodes={facets.topics} selected={params.topic} />
        </Group>

        <Group legend="Difficulty">
          {DIFFICULTIES.map((d) => (
            <Choice key={d} name="difficulty" value={d} checked={params.difficulties.includes(d)} label={DIFFICULTY_LABELS[d]} />
          ))}
        </Group>

        <Group legend="Type">
          {QUESTION_TYPES.map((t) => (
            <Choice key={t} name="type" value={t} checked={params.types.includes(t)} label={TYPE_LABELS[t]} />
          ))}
        </Group>

        {isAdmin && (
          <Group legend="Status">
            {QUESTION_STATUSES.map((s) => (
              <Choice key={s} name="status" value={s} checked={params.statuses.includes(s)} label={STATUS_LABELS[s]} />
            ))}
            <p className="px-1 pt-1 text-xs text-zinc-500 dark:text-zinc-400">
              With none ticked, archived questions are hidden.
            </p>
          </Group>
        )}

        {tags.length > 0 && (
          <Group legend="Tags">
            {visibleTags.map(({ tag, count }) => (
              <Choice key={tag} name="tag" value={tag} checked={selected.has(tag)} label={`#${tag}`} count={count} />
            ))}
            {moreTags.length > 0 && (
              <details className="pt-1">
                <summary className="cursor-pointer px-1 text-xs text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200">
                  {moreTags.length} more tags
                </summary>
                <div className="space-y-0.5 pt-1">
                  {moreTags.map(({ tag, count }) => (
                    <Choice key={tag} name="tag" value={tag} checked={false} label={`#${tag}`} count={count} />
                  ))}
                </div>
              </details>
            )}
          </Group>
        )}

        <noscript>
          <button type="submit" className="rounded-md bg-indigo-600 px-3 py-1.5 font-medium text-white">
            Apply filters
          </button>
        </noscript>
        <FilterFormEnhancer formId={FILTER_FORM_ID} />
      </form>
    </aside>
  );
}

function Group({ legend, children }: { legend: string; children: React.ReactNode }) {
  return (
    <fieldset className="space-y-0.5">
      <legend className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        {legend}
      </legend>
      {children}
    </fieldset>
  );
}

interface ChoiceProps {
  readonly name: string;
  readonly value: string;
  readonly checked: boolean;
  readonly label: string;
  readonly count?: number;
  readonly type?: 'checkbox' | 'radio';
  /** Lines a leaf up with siblings that have an expand chevron. */
  readonly indent?: boolean;
}

function Choice({ name, value, checked, label, count, type = 'checkbox', indent = false }: ChoiceProps) {
  return (
    <label
      className={`flex min-w-0 flex-1 cursor-pointer items-center gap-2 rounded px-1 py-0.5 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 ${indent ? 'ml-4' : ''}`}
    >
      <input type={type} name={name} value={value} defaultChecked={checked} className="size-3.5 shrink-0 accent-indigo-600" />
      <span className="min-w-0 flex-1 truncate text-zinc-700 dark:text-zinc-300">{label}</span>
      {count !== undefined && (
        <span className="tabular-nums text-xs text-zinc-400 dark:text-zinc-500">{count}</span>
      )}
    </label>
  );
}

const isWithin = (selected: string | undefined, path: string) =>
  selected !== undefined && (selected === path || selected.startsWith(`${path}/`));

function TopicTree({ nodes, selected }: { nodes: readonly TopicNode[]; selected?: string }) {
  return (
    <ul className="space-y-0.5">
      {nodes.map((node) => {
        const choice = (
          <Choice
            type="radio"
            name="topic"
            value={node.path}
            checked={selected === node.path}
            label={topicLabel(node.slug)}
            count={node.count}
            indent={node.children.length === 0}
          />
        );
        return (
          <li key={node.path}>
            {node.children.length === 0 ? (
              choice
            ) : (
              // Open along the path to the selected topic. Clicking the label
              // picks the topic; only the chevron expands or collapses it.
              <details open={isWithin(selected, node.path)} className="group">
                <summary className="flex cursor-pointer list-none items-center [&::-webkit-details-marker]:hidden">
                  <svg
                    aria-hidden
                    viewBox="0 0 16 16"
                    className="size-4 shrink-0 text-zinc-400 transition-transform group-open:rotate-90"
                    fill="currentColor"
                  >
                    <path d="M6 4l4 4-4 4V4z" />
                  </svg>
                  {choice}
                </summary>
                <div className="ml-2 border-l border-zinc-200 pl-2 dark:border-zinc-800">
                  <TopicTree nodes={node.children} selected={selected} />
                </div>
              </details>
            )}
          </li>
        );
      })}
    </ul>
  );
}

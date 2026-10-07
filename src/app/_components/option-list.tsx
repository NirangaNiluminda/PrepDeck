interface Option {
  readonly id: string;
  readonly text: string;
}

interface OptionListProps {
  readonly options: readonly Option[];
  readonly correctOptionId?: string;
  readonly revealed: boolean;
  readonly picked: string | null;
  readonly onPick: (optionId: string) => void;
}

/** Multiple-choice options, shared by the question page and a practice card. Picking one is what reveals. */
export function OptionList({ options, correctOptionId, revealed, picked, onPick }: OptionListProps) {
  return (
    <div role="group" aria-label="Options" className="space-y-2.5">
      {options.map((option, index) => {
        const isCorrect = revealed && option.id === correctOptionId;
        const isWrongPick = revealed && picked === option.id && !isCorrect;
        const tone = isCorrect
          ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-400/10'
          : isWrongPick
            ? 'border-rose-400 bg-rose-50 dark:bg-rose-400/10'
            : 'border-line bg-surface enabled:hover:-translate-y-0.5 enabled:hover:border-brand-300 enabled:hover:shadow-md enabled:hover:shadow-brand-500/10';
        const bubble = isCorrect
          ? 'bg-emerald-500 text-white'
          : isWrongPick
            ? 'bg-rose-500 text-white'
            : 'bg-brand-50 text-brand-700 dark:bg-brand-400/15 dark:text-brand-200';
        return (
          <button
            key={option.id}
            type="button"
            disabled={revealed}
            onClick={() => onPick(option.id)}
            className={`flex w-full items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left text-sm font-medium shadow-sm transition disabled:cursor-default ${tone}`}
          >
            <span className={`flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${bubble}`}>
              {isCorrect ? '✓' : isWrongPick ? '✕' : String.fromCharCode(65 + index)}
            </span>
            <span className="flex-1 text-zinc-800 dark:text-zinc-200">{option.text}</span>
            {isCorrect && <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">Correct 🎉</span>}
            {isWrongPick && <span className="text-xs font-bold text-rose-700 dark:text-rose-300">Your pick</span>}
          </button>
        );
      })}
    </div>
  );
}

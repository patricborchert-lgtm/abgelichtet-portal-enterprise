interface MilestonePreviewProps {
  milestones: string[];
}

export function MilestonePreview({ milestones }: MilestonePreviewProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Milestone Preview</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {milestones.map((milestone, index) => (
          <span
            className="inline-flex items-center rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700"
            key={`${milestone}-${index}`}
          >
            {index + 1}. {milestone}
          </span>
        ))}
      </div>
    </div>
  );
}

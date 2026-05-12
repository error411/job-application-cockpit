'use client'

type DeleteJobFormProps = {
  jobId: string
  from: 'apply' | 'jobs'
  jobLabel: string
  archived?: boolean
}

export function DeleteJobForm({
  jobId,
  from,
  jobLabel,
  archived = false,
}: DeleteJobFormProps) {
  const buttonClass = archived
    ? 'rounded-md border border-rose-300 px-4 py-2 text-sm font-medium text-rose-700'
    : 'rounded-md border border-rose-200 px-4 py-2 text-sm font-medium text-rose-600'

  return (
    <form
      action={`/api/jobs/${jobId}/delete-form`}
      method="post"
      onSubmit={(event) => {
        if (
          !window.confirm(
            `Delete ${jobLabel}? This permanently removes the job and its related application data.`
          )
        ) {
          event.preventDefault()
        }
      }}
    >
      <input type="hidden" name="from" value={from} />
      <button className={buttonClass} type="submit">
        Delete Permanently
      </button>
    </form>
  )
}

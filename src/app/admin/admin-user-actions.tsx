'use client'

import { deleteUserAction, restoreUserAction, suspendUserAction } from './actions'

type AdminUserActionsProps = {
  userId: string
  isSuspended: boolean
  isProtected: boolean
  label: string
}

function ActionButton({
  children,
  tone = 'neutral',
}: {
  children: React.ReactNode
  tone?: 'neutral' | 'danger'
}) {
  const className =
    tone === 'danger'
      ? 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100'
      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'

  return (
    <button
      type="submit"
      className={`inline-flex h-9 items-center justify-center rounded-lg border px-3 text-xs font-semibold shadow-sm transition ${className}`}
    >
      {children}
    </button>
  )
}

export function AdminUserActions({
  userId,
  isSuspended,
  isProtected,
  label,
}: AdminUserActionsProps) {
  if (isProtected) {
    return (
      <span className="inline-flex h-9 items-center rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-500">
        Protected
      </span>
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <form
        action={isSuspended ? restoreUserAction : suspendUserAction}
        onSubmit={(event) => {
          const verb = isSuspended ? 'restore' : 'suspend'
          if (!window.confirm(`Are you sure you want to ${verb} ${label}?`)) {
            event.preventDefault()
          }
        }}
      >
        <input type="hidden" name="userId" value={userId} />
        <ActionButton>{isSuspended ? 'Restore' : 'Suspend'}</ActionButton>
      </form>

      <form
        action={deleteUserAction}
        onSubmit={(event) => {
          if (
            !window.confirm(
              `Delete ${label}? This permanently removes the auth user and cascades their app data.`
            )
          ) {
            event.preventDefault()
          }
        }}
      >
        <input type="hidden" name="userId" value={userId} />
        <ActionButton tone="danger">Delete</ActionButton>
      </form>
    </div>
  )
}

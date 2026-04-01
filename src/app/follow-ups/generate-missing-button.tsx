'use client'

import { useFormStatus } from 'react-dom'

type GenerateMissingButtonProps = {
  count: number
}

export default function GenerateMissingButton({
  count,
}: GenerateMissingButtonProps) {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      aria-disabled={pending}
      className={
        pending
          ? 'app-button-primary opacity-70 cursor-not-allowed'
          : 'app-button-primary'
      }
    >
      {pending
        ? 'Generating Follow-Up Content...'
        : `Generate Missing Follow-Up Content (${count})`}
    </button>
  )
}
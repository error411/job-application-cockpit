import Link from 'next/link'
import Image from 'next/image'

export function Footer() {
  return (
    <footer className="mt-10 border-t border-zinc-200 pt-8 pb-12">
      <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
        <div className="flex items-center gap-3">
          <Image
            src="/applyengine-mark.png"
            alt="ApplyEngine"
            width={32}
            height={32}
            className="h-8 w-8 opacity-80"
          />
          <p className="text-sm font-medium text-zinc-600">
            © {new Date().getFullYear()} ApplyEngine. All rights reserved.
          </p>
        </div>
        
        <div className="flex gap-6">
          <Link href="#" className="text-sm font-medium text-zinc-500 transition hover:text-zinc-950">
            Terms
          </Link>
          <Link href="#" className="text-sm font-medium text-zinc-500 transition hover:text-zinc-950">
            Privacy
          </Link>
          <a href="https://twitter.com/applyengine" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-zinc-500 transition hover:text-zinc-950">
            X / Twitter
          </a>
        </div>
      </div>
    </footer>
  )
}

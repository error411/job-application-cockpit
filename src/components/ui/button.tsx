import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        brand:
          'bg-blue-600 text-white shadow-sm hover:bg-blue-700',
        default:
          'bg-slate-900 text-white shadow-sm hover:bg-slate-800',
        secondary:
          'border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50',
        ghost:
          'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
        outline:
          'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
        destructive:
          'bg-red-600 text-white shadow-sm hover:bg-red-700',
      },
      size: {
        sm: 'h-9 px-3.5',
        default: 'h-11 px-4',
        lg: 'h-12 px-5',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'

    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    )
  }
)

Button.displayName = 'Button'

export { Button, buttonVariants }
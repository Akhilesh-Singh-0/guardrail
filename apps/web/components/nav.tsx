'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Logo } from '@/components/logo'
import { UserButton, useUser } from '@clerk/nextjs'
import { clerkAppearance } from '@/lib/clerk-appearance'

const links = [
  { href: '/dashboard',   label: 'Dashboard'  },
  { href: '/playground',  label: 'Playground' },
  { href: '/settings',    label: 'Settings'   },
]

export const Nav = () => {
  const pathname = usePathname()
  const { user } = useUser()

  return (
    <aside className="fixed top-0 left-0 h-screen w-[240px] flex flex-col border-r border-border bg-sidebar px-4 py-5">
      <div className="mb-8 px-1">
        <Logo size="sm" />
      </div>

      <nav className="flex-1 flex flex-col gap-0.5">
        {links.map(({ href, label }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`px-3 py-2 rounded-md text-sm transition-colors ${
                active
                  ? 'bg-accent text-accent-foreground font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
              }`}
            >
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="pt-4 border-t border-border flex items-center gap-3 px-1">
        <UserButton
          appearance={{
            ...clerkAppearance,
            elements: {
              ...clerkAppearance.elements,
              userButtonPopoverCard: {
                backgroundColor: '#111111',
                border: '1px solid rgba(255,255,255,0.08)',
              },
              userButtonPopoverActionButtonText: { color: '#a1a1aa' },
              userButtonPopoverFooter: { display: 'none' },
            }
          }}
        />
        <div className="min-w-0">
          <p className="text-xs font-medium text-foreground truncate">
            {user?.fullName ?? user?.firstName ?? 'User'}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {user?.primaryEmailAddress?.emailAddress}
          </p>
        </div>
      </div>
    </aside>
  )
}
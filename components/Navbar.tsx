'use client'

import Link from 'next/link'
import { signOut, useSession } from 'next-auth/react'

export default function Navbar() {
  const { data: session } = useSession()

  return (
    <nav className="bg-[#0a2618] shadow-lg border-b border-[#10b981]/20">
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold text-[#34d399]">Seed or Skip</span>
            </Link>
          </div>

          <div className="flex items-center">
            {session ? (
              <>
                {session.user.role === 'ADMIN' && (
                  <Link href="/admin" className="px-3 py-2 rounded-md text-sm font-medium text-[#34d399] hover:text-white hover:bg-[#10b981]/20 transition-colors">
                    Admin Dashboard
                  </Link>
                )}
                <Link href="/dashboard" className="px-3 py-2 rounded-md text-sm font-medium text-[#34d399] hover:text-white hover:bg-[#10b981]/20 transition-colors">
                  Dashboard
                </Link>
                <Link href="/leaderboard" className="px-3 py-2 rounded-md text-sm font-medium text-[#34d399] hover:text-white hover:bg-[#10b981]/20 transition-colors">
                  Leaderboard
                </Link>
                <button
                  onClick={() => signOut()}
                  className="ml-4 px-3 py-2 rounded-md text-sm font-medium text-[#34d399] hover:text-white hover:bg-[#10b981]/20 transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="px-3 py-2 rounded-md text-sm font-medium text-[#34d399] hover:text-white hover:bg-[#10b981]/20 transition-colors">
                  Login
                </Link>
                <Link href="/register" className="ml-4 px-3 py-2 rounded-md text-sm font-medium text-[#34d399] hover:text-white hover:bg-[#10b981]/20 transition-colors">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
} 
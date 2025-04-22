'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Register() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const teamName = formData.get('teamName') as string

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
          teamName,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Registration failed')
      }

      router.push('/login')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-[#34d399]">
            Create your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="name" className="sr-only">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="appearance-none rounded-t-md relative block w-full border border-[#10b981]/30 bg-[#0a2618]/80 text-[#e6f7f0] placeholder-[#10b981]/50 focus:outline-none focus:ring-2 focus:ring-[#10b981]/50 focus:border-[#10b981] sm:text-sm"
                placeholder="Full Name"
              />
            </div>
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none relative block w-full border border-[#10b981]/30 bg-[#0a2618]/80 text-[#e6f7f0] placeholder-[#10b981]/50 focus:outline-none focus:ring-2 focus:ring-[#10b981]/50 focus:border-[#10b981] sm:text-sm"
                placeholder="Email address"
              />
            </div>
            <div>
              <label htmlFor="teamName" className="sr-only">
                Team Name
              </label>
              <input
                id="teamName"
                name="teamName"
                type="text"
                required
                className="appearance-none relative block w-full border border-[#10b981]/30 bg-[#0a2618]/80 text-[#e6f7f0] placeholder-[#10b981]/50 focus:outline-none focus:ring-2 focus:ring-[#10b981]/50 focus:border-[#10b981] sm:text-sm"
                placeholder="Team Name"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-b-md relative block w-full border border-[#10b981]/30 bg-[#0a2618]/80 text-[#e6f7f0] placeholder-[#10b981]/50 focus:outline-none focus:ring-2 focus:ring-[#10b981]/50 focus:border-[#10b981] sm:text-sm"
                placeholder="Password"
              />
            </div>
          </div>

          {error && (
            <div className="text-[#f87171] text-sm text-center">{error}</div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#10b981] hover:bg-[#059669] focus:outline-none focus:ring-2 focus:ring-[#10b981]/50"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </div>

          <div className="text-sm text-center">
            <Link
              href="/login"
              className="font-medium text-[#34d399] hover:text-[#a7f3d0]"
            >
              Already have an account? Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
} 
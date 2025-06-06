'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Login() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError(result.error)
        return
      }

      // Check if user is admin and redirect accordingly
      const response = await fetch('/api/auth/session')
      const session = await response.json()
      
      if (session?.user?.role === 'ADMIN') {
        router.push('/admin')
      } else {
        router.push('/dashboard')
      }
      router.refresh()
    } catch (err) {
      setError('Failed to sign in')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#042f2e]">
      <div className="max-w-md w-full space-y-8 p-8 bg-[#0a2618]/80 rounded-lg shadow-md backdrop-blur-sm border border-[#10b981]/20">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-[#34d399]">
            Sign in to your account
          </h2>
        </div>
        {error && (
          <div className="bg-red-100/10 border border-red-400 text-red-400 px-4 py-3 rounded relative">
            {error}
          </div>
        )}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none rounded-t-md relative block w-full border border-[#10b981]/30 bg-[#0a2618]/80 text-[#e6f7f0] placeholder-[#10b981]/50 focus:outline-none focus:ring-2 focus:ring-[#10b981]/50 focus:border-[#10b981] sm:text-sm"
                placeholder="Email address"
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

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#10b981] hover:bg-[#059669] focus:outline-none focus:ring-2 focus:ring-[#10b981]/50"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>

          <div className="text-sm text-center">
            <Link
              href="/register"
              className="font-medium text-[#34d399] hover:text-[#a7f3d0]"
            >
              Don&apos;t have an account? Register
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
} 
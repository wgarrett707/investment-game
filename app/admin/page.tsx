'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface Startup {
  id: string
  name: string
  description: string
  pitch: string
  outcome: 'PENDING' | 'SUCCESS' | 'FAILURE'
  multiplier: number
}

interface Team {
  id: string
  name: string
  balance: number
}

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [startups, setStartups] = useState<Startup[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newStartup, setNewStartup] = useState({
    name: '',
    description: '',
    pitch: '',
    multiplier: 2.0,
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (session?.user?.role !== 'ADMIN') {
      router.push('/dashboard')
    }
  }, [status, session, router])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [startupsRes, teamsRes] = await Promise.all([
          fetch('/api/admin/startups'),
          fetch('/api/admin/teams'),
        ])

        if (!startupsRes.ok) {
          throw new Error('Failed to fetch startups')
        }

        if (!teamsRes.ok) {
          throw new Error('Failed to fetch teams')
        }

        const [startupsData, teamsData] = await Promise.all([
          startupsRes.json(),
          teamsRes.json(),
        ])

        setStartups(startupsData.startups)
        setTeams(teamsData.teams)
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to load data')
      } finally {
        setLoading(false)
      }
    }

    if (session?.user?.role === 'ADMIN') {
      fetchData()
    }
  }, [session])

  const handleCreateStartup = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/admin/startups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newStartup),
      })

      if (!response.ok) {
        throw new Error('Failed to create startup')
      }

      const data = await response.json()
      setStartups([...startups, data.startup])
      setNewStartup({ name: '', description: '', pitch: '', multiplier: 2.0 })
    } catch (error) {
      setError('Failed to create startup')
    }
  }

  const handleUpdateOutcome = async (startupId: string, outcome: 'SUCCESS' | 'FAILURE') => {
    try {
      const response = await fetch(`/api/admin/startups/${startupId}/outcome`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ outcome }),
      })

      if (!response.ok) {
        throw new Error('Failed to update outcome')
      }

      setStartups(startups.map(startup =>
        startup.id === startupId
          ? { ...startup, outcome }
          : startup
      ))
    } catch (error) {
      setError('Failed to update outcome')
    }
  }

  const handleUpdateMultiplier = async (startupId: string, multiplier: number) => {
    try {
      const response = await fetch(`/api/admin/startups/${startupId}/multiplier`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ multiplier }),
      })

      if (!response.ok) {
        throw new Error('Failed to update multiplier')
      }

      setStartups(startups.map(startup =>
        startup.id === startupId
          ? { ...startup, multiplier }
          : startup
      ))
    } catch (error) {
      setError('Failed to update multiplier')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-[#34d399]">Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-[#f87171]">{error}</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-[#34d399]">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-[#0a2618]/80 backdrop-blur-sm rounded-lg shadow-md p-6 border border-[#10b981]/20">
          <h2 className="text-xl font-semibold mb-4 text-[#34d399]">Create New Startup</h2>
          <form onSubmit={handleCreateStartup} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-[#a7f3d0]">
                Name
              </label>
              <input
                type="text"
                id="name"
                value={newStartup.name}
                onChange={(e) => setNewStartup({ ...newStartup, name: e.target.value })}
                className="mt-1 block w-full rounded-md border border-[#10b981]/30 bg-[#0a2618]/80 text-[#e6f7f0] placeholder-[#10b981]/50 focus:outline-none focus:ring-2 focus:ring-[#10b981]/50 focus:border-[#10b981] sm:text-sm"
                required
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-[#a7f3d0]">
                Description
              </label>
              <textarea
                id="description"
                value={newStartup.description}
                onChange={(e) => setNewStartup({ ...newStartup, description: e.target.value })}
                className="mt-1 block w-full rounded-md border border-[#10b981]/30 bg-[#0a2618]/80 text-[#e6f7f0] placeholder-[#10b981]/50 focus:outline-none focus:ring-2 focus:ring-[#10b981]/50 focus:border-[#10b981] sm:text-sm"
                rows={3}
                required
              />
            </div>
            <div>
              <label htmlFor="pitch" className="block text-sm font-medium text-[#a7f3d0]">
                Pitch
              </label>
              <textarea
                id="pitch"
                value={newStartup.pitch}
                onChange={(e) => setNewStartup({ ...newStartup, pitch: e.target.value })}
                className="mt-1 block w-full rounded-md border border-[#10b981]/30 bg-[#0a2618]/80 text-[#e6f7f0] placeholder-[#10b981]/50 focus:outline-none focus:ring-2 focus:ring-[#10b981]/50 focus:border-[#10b981] sm:text-sm"
                rows={5}
                required
              />
            </div>
            <div>
              <label htmlFor="multiplier" className="block text-sm font-medium text-[#a7f3d0]">
                Success Multiplier (e.g., 2.0 for 2x)
              </label>
              <input
                type="number"
                id="multiplier"
                value={newStartup.multiplier}
                onChange={(e) => setNewStartup({ ...newStartup, multiplier: parseFloat(e.target.value) })}
                className="mt-1 block w-full rounded-md border border-[#10b981]/30 bg-[#0a2618]/80 text-[#e6f7f0] placeholder-[#10b981]/50 focus:outline-none focus:ring-2 focus:ring-[#10b981]/50 focus:border-[#10b981] sm:text-sm"
                min="1.0"
                step="0.1"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-[#10b981] text-white px-4 py-2 rounded-md hover:bg-[#059669] focus:outline-none focus:ring-2 focus:ring-[#10b981]/50"
            >
              Create Startup
            </button>
          </form>
        </div>

        <div className="bg-[#0a2618]/80 backdrop-blur-sm rounded-lg shadow-md p-6 border border-[#10b981]/20">
          <h2 className="text-xl font-semibold mb-4 text-[#34d399]">Teams</h2>
          <div className="space-y-4">
            {teams.map((team) => (
              <div
                key={team.id}
                className="border border-[#10b981]/20 rounded-lg p-4 bg-[#0a2618]/60"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium text-[#34d399]">{team.name}</h3>
                    <p className="text-sm text-[#a7f3d0]">
                      Balance: ${team.balance.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 bg-[#0a2618]/80 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Startups</h2>
        <div className="space-y-4">
          {startups.map((startup) => (
            <div
              key={startup.id}
              className="border rounded-lg p-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{startup.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{startup.description}</p>
                  <p className="text-sm text-gray-600 mt-2">{startup.pitch}</p>
                  <p className="text-sm text-gray-600 mt-1">Multiplier: {startup.multiplier}x</p>
                  <div className="mt-2 flex items-center">
                    <input
                      type="number"
                      value={startup.multiplier}
                      onChange={(e) => handleUpdateMultiplier(startup.id, parseFloat(e.target.value))}
                      className="w-20 px-2 py-1 border rounded text-sm"
                      min="1.0"
                      step="0.1"
                    />
                    <span className="ml-1 text-sm text-gray-600">x</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  {startup.outcome === 'PENDING' && (
                    <>
                      <button
                        onClick={() => handleUpdateOutcome(startup.id, 'SUCCESS')}
                        className="px-3 py-1 bg-green-100 text-green-800 rounded hover:bg-green-200"
                      >
                        Success
                      </button>
                      <button
                        onClick={() => handleUpdateOutcome(startup.id, 'FAILURE')}
                        className="px-3 py-1 bg-red-100 text-red-800 rounded hover:bg-red-200"
                      >
                        Failure
                      </button>
                    </>
                  )}
                  <span
                    className={`inline-block px-2 py-1 rounded text-sm ${
                      startup.outcome === 'PENDING'
                        ? 'bg-yellow-100 text-yellow-800'
                        : startup.outcome === 'SUCCESS'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {startup.outcome}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 
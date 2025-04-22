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

interface Investment {
  id: string
  amount: number
  startup: {
    name: string
    description: string
    outcome: 'PENDING' | 'SUCCESS' | 'FAILURE'
    multiplier: number
  }
  createdAt: string
}

interface Team {
  id: string
  name: string
  balance: number
}

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [team, setTeam] = useState<Team | null>(null)
  const [startups, setStartups] = useState<Startup[]>([])
  const [investments, setInvestments] = useState<Investment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [investmentAmount, setInvestmentAmount] = useState<string>('')
  const [selectedStartup, setSelectedStartup] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [teamRes, startupsRes] = await Promise.all([
          fetch('/api/team'),
          fetch('/api/startups'),
        ])

        if (!teamRes.ok) throw new Error('Failed to fetch team data')
        if (!startupsRes.ok) throw new Error('Failed to fetch startups')

        const [teamData, startupsData] = await Promise.all([
          teamRes.json(),
          startupsRes.json(),
        ])

        setTeam(teamData.team)
        setInvestments(teamData.investments)
        setStartups(startupsData.startups)
      } catch (error) {
        setError('Failed to load data')
      } finally {
        setLoading(false)
      }
    }

    if (session?.user) {
      fetchData()
    }
  }, [session])

  const handleInvestment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedStartup || !investmentAmount) return

    try {
      const response = await fetch('/api/investments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          startupId: selectedStartup,
          amount: parseFloat(investmentAmount),
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to make investment')
      }

      const data = await response.json()
      setTeam(data.team)
      setInvestments([...investments, data.investment])
      setInvestmentAmount('')
      setSelectedStartup(null)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to make investment')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-500">{error}</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-[#34d399]">Team Dashboard</h1>
        <p className="text-[#a7f3d0]">
          Welcome, {team?.name}! Your current balance: ${team?.balance.toLocaleString()}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-[#0a2618]/80 rounded-lg shadow-md p-6 border border-[#10b981]/20 backdrop-blur-sm">
          <h2 className="text-xl font-semibold mb-4 text-[#34d399]">Current Investment Round</h2>
          {startups.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-[#a7f3d0]">Waiting for the next startup pitch...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {startups.map((startup) => (
                <div
                  key={startup.id}
                  className="border border-[#10b981]/20 rounded-lg p-4 bg-[#0a2618]/60 backdrop-blur-sm"
                >
                  <h3 className="font-medium text-[#34d399]">{startup.name}</h3>
                  <p className="text-sm text-[#a7f3d0] mt-1">{startup.description}</p>
                  <p className="text-sm text-[#a7f3d0] mt-2">{startup.pitch}</p>
                  
                  {selectedStartup === startup.id ? (
                    <form onSubmit={handleInvestment} className="mt-4">
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={investmentAmount}
                          onChange={(e) => setInvestmentAmount(e.target.value)}
                          placeholder="Investment amount"
                          className="flex-1 px-3 py-2 border rounded-md bg-[#0a2618]/80 border-[#10b981]/30 text-[#e6f7f0] placeholder-[#10b981]/50"
                          min="0"
                          max={team?.balance}
                          step="1000"
                          required
                        />
                        <button
                          type="submit"
                          name="action"
                          value="seed"
                          className="px-4 py-2 bg-[#10b981] text-white rounded-md hover:bg-[#059669] transition-colors"
                        >
                          Seed
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedStartup(null)
                            setInvestmentAmount('')
                          }}
                          className="px-4 py-2 bg-[#0d9488] text-white rounded-md hover:bg-[#0f766e] transition-colors"
                        >
                          Skip
                        </button>
                      </div>
                    </form>
                  ) : (
                    <button
                      onClick={() => setSelectedStartup(startup.id)}
                      className="mt-4 px-4 py-2 bg-[#10b981] text-white rounded-md hover:bg-[#059669] transition-colors"
                    >
                      Make Investment
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-[#0a2618]/80 rounded-lg shadow-md p-6 border border-[#10b981]/20 backdrop-blur-sm">
          <h2 className="text-xl font-semibold mb-4 text-[#34d399]">Investment History</h2>
          {investments.length === 0 ? (
            <p className="text-[#a7f3d0] text-center py-4">No investments made yet</p>
          ) : (
            <div className="space-y-4">
              {investments.map((investment) => (
                <div
                  key={investment.id}
                  className="border border-[#10b981]/20 rounded-lg p-4 bg-[#0a2618]/60 backdrop-blur-sm"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-[#34d399]">{investment.startup.name}</h3>
                      <p className="text-sm text-[#a7f3d0]">
                        Amount: ${investment.amount.toLocaleString()}
                      </p>
                      <p className="text-sm text-[#a7f3d0]">
                        Date: {new Date(investment.createdAt).toLocaleDateString()}
                      </p>
                      {investment.startup.outcome !== 'PENDING' && (
                        <p className={`text-sm font-medium mt-1 ${
                          investment.startup.outcome === 'SUCCESS' 
                            ? 'text-[#34d399]' 
                            : 'text-[#f87171]'
                        }`}>
                          {investment.startup.outcome === 'SUCCESS' 
                            ? `Profit: +$${(investment.amount * 2.0).toLocaleString()} (2.0x)`
                            : `Loss: -$${investment.amount.toLocaleString()}`
                          }
                        </p>
                      )}
                    </div>
                    <span
                      className={`inline-block px-2 py-1 rounded text-sm ${
                        investment.startup.outcome === 'PENDING'
                          ? 'bg-[#0d9488]/30 text-[#2dd4bf]'
                          : investment.startup.outcome === 'SUCCESS'
                          ? 'bg-[#10b981]/30 text-[#34d399]'
                          : 'bg-[#ef4444]/30 text-[#f87171]'
                      }`}
                    >
                      {investment.startup.outcome}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 
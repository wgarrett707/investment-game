import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { Investment, Team } from '@prisma/client'

interface InvestmentWithTeam extends Investment {
  team: Team
}

const FIXED_MULTIPLIER = 2.0

export async function PUT(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get startup ID from URL
    const id = request.url.split('/').pop()
    if (!id) {
      return NextResponse.json({ error: 'Missing startup ID' }, { status: 400 })
    }

    // Get outcome from request body
    const { outcome } = await request.json()
    if (!outcome || !['SUCCESS', 'FAILURE'].includes(outcome)) {
      return NextResponse.json({ error: 'Invalid outcome' }, { status: 400 })
    }

    // Get all investments for this startup
    const investments = await prisma.investment.findMany({
      where: { 
        startupId: id,
        startup: {
          outcome: 'PENDING'
        }
      },
      include: {
        team: true
      }
    })

    // Update startup outcome and handle payouts in a transaction
    const [startup] = await prisma.$transaction([
      // Update startup outcome
      prisma.startup.update({
        where: { id },
        data: { outcome }
      }),
      // Update team balances for successful investments
      ...(outcome === 'SUCCESS' 
        ? investments.map((investment) => 
            prisma.team.update({
              where: { id: investment.teamId },
              data: {
                balance: {
                  increment: investment.amount * FIXED_MULTIPLIER
                }
              }
            })
          )
        : []
      )
    ])

    return NextResponse.json({ 
      startup,
      payouts: outcome === 'SUCCESS' ? investments.map((i) => ({
        teamId: i.teamId,
        amount: i.amount * FIXED_MULTIPLIER
      })) : []
    })
  } catch (error) {
    console.error('Error updating startup outcome:', error)
    return NextResponse.json(
      { error: 'Failed to update startup outcome' },
      { status: 500 }
    )
  }
} 
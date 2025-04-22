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
    console.log('Session:', session)

    if (!session || session.user.role !== 'ADMIN') {
      console.error('Unauthorized access attempt:', session?.user?.role)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get startup ID from URL
    const id = request.url.split('/').pop()
    if (!id) {
      console.error('Missing startup ID in URL')
      return NextResponse.json({ error: 'Missing startup ID' }, { status: 400 })
    }

    // Get outcome from request body
    const { outcome } = await request.json()
    console.log('Outcome request:', { startupId: id, outcome })

    if (!outcome || !['SUCCESS', 'FAILURE'].includes(outcome)) {
      console.error('Invalid outcome:', outcome)
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
        team: true,
        startup: true
      }
    })

    console.log('Found investments:', investments.length)

    // Update startup outcome and handle payouts in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update startup outcome
      const updatedStartup = await tx.startup.update({
        where: { id },
        data: { outcome }
      })

      // Update team balances for successful investments
      if (outcome === 'SUCCESS') {
        for (const investment of investments) {
          await tx.team.update({
            where: { id: investment.teamId },
            data: {
              balance: {
                increment: investment.amount * FIXED_MULTIPLIER
              }
            }
          })
        }
      }

      return {
        startup: updatedStartup,
        payouts: outcome === 'SUCCESS' ? investments.map((i) => ({
          teamId: i.teamId,
          amount: i.amount * FIXED_MULTIPLIER
        })) : []
      }
    })

    console.log('Transaction completed successfully:', result)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error updating startup outcome:', error)
    return NextResponse.json(
      { error: 'Failed to update startup outcome' },
      { status: 500 }
    )
  }
} 
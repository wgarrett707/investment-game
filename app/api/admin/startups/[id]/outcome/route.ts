import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '../../../../auth/[...nextauth]/route'
import { Investment, Team } from '@prisma/client'

interface InvestmentWithTeam extends Investment {
  team: Team
  startup: {
    multiplier?: number
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'ADMIN') {
    return new NextResponse(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401 }
    )
  }

  try {
    const { outcome } = await request.json()

    if (!outcome || !['SUCCESS', 'FAILURE'].includes(outcome)) {
      return new NextResponse(
        JSON.stringify({ error: 'Invalid outcome' }),
        { status: 400 }
      )
    }

    // Get all investments for this startup
    const investments = await prisma.investment.findMany({
      where: { 
        startupId: params.id,
        startup: {
          outcome: 'PENDING'
        }
      },
      include: {
        team: true,
        startup: true
      }
    }) as any[]

    // Add multiplier field to each investment's startup if it doesn't exist
    const investmentsWithMultiplier = investments.map(investment => ({
      ...investment,
      startup: {
        ...investment.startup,
        multiplier: investment.startup.multiplier || 2.0
      }
    }))

    // Update startup outcome and handle payouts in a transaction
    const [startup] = await prisma.$transaction([
      // Update startup outcome
      prisma.startup.update({
        where: { id: params.id },
        data: { outcome }
      }),
      // Update team balances for successful investments
      ...(outcome === 'SUCCESS' 
        ? investmentsWithMultiplier.map((investment) => 
            prisma.team.update({
              where: { id: investment.teamId },
              data: {
                balance: {
                  increment: investment.amount * investment.startup.multiplier
                }
              }
            })
          )
        : []
      )
    ])

    return NextResponse.json({ 
      startup,
      payouts: outcome === 'SUCCESS' ? investmentsWithMultiplier.map((i) => ({
        teamId: i.teamId,
        amount: i.amount * i.startup.multiplier
      })) : []
    })
  } catch (error) {
    console.error('Error updating startup outcome:', error)
    return new NextResponse(
      JSON.stringify({ error: 'Failed to update startup outcome' }),
      { status: 500 }
    )
  }
} 
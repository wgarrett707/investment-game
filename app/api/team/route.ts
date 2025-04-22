import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.teamId) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const team = await prisma.team.findUnique({
      where: { id: session.user.teamId },
      select: {
        id: true,
        name: true,
        balance: true,
      },
    })

    if (!team) {
      return NextResponse.json(
        { message: 'Team not found' },
        { status: 404 }
      )
    }

    const investments = await prisma.investment.findMany({
      where: { teamId: team.id },
      select: {
        id: true,
        amount: true,
        createdAt: true,
        startup: {
          select: {
            name: true,
            description: true,
            outcome: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Add multiplier field to each investment's startup
    const investmentsWithMultiplier = investments.map(investment => ({
      ...investment,
      startup: {
        ...investment.startup,
        multiplier: 2.0 // Default multiplier
      }
    }))

    console.log('Investments data:', JSON.stringify(investmentsWithMultiplier, null, 2))

    return NextResponse.json({
      team,
      investments: investmentsWithMultiplier,
    })
  } catch (error) {
    console.error('Team data fetch error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
} 
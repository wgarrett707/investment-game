import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { startupId, amount } = await request.json()

    if (!startupId || !amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid investment amount' },
        { status: 400 }
      )
    }

    // Get the team and startup
    const team = await prisma.team.findFirst({
      where: {
        users: {
          some: {
            id: session.user.id,
          },
        },
      },
      include: {
        investments: {
          include: {
            startup: true,
          },
        },
      },
    })

    if (!team) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      )
    }

    const startup = await prisma.startup.findUnique({
      where: { id: startupId },
    })

    if (!startup) {
      return NextResponse.json(
        { error: 'Startup not found' },
        { status: 404 }
      )
    }

    if (startup.outcome !== 'PENDING') {
      return NextResponse.json(
        { error: 'Cannot invest in a startup with a determined outcome' },
        { status: 400 }
      )
    }

    if (team.balance < amount) {
      return NextResponse.json(
        { error: 'Insufficient funds' },
        { status: 400 }
      )
    }

    // Create investment and update team balance in a transaction
    const [investment, updatedTeam] = await prisma.$transaction([
      prisma.investment.create({
        data: {
          amount,
          teamId: team.id,
          startupId,
        },
        include: {
          startup: true,
        },
      }),
      prisma.team.update({
        where: { id: team.id },
        data: {
          balance: {
            decrement: amount,
          },
        },
      }),
    ])

    return NextResponse.json({
      investment,
      team: updatedTeam,
    })
  } catch (error) {
    console.error('Error creating investment:', error)
    return NextResponse.json(
      { error: 'Failed to create investment' },
      { status: 500 }
    )
  }
} 
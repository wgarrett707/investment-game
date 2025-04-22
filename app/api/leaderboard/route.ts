import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const teams = await prisma.team.findMany({
      select: {
        id: true,
        name: true,
        balance: true,
        _count: {
          select: {
            users: true,
            investments: true,
          },
        },
      },
      orderBy: {
        balance: 'desc',
      },
    })

    return NextResponse.json({ teams })
  } catch (error) {
    console.error('Leaderboard fetch error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
} 
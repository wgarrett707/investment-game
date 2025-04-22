import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session) {
    return new NextResponse(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401 }
    )
  }

  try {
    const startups = await prisma.startup.findMany({
      where: {
        outcome: 'PENDING',
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ startups })
  } catch (error) {
    console.error('Error fetching startups:', error)
    return new NextResponse(
      JSON.stringify({ error: 'Failed to fetch startups' }),
      { status: 500 }
    )
  }
} 
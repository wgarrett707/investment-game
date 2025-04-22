import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

export async function GET() {
  console.log('Teams API: Request received')
  
  const session = await getServerSession(authOptions)
  console.log('Teams API: Session:', session)

  if (!session || session.user.role !== 'ADMIN') {
    console.log('Teams API: Unauthorized access attempt')
    return new NextResponse(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401 }
    )
  }

  try {
    console.log('Teams API: Fetching teams from database')
    const teams = await prisma.team.findMany({
      include: {
        users: true,
        investments: {
          include: {
            startup: true
          }
        }
      }
    })
    console.log('Teams API: Teams fetched successfully:', teams)

    return NextResponse.json({ teams })
  } catch (error) {
    console.error('Teams API: Error fetching teams:', error)
    return new NextResponse(
      JSON.stringify({ error: 'Failed to fetch teams' }),
      { status: 500 }
    )
  }
} 
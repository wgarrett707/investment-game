import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '../../auth/[...nextauth]/route'

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'ADMIN') {
    return new NextResponse(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401 }
    )
  }

  try {
    const startups = await prisma.startup.findMany({
      include: {
        investments: {
          include: {
            team: true
          }
        }
      }
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

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'ADMIN') {
    return new NextResponse(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401 }
    )
  }

  try {
    const { name, description, pitch, multiplier } = await request.json()

    if (!name || !description || !pitch) {
      return new NextResponse(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400 }
      )
    }

    const startup = await prisma.startup.create({
      data: {
        name,
        description,
        pitch,
        multiplier: multiplier || 2.0
      }
    })

    return NextResponse.json({ startup })
  } catch (error) {
    console.error('Error creating startup:', error)
    return new NextResponse(
      JSON.stringify({ error: 'Failed to create startup' }),
      { status: 500 }
    )
  }
} 
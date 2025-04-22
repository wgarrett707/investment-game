import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '../../../../auth/[...nextauth]/route'

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
    const { multiplier } = await request.json()

    if (!multiplier || multiplier < 1.0) {
      return new NextResponse(
        JSON.stringify({ error: 'Invalid multiplier' }),
        { status: 400 }
      )
    }

    const startup = await prisma.startup.update({
      where: { id: params.id },
      data: { multiplier }
    })

    return NextResponse.json({ startup })
  } catch (error) {
    console.error('Error updating startup multiplier:', error)
    return new NextResponse(
      JSON.stringify({ error: 'Failed to update startup multiplier' }),
      { status: 500 }
    )
  }
} 
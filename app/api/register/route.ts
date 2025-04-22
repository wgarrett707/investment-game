import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'

export async function POST(request: Request) {
  try {
    const { name, email, password, teamName } = await request.json()

    // Validate input
    if (!name || !email || !password || !teamName) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { message: 'User already exists' },
        { status: 400 }
      )
    }

    // Check if team name is taken
    const existingTeam = await prisma.team.findUnique({
      where: { name: teamName },
    })

    if (existingTeam) {
      return NextResponse.json(
        { message: 'Team name already taken' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create team and user in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create team
      const team = await tx.team.create({
        data: {
          name: teamName,
          balance: 1000000, // Starting with $1M
        },
      })

      // Create user
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          teamId: team.id,
        },
      })

      return { user, team }
    })

    return NextResponse.json(
      { message: 'User created successfully' },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
} 
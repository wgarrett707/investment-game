import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  try {
    const email = 'admin@example.com'
    const password = 'admin123'
    const hashedPassword = await bcrypt.hash(password, 10)

    // Delete existing admin if exists
    await prisma.user.deleteMany({
      where: {
        email: email
      }
    })

    // Create new admin
    const admin = await prisma.user.create({
      data: {
        name: 'Admin User',
        email: email,
        password: hashedPassword,
        role: 'ADMIN'
      }
    })

    console.log('Admin account created successfully:', {
      email: admin.email,
      role: admin.role
    })
  } catch (error) {
    console.error('Error creating admin:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main() 
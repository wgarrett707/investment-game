import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    // Get all startups
    const startups = await prisma.startup.findMany()
    
    // Update each startup to have a multiplier of 2.0 if it doesn't already have one
    for (const startup of startups) {
      if (startup.multiplier === undefined || startup.multiplier === null) {
        await prisma.startup.update({
          where: { id: startup.id },
          data: {
            multiplier: 2.0
          } as any // Type assertion to bypass type checking for now
        })
        console.log(`Updated startup ${startup.id} with multiplier 2.0`)
      }
    }
    
    console.log('All startups have been updated with multipliers')
  } catch (error) {
    console.error('Error updating startups:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main() 
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    // Update all startups to have a multiplier of 2.0 if it doesn't exist
    const startups = await prisma.startup.findMany()
    
    for (const startup of startups) {
      // @ts-ignore - We're adding the multiplier field
      if (startup.multiplier === undefined) {
        await prisma.startup.update({
          where: { id: startup.id },
          data: { multiplier: 2.0 }
        })
        console.log(`Updated startup ${startup.id} with multiplier 2.0`)
      }
    }
    
    console.log('Database update completed successfully')
  } catch (error) {
    console.error('Error updating database:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main() 
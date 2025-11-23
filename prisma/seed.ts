import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

console.log("DATABASE_URL:", process.env.DATABASE_URL ? "Loaded" : "Not Loaded");

async function main() {
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      displayName: 'Test User',
      githubUsername: 'testuser',
      profilePicture: 'https://github.com/shadcn.png',
    },
  })

  console.log({ user })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
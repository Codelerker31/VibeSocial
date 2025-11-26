import { PrismaClient, TagCategory } from '@prisma/client'

const prisma = new PrismaClient()

const tags = [
  // Languages
  { name: 'JavaScript', category: TagCategory.LANGUAGE },
  { name: 'TypeScript', category: TagCategory.LANGUAGE },
  { name: 'Python', category: TagCategory.LANGUAGE },
  { name: 'Go', category: TagCategory.LANGUAGE },
  { name: 'Rust', category: TagCategory.LANGUAGE },
  { name: 'Java', category: TagCategory.LANGUAGE },
  { name: 'C++', category: TagCategory.LANGUAGE },
  { name: 'Swift', category: TagCategory.LANGUAGE },
  { name: 'Kotlin', category: TagCategory.LANGUAGE },
  { name: 'Ruby', category: TagCategory.LANGUAGE },
  { name: 'PHP', category: TagCategory.LANGUAGE },
  { name: 'C#', category: TagCategory.LANGUAGE },
  { name: 'Dart', category: TagCategory.LANGUAGE },
  { name: 'Elixir', category: TagCategory.LANGUAGE },
  { name: 'Scala', category: TagCategory.LANGUAGE },

  // Frontend
  { name: 'React', category: TagCategory.FRONTEND },
  { name: 'Vue', category: TagCategory.FRONTEND },
  { name: 'Angular', category: TagCategory.FRONTEND },
  { name: 'Svelte', category: TagCategory.FRONTEND },
  { name: 'Next.js', category: TagCategory.FRONTEND },
  { name: 'Nuxt', category: TagCategory.FRONTEND },
  { name: 'Remix', category: TagCategory.FRONTEND },
  { name: 'Astro', category: TagCategory.FRONTEND },
  { name: 'SolidJS', category: TagCategory.FRONTEND },
  { name: 'Qwik', category: TagCategory.FRONTEND },

  // Backend
  { name: 'Node.js', category: TagCategory.BACKEND },
  { name: 'Express', category: TagCategory.BACKEND },
  { name: 'Fastify', category: TagCategory.BACKEND },
  { name: 'NestJS', category: TagCategory.BACKEND },
  { name: 'Django', category: TagCategory.BACKEND },
  { name: 'Flask', category: TagCategory.BACKEND },
  { name: 'FastAPI', category: TagCategory.BACKEND },
  { name: 'Spring Boot', category: TagCategory.BACKEND },
  { name: 'Rails', category: TagCategory.BACKEND },
  { name: 'Laravel', category: TagCategory.BACKEND },
  { name: 'Phoenix', category: TagCategory.BACKEND },

  // Databases
  { name: 'PostgreSQL', category: TagCategory.DATABASE },
  { name: 'MongoDB', category: TagCategory.DATABASE },
  { name: 'Redis', category: TagCategory.DATABASE },
  { name: 'MySQL', category: TagCategory.DATABASE },
  { name: 'SQLite', category: TagCategory.DATABASE },
  { name: 'Firebase', category: TagCategory.DATABASE },
  { name: 'Supabase', category: TagCategory.DATABASE },
  { name: 'PlanetScale', category: TagCategory.DATABASE },
  { name: 'Neon', category: TagCategory.DATABASE },

  // Cloud/Infra
  { name: 'AWS', category: TagCategory.CLOUD_INFRA },
  { name: 'GCP', category: TagCategory.CLOUD_INFRA },
  { name: 'Azure', category: TagCategory.CLOUD_INFRA },
  { name: 'Vercel', category: TagCategory.CLOUD_INFRA },
  { name: 'Netlify', category: TagCategory.CLOUD_INFRA },
  { name: 'Railway', category: TagCategory.CLOUD_INFRA },
  { name: 'Fly.io', category: TagCategory.CLOUD_INFRA },
  { name: 'Docker', category: TagCategory.CLOUD_INFRA },
  { name: 'Kubernetes', category: TagCategory.CLOUD_INFRA },
  { name: 'Terraform', category: TagCategory.CLOUD_INFRA },

  // Mobile
  { name: 'React Native', category: TagCategory.MOBILE },
  { name: 'Flutter', category: TagCategory.MOBILE },
  { name: 'SwiftUI', category: TagCategory.MOBILE },
  { name: 'Jetpack Compose', category: TagCategory.MOBILE },
  { name: 'Ionic', category: TagCategory.MOBILE },

  // AI/ML
  { name: 'TensorFlow', category: TagCategory.AI_ML },
  { name: 'PyTorch', category: TagCategory.AI_ML },
  { name: 'OpenAI API', category: TagCategory.AI_ML },
  { name: 'Anthropic', category: TagCategory.AI_ML },
  { name: 'LangChain', category: TagCategory.AI_ML },
  { name: 'Hugging Face', category: TagCategory.AI_ML },
  { name: 'Stable Diffusion', category: TagCategory.AI_ML },

  // Tools
  { name: 'Git', category: TagCategory.TOOLS },
  { name: 'GitHub', category: TagCategory.TOOLS },
  { name: 'VS Code', category: TagCategory.TOOLS },
  { name: 'Figma', category: TagCategory.TOOLS },
  { name: 'Postman', category: TagCategory.TOOLS },
  { name: 'Jest', category: TagCategory.TOOLS },
  { name: 'Vitest', category: TagCategory.TOOLS },
  { name: 'Playwright', category: TagCategory.TOOLS },
]

function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '')             // Trim - from end of text
}

async function main() {
  console.log('Start seeding tags...')

  for (const tag of tags) {
    const slug = slugify(tag.name)
    await prisma.tag.upsert({
      where: { slug },
      update: {
        name: tag.name,
        category: tag.category,
      },
      create: {
        name: tag.name,
        category: tag.category,
        slug,
      },
    })
  }

  console.log('Seeding finished.')
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
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ProjectSubmissionSchema } from '@/lib/validations';
import { uploadImage } from '@/lib/cloudinary';
import { ProjectType } from '@prisma/client';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Rate limiting: Check submissions in last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentSubmissions = await prisma.project.count({
      where: {
        userId,
        submittedAt: {
          gte: oneHourAgo,
        },
      },
    });

    if (recentSubmissions >= 5) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. You can only submit 5 projects per hour.' },
        { status: 429 }
      );
    }

    const formData = await req.formData();
    
    // Extract fields
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const detailedDescription = formData.get('detailedDescription') as string;
    const projectType = formData.get('projectType') as string;
    const sourceUrl = formData.get('sourceUrl') as string;
    const demoUrl = formData.get('demoUrl') as string || undefined;
    const tagIds = formData.getAll('tagIds') as string[];
    
    const coverImageFile = formData.get('coverImage') as File | null;
    const screenshotFiles = formData.getAll('screenshots') as File[];

    // Validate basic fields first
    // We construct an object to validate against Zod
    // Note: Zod schema expects strings for URLs (images), but we have Files.
    // We will validate the non-file fields first.
    
    const validationData = {
      title,
      description,
      detailedDescription,
      projectType,
      sourceUrl,
      demoUrl: demoUrl || '', // Handle optional/empty
      tagIds,
      // Mock images for Zod validation
      coverImage: 'https://placeholder.com', 
      screenshots: [], 
    };

    const result = ProjectSubmissionSchema.safeParse(validationData);
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.flatten() },
        { status: 400 }
      );
    }

    // Validate images manually
    if (!coverImageFile) {
      return NextResponse.json({ error: 'Cover image is required' }, { status: 400 });
    }
    
    // Upload Cover Image
    let coverImageUrl = '';
    try {
      coverImageUrl = await uploadImage(coverImageFile);
    } catch (error) {
      console.error('Cover image upload failed:', error);
      return NextResponse.json({ error: 'Failed to upload cover image' }, { status: 500 });
    }

    // Upload Screenshots
    const screenshotUrls: string[] = [];
    for (const file of screenshotFiles) {
      if (file instanceof File) {
        try {
          const url = await uploadImage(file);
          screenshotUrls.push(url);
        } catch (error) {
          console.error('Screenshot upload failed:', error);
          return NextResponse.json({ error: 'Failed to upload screenshots' }, { status: 500 });
        }
      }
    }

    // Create Project
    // Generate slug from title
    let slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    // Ensure uniqueness
    const existingSlug = await prisma.project.findUnique({ where: { slug } });
    if (existingSlug) {
      slug = `${slug}-${Date.now()}`;
    }

    const project = await prisma.project.create({
      data: {
        userId,
        title,
        slug,
        description,
        detailedDescription,
        projectType: projectType as ProjectType,
        sourceUrl,
        demoUrl,
        coverImage: coverImageUrl,
        screenshots: screenshotUrls,
        status: 'PENDING',
        tags: {
          create: tagIds.map(tagId => ({
            tag: { connect: { id: tagId } }
          }))
        }
      },
    });

    return NextResponse.json(project, { status: 201 });

  } catch (error) {
    console.error('Project submission error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

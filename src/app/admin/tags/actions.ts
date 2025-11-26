'use server';

import { prisma } from '@/lib/prisma';
import { TagCategory } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const TagSchema = z.object({
  name: z.string().min(1),
  category: z.nativeEnum(TagCategory),
});

function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

export async function createTag(formData: FormData) {
  const name = formData.get('name') as string;
  const category = formData.get('category') as TagCategory;

  const result = TagSchema.safeParse({ name, category });

  if (!result.success) {
    return { error: 'Invalid input' };
  }

  const slug = slugify(name);

  try {
    await prisma.tag.create({
      data: {
        name,
        category,
        slug,
      },
    });
    revalidatePath('/admin/tags');
    return { success: true };
  } catch (error) {
    console.error('Failed to create tag:', error);
    return { error: 'Failed to create tag. Name might be duplicate.' };
  }
}

export async function deleteTag(id: string) {
  try {
    await prisma.tag.delete({
      where: { id },
    });
    revalidatePath('/admin/tags');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete tag:', error);
    return { error: 'Failed to delete tag' };
  }
}

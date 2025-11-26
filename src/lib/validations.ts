import { z } from 'zod';

// User validation schemas
export const SignupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  displayName: z.string().min(1, 'Display name is required').max(50),
});

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const UpdateProfileSchema = z.object({
  displayName: z.string().min(1).max(50).optional(),
  bio: z.string().max(500).optional(),
  profilePicture: z.string().url().optional(),
});

// Project validation schemas
export const ProjectSubmissionSchema = z.object({
  title: z.string().min(1, 'Title is required').max(80, 'Title too long'),
  description: z.string().min(1, 'Description is required').max(150, 'Description too long'),
  detailedDescription: z.string().min(200, 'Detailed description must be at least 200 characters').max(5000, 'Detailed description too long'),
  coverImage: z.string().url('Invalid image URL'),
  screenshots: z.array(z.string().url()).max(4, 'Maximum 4 screenshots').optional(),
  demoUrl: z.string().url('Invalid demo URL').optional().or(z.literal('')),
  sourceUrl: z.string().url('Invalid source URL'),
  projectType: z.enum(['WEB_APP', 'MOBILE_APP', 'CLI_TOOL', 'LIBRARY', 'GAME', 'OTHER']),
  tagIds: z.array(z.string().uuid()).min(2, 'At least two tags required').max(8, 'Maximum 8 tags'),
});

export const ProjectUpdateSchema = ProjectSubmissionSchema.partial();

// Comment validation schemas
export const CommentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty').max(2000, 'Comment too long'),
  parentId: z.string().uuid().optional(),
});

// Interaction validation schemas
export const InteractionSchema = z.object({
  projectId: z.string().uuid(),
  type: z.enum(['VIEW', 'LIKE', 'SAVE', 'COMMENT', 'SHARE', 'CLICK_DEMO', 'CLICK_SOURCE']),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

// Query parameter validation
export const PaginationSchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(50).default(20),
});

export const TagFilterSchema = z.object({
  tagIds: z.array(z.string().uuid()).optional(),
  category: z.enum(['LANGUAGE', 'FRONTEND', 'BACKEND', 'DATABASE', 'DEPLOYMENT', 'AI_ML']).optional(),
});

// Type inference
export type SignupInput = z.infer<typeof SignupSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;
export type ProjectSubmissionInput = z.infer<typeof ProjectSubmissionSchema>;
export type ProjectUpdateInput = z.infer<typeof ProjectUpdateSchema>;
export type CommentInput = z.infer<typeof CommentSchema>;
export type InteractionInput = z.infer<typeof InteractionSchema>;
export type PaginationInput = z.infer<typeof PaginationSchema>;
export type TagFilterInput = z.infer<typeof TagFilterSchema>;

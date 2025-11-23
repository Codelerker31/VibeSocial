// Shared TypeScript types for DevSocial

export type ProjectStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type ProjectType = 
  | 'WEB_APP'
  | 'MOBILE_APP'
  | 'CLI_TOOL'
  | 'LIBRARY'
  | 'GAME'
  | 'OTHER';

export type InteractionType = 'VIEW' | 'LIKE' | 'SAVE' | 'COMMENT' | 'SHARE' | 'CLICK_DEMO' | 'CLICK_SOURCE';

export type TagCategory = 
  | 'LANGUAGE'
  | 'FRONTEND'
  | 'BACKEND'
  | 'DATABASE'
  | 'DEPLOYMENT'
  | 'AI_ML';

// User types
export interface User {
  id: string;
  email: string;
  displayName: string | null;
  profilePicture: string | null;
  bio: string | null;
  githubUsername: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface SafeUser extends Omit<User, 'createdAt' | 'updatedAt'> {
  createdAt: string;
  updatedAt: string;
}

// Project types
export interface Project {
  id: string;
  userId: string;
  title: string;
  slug: string;
  description: string;
  detailedDescription: string | null;
  coverImage: string | null;
  screenshots: string[];
  demoUrl: string | null;
  sourceUrl: string;
  projectType: ProjectType;
  status: ProjectStatus;
  submittedAt: Date;
  approvedAt: Date | null;
  engagementScore: number;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  saveCount: number;
}

export interface ProjectWithUser extends Project {
  user: SafeUser;
}

export interface ProjectWithTags extends Project {
  tags: Tag[];
}

// Tag types
export interface Tag {
  id: string;
  name: string;
  category: TagCategory;
  slug: string;
}

// Comment types
export interface Comment {
  id: string;
  userId: string;
  projectId: string;
  parentId: string | null;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface CommentWithUser extends Comment {
  user: SafeUser;
  replies?: CommentWithUser[];
}

// Interaction types
export interface Interaction {
  id: string;
  userId: string | null;
  projectId: string;
  type: InteractionType;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
}

// API Response types
export interface ApiError {
  error: string;
  details?: unknown;
}

export interface PaginatedResponse<T> {
  data: T[];
  nextCursor: string | null;
  hasMore: boolean;
}

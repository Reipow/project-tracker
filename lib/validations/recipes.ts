import { z } from 'zod';

export const recipeSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().max(2000, 'Description must be less than 2000 characters').optional(),
  ingredients: z.array(z.string().min(1)).min(1, 'At least one ingredient is required'),
  instructions: z.string().min(1, 'Instructions are required').max(10000, 'Instructions must be less than 10000 characters'),
  prepTime: z.number().int().min(0).max(1440).optional(),
  cookTime: z.number().int().min(0).max(1440).optional(),
  servings: z.number().int().min(1).max(100).optional(),
  imageUrl: z.string().url().optional().or(z.literal('')),
  boardId: z.string().uuid('Invalid board ID'),
});

export const inviteSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['editor', 'viewer']),
  boardId: z.string().uuid('Invalid board ID'),
});

export const updateRoleSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  role: z.enum(['owner', 'editor', 'viewer']),
  boardId: z.string().uuid('Invalid board ID'),
});

export const boardSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
});

export type RecipeInput = z.infer<typeof recipeSchema>;
export type InviteInput = z.infer<typeof inviteSchema>;
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
export type BoardInput = z.infer<typeof boardSchema>;
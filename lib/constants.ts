export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
export const INVITE_TOKEN_EXPIRY_DAYS = 7;
export const BOARD_SLUG_MAX_LENGTH = 100;

export const ROLE_PERMISSIONS = {
  owner: ['read', 'write', 'delete', 'manage_members', 'delete_board'],
  editor: ['read', 'write', 'delete'],
  viewer: ['read'],
} as const;

export const ROLES = ['owner', 'editor', 'viewer'] as const;
export type Role = typeof ROLES[number];

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  BOARD: (id: string) => `/dashboard/board/${id}`,
  MEMBERS: (id: string) => `/dashboard/board/${id}/members`,
  RECIPE_NEW: (boardId: string) => `/recipe/new?boardId=${boardId}`,
  RECIPE: (id: string) => `/recipe/${id}`,
  INVITE_ACCEPT: (token: string) => `/invite/accept/${token}`,
} as const;
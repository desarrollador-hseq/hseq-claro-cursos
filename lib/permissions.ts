import { Role } from "@prisma/client";

export type Permission =
  | "VIEW_DASHBOARD"
  | "MANAGE_COLLABORATORS"
  | "MANAGE_TRAININGS"
  | "MANAGE_COURSES"
  | "MANAGE_COACHES"
  | "MANAGE_USERS"
  | "MANAGE_SYSTEM_CONFIG"
  | "VIEW_REPORTS"
  | "MANAGE_CITIES_REGIONS"
  | "MANAGE_INSPECTIONS"
  | "UPLOAD_DOCUMENTS";

// Definir permisos para cada rol
const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  ADMIN: [
    "VIEW_DASHBOARD",
    "MANAGE_COLLABORATORS",
    "MANAGE_TRAININGS",
    "MANAGE_COURSES",
    "MANAGE_COACHES",
    "MANAGE_USERS",
    "MANAGE_SYSTEM_CONFIG",
    "VIEW_REPORTS",
    "MANAGE_CITIES_REGIONS",
    "MANAGE_INSPECTIONS",
    "UPLOAD_DOCUMENTS",
  ],
  COORDINATOR: [
    "VIEW_DASHBOARD",
    "MANAGE_COLLABORATORS",
    "MANAGE_TRAININGS",
    "VIEW_REPORTS",
    "UPLOAD_DOCUMENTS",
  ],
  VIEWER: [
    "VIEW_DASHBOARD",
    "VIEW_REPORTS",
  ],
};

/**
 * Verifica si un rol tiene un permiso específico
 */
export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

/**
 * Verifica si un rol puede realizar operaciones de administrador
 */
export function isAdmin(role: Role): boolean {
  return role === "ADMIN";
}

/**
 * Verifica si un rol puede realizar operaciones de coordinación
 */
export function canCoordinate(role: Role): boolean {
  return role === "ADMIN" || role === "COORDINATOR";
}

/**
 * Verifica si un rol puede solo ver (incluye ADMIN y COORDINATOR)
 */
export function canView(role: Role): boolean {
  return role === "ADMIN" || role === "COORDINATOR" || role === "VIEWER";
}

/**
 * Obtiene todos los permisos de un rol
 */
export function getRolePermissions(role: Role): Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}

/**
 * Middleware helper para APIs - verifica permisos
 */
export function checkApiPermission(userRole: Role | undefined, requiredPermission: Permission): boolean {
  if (!userRole) return false;
  return hasPermission(userRole, requiredPermission);
}

/**
 * Helper para verificar múltiples permisos (ANY - cualquiera de los permisos)
 */
export function hasAnyPermission(role: Role, permissions: Permission[]): boolean {
  return permissions.some(permission => hasPermission(role, permission));
}

/**
 * Helper para verificar múltiples permisos (ALL - todos los permisos)
 */
export function hasAllPermissions(role: Role, permissions: Permission[]): boolean {
  return permissions.every(permission => hasPermission(role, permission));
} 
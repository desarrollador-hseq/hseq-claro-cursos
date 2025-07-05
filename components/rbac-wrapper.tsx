"use client";

import { useSession } from "next-auth/react";
import { ReactNode } from "react";
import { Role } from "@prisma/client";
import { Permission, hasPermission, isAdmin, canCoordinate, canView } from "@/lib/permissions";

interface RBACWrapperProps {
  children: ReactNode;
  // Especificar el permiso requerido
  permission?: Permission;
  // O especificar roles directamente
  allowedRoles?: Role[];
  // Helpers rápidos
  requireAdmin?: boolean;
  requireCoordinator?: boolean;
  requireViewer?: boolean;
  // Fallback si no tiene permisos
  fallback?: ReactNode;
}

export const RBACWrapper = ({
  children,
  permission,
  allowedRoles,
  requireAdmin = false,
  requireCoordinator = false,
  requireViewer = false,
  fallback = null
}: RBACWrapperProps) => {
  const { data: session } = useSession();
  
  if (!session?.user?.role) {
    return fallback;
  }

  const userRole = session.user.role as Role;

  // Verificar helpers rápidos
  if (requireAdmin && !isAdmin(userRole)) {
    return fallback;
  }

  if (requireCoordinator && !canCoordinate(userRole)) {
    return fallback;
  }

  if (requireViewer && !canView(userRole)) {
    return fallback;
  }

  // Verificar roles específicos
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return fallback;
  }

  // Verificar permisos específicos
  if (permission && !hasPermission(userRole, permission)) {
    return fallback;
  }

  return <>{children}</>;
};

// Componentes específicos para casos comunes
export const AdminOnly = ({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) => (
  <RBACWrapper requireAdmin fallback={fallback}>
    {children}
  </RBACWrapper>
);

export const CoordinatorUp = ({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) => (
  <RBACWrapper requireCoordinator fallback={fallback}>
    {children}
  </RBACWrapper>
);

export const ViewerUp = ({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) => (
  <RBACWrapper requireViewer fallback={fallback}>
    {children}
  </RBACWrapper>
);

// Hook personalizado para usar en componentes
export const usePermissions = () => {
  const { data: session } = useSession();
  const userRole = session?.user?.role as Role | undefined;

  return {
    userRole,
    isAdmin: userRole ? isAdmin(userRole) : false,
    canCoordinate: userRole ? canCoordinate(userRole) : false,
    canView: userRole ? canView(userRole) : false,
    hasPermission: (permission: Permission) => userRole ? hasPermission(userRole, permission) : false,
    checkRoles: (roles: Role[]) => userRole ? roles.includes(userRole) : false,
  };
}; 
export function isAdmin(): boolean {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem('isAdmin') === 'true';
}

export function requireAdmin(): void {
  if (!isAdmin()) {
    throw new Error('Unauthorized: Admin access required');
  }
} 
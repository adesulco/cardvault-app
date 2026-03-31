'use client';
import { usePathname } from 'next/navigation';

export default function AdminRouteDetector({
  children,
}: {
  children: (isAdmin: boolean) => React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');
  return <>{children(isAdmin)}</>;
}

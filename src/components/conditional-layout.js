// Create a separate client component
'use client';

import { usePathname } from 'next/navigation';
import Header from "@/components/header";
import Footer from "@/components/footer";

export function ConditionalHeader() {
  const pathname = usePathname();
  
  const hideHeaderRoutes = ['/login', '/register', '/forgot-password'];
  const shouldHideHeader = hideHeaderRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  if (shouldHideHeader) return null;
  return <Header />;
}

export function ConditionalFooter() {
  const pathname = usePathname();
  
  const hideFooterRoutes = ['/login', '/register', '/forgot-password'];
  const shouldHideFooter = hideFooterRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  if (shouldHideFooter) return null;
  return <Footer />;
}
// app/login/page.js
import LoginComponent from './logincomponent';
import { cookies } from 'next/headers';

export const metadata = {
    title: "Sign In to Your Account | Smallyfares",
    description: "Sign in to your Smallyfares account to manage your bookings, access exclusive deals, and enjoy personalized travel experiences. Secure login with multiple options.",
    keywords: ["login", "sign in", "account login", "travel account", "booking management", "Smallyfares login", "secure login"],
    metadataBase: new URL('https://smallyfares.com'),
    alternates: {
        canonical: 'https://smallyfares.com/login',
        languages: {
            'en-US': '/login',
        },
    },
    icons: {
        icon: [
            { url: '/favicon/favicon.ico' },
            { url: '/favicon/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
            { url: '/favicon/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
        ],
        apple: [
            { url: '/favicon/apple-touch-icon.png' },
            { url: '/favicon/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
        ],
    },
    openGraph: {
        title: "Sign In to Your Account | Smallyfares",
        description: "Sign in to your Smallyfares account to manage your bookings, access exclusive deals, and enjoy personalized travel experiences.",
        url: "https://smallyfares.com/login",
        siteName: "Smallyfares",
        images: [
            {
                url: "https://smallyfares.com/logo/logo.png", // Consider creating a login-specific image
                width: 1200,
                height: 630,
                alt: "Smallyfares - Secure Login Portal",
            },
        ],
        locale: "en-US",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Sign In to Your Account | Smallyfares",
        description: "Sign in to your Smallyfares account to manage your bookings, access exclusive deals, and enjoy personalized travel experiences.",
        images: {
            url: "https://smallyfares.com/logo/logo.png",
            alt: "Smallyfares - Secure Login Portal",
        },
        creator: "@Smallyfares",
    },
    robots: {
        index: false, // Login pages typically shouldn't be indexed
        follow: true,
        nocache: true,
        googleBot: {
            index: false,
            follow: true,
            noimageindex: true,
            "max-video-preview": -1,
            "max-image-preview": "standard",
            "max-snippet": -1,
        },
    },
    other: {
        "viewport": "width=device-width, initial-scale=1",
        "theme-color": "#3182CE",
        "format-detection": "telephone=no",
    },
};

export default async function LoginListing() {
  const cookieStore = await cookies();
  const token = cookieStore.get('smallytoken')?.value ?? null;
  // Pass ALL search params or specific ones
  return (
    <LoginComponent 
      user={token} 
    />
  );
}
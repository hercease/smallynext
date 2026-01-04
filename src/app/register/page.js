// app/register/page.js  (Recommended to rename file to register/page.js)
import RegisterComponent from './registercomponent';
import { cookies } from 'next/headers';

export const metadata = {
    title: "Create Your Account | Sign Up for Smallyfares",
    description: "Join Smallyfares to book cheap flights, hotels, cars, and holiday packages. Create your free account to access exclusive deals, manage bookings, and enjoy personalized travel experiences.",
    keywords: ["sign up", "register", "create account", "travel account", "free registration", "Smallyfares signup", "book travel", "join Smallyfares"],
    metadataBase: new URL('https://smallyfares.com'),
    alternates: {
        canonical: 'https://smallyfares.com/register',
        languages: {
            'en-US': '/register',
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
        title: "Create Your Account | Sign Up for Smallyfares",
        description: "Join Smallyfares to book cheap flights, hotels, cars, and holiday packages. Create your free account for exclusive travel deals.",
        url: "https://smallyfares.com/register",
        siteName: "Smallyfares",
        images: [
            {
                url: "https://smallyfares.com/logo/logo.png",
                width: 1200,
                height: 630,
                alt: "Smallyfares - Join Our Travel Community",
            },
        ],
        locale: "en-US",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Create Your Account | Sign Up for Smallyfares",
        description: "Join Smallyfares to book cheap flights, hotels, cars, and holiday packages. Create your free account for exclusive travel deals.",
        images: {
            url: "https://smallyfares.com/logo/logo.png",
            alt: "Smallyfares - Join Our Travel Community",
        },
        creator: "@Smallyfares",
    },
    robots: {
        index: true, // Registration pages CAN be indexed to attract new users
        follow: true,
        nocache: false,
        googleBot: {
            index: true,
            follow: true,
            noimageindex: false,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
        },
    },
    other: {
        "viewport": "width=device-width, initial-scale=1",
        "theme-color": "#3182CE",
        "format-detection": "telephone=no",
    },
};

export default async function RegisterListing() {
  const cookieStore = await cookies();
  const token = cookieStore.get('smallytoken')?.value ?? null;
  
  return (
    <RegisterComponent 
      user={token} 
    />
  );
}
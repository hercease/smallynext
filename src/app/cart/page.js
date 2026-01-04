import CartComponent from './cartcomponent';
import { cookies } from 'next/headers'

export const metadata = {
    title: "My Cart - Review Your Hotel Bookings | Smallyfares",
    description: "Review your selected hotel bookings, room rates, and accommodation details. Manage your cart and proceed to secure checkout with Smallyfares.",
    keywords: ["hotel cart", "booking cart", "reservation review", "hotel bookings", "accommodation cart", "travel cart", "Smallyfares cart"],
    metadataBase: new URL('https://smallyfares.com/'),
    alternates: {
        canonical: 'https://smallyfares.com/cart',
        languages: {
            'en-US': '/cart',
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
        title: "My Hotel Booking Cart | Smallyfares",
        description: "Review your selected hotel accommodations and room rates. Manage your bookings before proceeding to secure checkout.",
        url: "https://smallyfares.com/cart",
        siteName: "Smallyfares Hotels",
        images: [
            {
                url: "https://smallyfares.com/og-cart-image.jpg",
                width: 1200,
                height: 630,
                alt: "Smallyfares Booking Cart - Review Your Hotel Selections",
            },
        ],
        locale: "en_US",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "My Hotel Booking Cart | Smallyfares",
        description: "Review your selected hotel accommodations and room rates before checkout.",
        images: {
            url: "https://smallyfares.com/twitter-cart-image.jpg",
            alt: "Smallyfares Booking Cart - Review Your Hotel Selections",
        },
        creator: "@Smallyfares",
    },
    robots: {
        index: false, // Cart pages typically shouldn't be indexed
        follow: true,
        nocache: true, // Cart content changes frequently
        googleBot: {
            index: false,
            follow: true,
            noimageindex: false,
            "max-video-preview": -1,
            "max-image-preview": "standard",
            "max-snippet": -1,
        },
    },
    authors: [{ name: "Smallyfares" }],
    category: "travel",
};

// JSON-LD structured data specifically for cart page
export const jsonLd = {
    '@context': 'https://schema.org',
    '@type': ['WebPage', 'CheckoutPage'],
    name: 'My Cart - Review Your Hotel Bookings | Smallyfares',
    description: 'Shopping cart page for reviewing hotel bookings and accommodations before checkout',
    url: 'https://smallyfares.com/cart',
    breadcrumb: {
        '@type': 'BreadcrumbList',
        itemListElement: [
            {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: 'https://smallyfares.com/'
            },
            {
                '@type': 'ListItem',
                position: 2,
                name: 'Hotels',
                item: 'https://smallyfares.com/hotels'
            },
            {
                '@type': 'ListItem',
                position: 3,
                name: 'Cart',
                item: 'https://smallyfares.com/cart'
            }
        ]
    },
    potentialAction: {
        '@type': 'ViewAction',
        target: 'https://smallyfares.com/cart'
    }
};

export default async function CartDetails() {
    const cookieStore = await cookies();
    const token = cookieStore.get('smallytoken')?.value ?? null;
    return (
        <>
            <CartComponent user={token}  />
        </>
    )
}
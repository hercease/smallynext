import HotelDetails from './hoteldetailscomponent';
import { cookies } from 'next/headers'
export const metadata = {
    title: "Hotel Deals & Accommodations Worldwide | Smallyfares Hotels",
    description: "Discover the best hotel deals with Smallyfares. Book luxury resorts, budget stays, and unique accommodations worldwide with exclusive discounts and seamless booking.",
    keywords: ["hotel deals", "book hotels online", "luxury resorts", "budget accommodations", "hotel discounts", "vacation stays", "Smallyfares hotels"],
    metadataBase: new URL('https://smallyfares.com/'),
    alternates: {
        canonical: 'https://smallyfares.com/',
        languages: {
            'en-US': '/',
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
        title: "Find Perfect Hotel Deals Worldwide | Smallyfares",
        description: "Discover amazing hotel deals with Smallyfares. From luxury resorts to budget-friendly stays, find your perfect accommodation with exclusive discounts.",
        url: "https://smallyfares.com/",
        siteName: "Smallyfares Hotels",
        images: [
            {
                url: "https://smallyfares.com/og-hotel-image.jpg",
                width: 1200,
                height: 630,
                alt: "Smallyfares Hotel Deals - Find Your Perfect Stay",
            },
        ],
        locale: "en_US",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Hotel Deals & Accommodations | Smallyfares",
        description: "Discover the best hotel deals with Smallyfares. Book luxury resorts, budget stays, and unique accommodations worldwide.",
        images: {
            url: "https://smallyfares.com/twitter-hotel-image.jpg",
            alt: "Smallyfares Hotel Deals - Find Your Perfect Stay",
        },
        creator: "@Smallyfares",
    },
    robots: {
        index: true,
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
    additionalMeta: {
        viewport: "width=device-width, initial-scale=1",
        themeColor: "#3182CE",
    },
    authors: [{ name: "Smallyfares" }],
    category: "travel",
};

// JSON-LD structured data for better SEO
export const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Hotel Deals & Accommodations Worldwide | Smallyfares Hotels',
    description: 'Discover the best hotel deals with Smallyfares. Book luxury resorts, budget stays, and unique accommodations worldwide with exclusive discounts.',
    url: 'https://smallyfares.com/',
    publisher: {
        '@type': 'Organization',
        name: 'Smallyfares',
        logo: {
            '@type': 'ImageObject',
            url: 'https://smallyfares.com/logo.png'
        }
    },
    mainEntity: {
        '@type': 'ItemList',
        itemListElement: [
            {
                '@type': 'ListItem',
                position: 1,
                item: {
                    '@type': 'Hotel',
                    name: 'Luxury Resort Collection',
                    description: 'Premium luxury resorts with exclusive amenities',
                    url: 'https://smallyfares.com/hotels/luxury'
                }
            },
            {
                '@type': 'ListItem',
                position: 2,
                item: {
                    '@type': 'Hotel',
                    name: 'Budget Accommodations',
                    description: 'Affordable stays without compromising comfort',
                    url: 'https://smallyfares.com/hotels/budget'
                }
            },
            {
                '@type': 'ListItem',
                position: 3,
                item: {
                    '@type': 'Hotel',
                    name: 'Business Hotels',
                    description: 'Hotels with business facilities and convenient locations',
                    url: 'https://smallyfares.com/hotels/business'
                }
            }
        ]
    }
};

export default async function HotelDetail() {
    const cookieStore = await cookies();
    const token = cookieStore.get('smallytoken')?.value ?? null;
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <HotelDetails user={token}  />
        </>
    )
}
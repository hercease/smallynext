import * as FaIcons from "react-icons/fa";
import amenities from "./json/hotel_amenities.json";

/**
 * Returns React Icon component for a given label
 * @param {string} label - Amenity label (e.g. "Wi-fi")
 * @returns React component or null
 */
export function getAmenityIcon(label) {
    const item = amenities.find(
        (a) => a.name === label
    );
    if (!item) return null;

    const Icon = FaIcons[item.icon];
    return Icon || null;
}

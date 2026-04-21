// using global fetch


const GEOAPIFY_API_KEY = process.env.GEOAPIFY_API_KEY;

export const getNearbyColleges = async (req, res) => {
    try {
        const { lat, lng } = req.query;

        if (!lat || !lng) {
            return res.status(400).json({ error: "Latitude and Longitude are required" });
        }

        if (!GEOAPIFY_API_KEY) {
            console.error("GEOAPIFY_API_KEY is missing");
            return res.status(500).json({ error: "Server misconfiguration: API Key missing" });
        }

        const radius = 50000; // 50km radius
        const categories = 'education.university,education.college';
        // Increased limit to 500 and added bias=proximity to ensure closest colleges appear first
        const url = `https://api.geoapify.com/v2/places?categories=${categories}&filter=circle:${lng},${lat},${radius}&bias=proximity:${lng},${lat}&limit=500&apiKey=${GEOAPIFY_API_KEY}`;

        console.log(`Fetching colleges near ${lat}, ${lng}...`);

        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok || !data.features) {
            console.error("Geoapify API Error:", data);
            return res.status(500).json({ error: "Failed to fetch from Geoapify", details: data.message || "Unknown error" });
        }

        // Map results to a simpler format
        const colleges = data.features.map(place => ({
            name: place.properties.name || place.properties.address_line1,
            address: place.properties.formatted || place.properties.address_line2,
            placeId: place.properties.place_id,
            rating: place.properties.rating,
            location: {
                lat: place.properties.lat,
                lng: place.properties.lon
            }
        }));

        res.json(colleges);

    } catch (error) {
        console.error("Location Controller Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const searchLocation = async (req, res) => {
    try {
        const { query } = req.query;

        if (!query) {
            return res.status(400).json({ error: "Search query is required" });
        }

        if (!GEOAPIFY_API_KEY) {
            console.error("GEOAPIFY_API_KEY is missing");
            return res.status(500).json({ error: "Server misconfiguration: API Key missing" });
        }

        const url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(query)}&limit=5&apiKey=${GEOAPIFY_API_KEY}`;

        console.log(`Searching for location: ${query}...`);

        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok || !data.features) {
            console.error("Geoapify Search Error:", data);
            return res.status(500).json({ error: "Failed to search location", details: data.message || "Unknown error" });
        }

        // Map results to a simpler format
        const locations = data.features.map(place => ({
            name: place.properties.formatted,
            city: place.properties.city,
            state: place.properties.state,
            country: place.properties.country,
            location: {
                lat: place.properties.lat,
                lng: place.properties.lon
            }
        }));

        res.json(locations);

    } catch (error) {
        console.error("Location Search Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

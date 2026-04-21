import { API_BASE_URL } from '../config/api';

const API_URL = API_BASE_URL;

export const getCurrentPosition = () => {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation is not supported by your browser'));
        } else {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                (error) => {
                    reject(error);
                }
            );
        }
    });
};

export const getNearbyColleges = async (lat, lng) => {
    try {
        const response = await fetch(`${API_URL}/location/nearby?lat=${lat}&lng=${lng}`);
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to fetch colleges');
        }
        return await response.json();
    } catch (error) {
        throw error;
    }
};

export const searchLocation = async (query) => {
    try {
        const response = await fetch(`${API_URL}/location/search?query=${encodeURIComponent(query)}`);
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to search location');
        }
        return await response.json();
    } catch (error) {
        throw error;
    }
};

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
            console.warn('Failed to fetch colleges:', response.status);
            return [];
        }
        return await response.json();
    } catch (error) {
        if (error.name === 'AbortError') {
            console.log('Fetch colleges aborted');
        } else {
            console.error('Error fetching colleges:', error);
        }
        return [];
    }
};

export const searchLocation = async (query) => {
    try {
        const response = await fetch(`${API_URL}/location/search?query=${encodeURIComponent(query)}`);
        if (!response.ok) {
            console.warn('Failed to search location:', response.status);
            return [];
        }
        return await response.json();
    } catch (error) {
        if (error.name === 'AbortError') {
            console.log('Search location aborted');
        } else {
            console.error('Error searching location:', error);
        }
        return [];
    }
};

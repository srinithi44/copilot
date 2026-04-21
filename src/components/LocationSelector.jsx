import React, { useState, useEffect } from 'react';
import { MapPin, Building, ChevronDown, Crosshair, Loader2 } from 'lucide-react';
import Input from './Input';
import Button from './Button';
import { useAuth } from '../contexts/AuthContext';
import { getCurrentPosition, getNearbyColleges, searchLocation } from '../services/LocationService';
// Mock Data for Demo (Real world would use an API or large library)
const LOCATION_DATA = {
    "India": {
        "Maharashtra": ["Mumbai", "Pune", "Nagpur"],
        "Karnataka": ["Bangalore", "Mysore", "Hubli"],
        "Delhi": ["New Delhi", "North Delhi", "South Delhi"],
        "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai"]
    },
    "USA": {
        "California": ["Los Angeles", "San Francisco", "San Diego"],
        "New York": ["New York City", "Buffalo", "Albany"],
        "Texas": ["Houston", "Austin", "Dallas"]
    }
};

const API_URL = import.meta.env.VITE_API_URL || '/api';

const LocationSelector = () => {
    const { currentUser } = useAuth();
    const [stats, setStats] = useState({
        country: '',
        state: '',
        city: '',
        institutionId: ''
    });
    const [institutions, setInstitutions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searchTimeout, setSearchTimeout] = useState(null);

    // Load initial user location if available (mocking fetch from user profile)
    // In real app, we might fetch user profile from DB if not in context

    useEffect(() => {
        // Fetch institutions when location changes
        if (stats.country && stats.state && stats.city) {
            fetchInstitutions();
        } else {
            setInstitutions([]);
        }
    }, [stats.country, stats.state, stats.city]);

    const fetchInstitutions = async () => {
        setLoading(true);
        try {
            const query = new URLSearchParams({
                country: stats.country,
                state: stats.state,
                city: stats.city
            }).toString();

            const response = await fetch(`${API_URL}/institutions?${query}`);
            if (response.ok) {
                const data = await response.json();
                setInstitutions(data);
            }
        } catch (error) {
            console.error("Failed to fetch institutions", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchQuery(value);

        // Clear previous timeout
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }

        // Debounce search
        if (value.trim().length > 2) {
            const timeout = setTimeout(async () => {
                try {
                    const results = await searchLocation(value);
                    setSearchResults(results);
                } catch (error) {
                    console.error("Search failed:", error);
                    setSearchResults([]);
                }
            }, 500);
            setSearchTimeout(timeout);
        } else {
            setSearchResults([]);
        }
    };

    const handleSelectSearchResult = async (result) => {
        setSearchQuery(result.name);
        setSearchResults([]);

        // Update stats with selected location
        setStats(prev => ({
            ...prev,
            country: result.country || '',
            state: result.state || '',
            city: result.city || result.name
        }));

        // Fetch nearby colleges for this location
        if (result.location) {
            try {
                const colleges = await getNearbyColleges(result.location.lat, result.location.lng);
                const formattedColleges = colleges.map(c => ({
                    _id: c.placeId,
                    name: c.name
                }));
                setInstitutions(formattedColleges);
                if (formattedColleges.length > 0) {
                    setStats(prev => ({ ...prev, institutionId: formattedColleges[0]._id }));
                    setMessage({ type: 'success', text: `Found ${formattedColleges.length} colleges nearby!` });
                }
            } catch (error) {
                console.error("Failed to fetch nearby colleges:", error);
            }
        }
    };

    const handleAutoDetect = async () => {
        setLoading(true);
        setMessage({ type: '', text: '' });
        try {
            const pos = await getCurrentPosition();
            // Optional: Use reverse geocoding to fill country/state/city if needed
            // For now, we just get colleges near the coordinates
            const colleges = await getNearbyColleges(pos.lat, pos.lng);

            // Map Google Places result to our dropdown format
            // We use place_id as the ID for consistency with the new GPS flow
            const formattedColleges = colleges.map(c => ({
                _id: c.placeId, // Important: using placeId as the ID
                name: c.name
            }));

            setInstitutions(formattedColleges);

            if (formattedColleges.length > 0) {
                setStats(prev => ({ ...prev, institutionId: formattedColleges[0]._id, city: 'Detected Location' }));
                setMessage({ type: 'success', text: `Found ${formattedColleges.length} colleges nearby!` });
            } else {
                setMessage({ type: 'error', text: 'No colleges found nearby.' });
            }

        } catch (error) {
            console.error("Auto detect failed", error);
            setMessage({ type: 'error', text: 'Location detection failed: ' + error.message });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!stats.institutionId) {
            setMessage({ type: 'error', text: 'Please select an institution' });
            return;
        }

        setSaving(true);
        setMessage({ type: '', text: '' });

        try {
            // Update user profile
            // Note: We need a backend endpoint to update user profile. 
            // Assuming POST /api/user/update or similar. 
            // Since we don't have a specific update user route defined in the task, 
            // I will assume we might need to add one or use a generic one if exists.
            // For now, I'll mock the call or add a TODO.
            // Wait, the plan said "Update API services/calls".

            // Let's assume we create a route PUT /api/users/profile

            // Temporary: saving to local storage or doing a fetch
            const response = await fetch(`${API_URL}/users/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    // 'Authorization': `Bearer ${token}` // needed if auth
                },
                body: JSON.stringify({
                    uid: currentUser.uid,
                    institutionId: stats.institutionId,
                    location: {
                        country: stats.country,
                        state: stats.state,
                        city: stats.city
                    }
                })
            });

            if (response.ok) {
                setMessage({ type: 'success', text: 'Institution updated successfully!' });
            } else {
                throw new Error('Failed to update');
            }

        } catch (error) {
            console.error("Update failed", error);
            setMessage({ type: 'error', text: 'Failed to save changes. Please try again.' });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="bg-[var(--surface-color)] p-6 rounded-2xl border border-[var(--border-color)] shadow-sm">
            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                <Building size={20} className="text-[var(--primary-color)]" />
                Select Your Institution
            </h3>

            <div className="space-y-4">
                {/* Auto Detect Button */}
                <div className="flex justify-end">
                    <button
                        onClick={handleAutoDetect}
                        disabled={loading}
                        className="flex items-center gap-2 text-sm font-medium text-[var(--primary-color)] hover:underline disabled:opacity-50"
                    >
                        {loading ? <Loader2 size={16} className="animate-spin" /> : <Crosshair size={16} />}
                        Auto-Detect Location & College
                    </button>
                </div>

                {/* Location Search */}
                <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-[var(--text-secondary)]">Search Location</label>
                    <div className="relative">
                        <Input
                            type="text"
                            placeholder="Search for your city or location..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                            className="w-full"
                        />
                        {searchResults.length > 0 && (
                            <div className="absolute z-10 w-full mt-1 bg-[var(--surface-color)] border border-[var(--border-color)] rounded-xl shadow-lg max-h-60 overflow-y-auto">
                                {searchResults.map((result, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleSelectSearchResult(result)}
                                        className="w-full px-4 py-3 text-left hover:bg-[var(--primary-color)]/10 transition-colors border-b border-[var(--border-color)] last:border-0"
                                    >
                                        <div className="text-sm font-medium text-[var(--text-primary)]">{result.name}</div>
                                        <div className="text-xs text-[var(--text-muted)] mt-0.5">
                                            {[result.city, result.state, result.country].filter(Boolean).join(', ')}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <p className="text-xs text-[var(--text-muted)]">Or manually select below</p>
                </div>

                {/* Country */}
                <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-[var(--text-secondary)]">Country</label>
                    <div className="relative">
                        <select
                            value={stats.country}
                            onChange={(e) => setStats({ ...stats, country: e.target.value, state: '', city: '', institutionId: '' })}
                            className="w-full h-[46px] px-4 bg-[var(--surface-color)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--primary-color)]/20 outline-none appearance-none"
                        >
                            <option value="">Select Country</option>
                            {Object.keys(LOCATION_DATA).map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" size={16} />
                    </div>
                </div>

                {/* State */}
                <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-[var(--text-secondary)]">State</label>
                    <div className="relative">
                        <select
                            value={stats.state}
                            onChange={(e) => setStats({ ...stats, state: e.target.value, city: '', institutionId: '' })}
                            disabled={!stats.country}
                            className="w-full h-[46px] px-4 bg-[var(--surface-color)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--primary-color)]/20 outline-none appearance-none disabled:opacity-50"
                        >
                            <option value="">Select State</option>
                            {stats.country && LOCATION_DATA[stats.country] && Object.keys(LOCATION_DATA[stats.country]).map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" size={16} />
                    </div>
                </div>

                {/* City */}
                <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-[var(--text-secondary)]">City</label>
                    <div className="relative">
                        <select
                            value={stats.city}
                            onChange={(e) => setStats({ ...stats, city: e.target.value, institutionId: '' })}
                            disabled={!stats.state}
                            className="w-full h-[46px] px-4 bg-[var(--surface-color)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--primary-color)]/20 outline-none appearance-none disabled:opacity-50"
                        >
                            <option value="">Select City</option>
                            {stats.country && stats.state && LOCATION_DATA[stats.country][stats.state]?.map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" size={16} />
                    </div>
                </div>

                {/* Institution */}
                <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-[var(--text-secondary)]">Institution</label>
                    <div className="relative">
                        <select
                            value={stats.institutionId}
                            onChange={(e) => setStats({ ...stats, institutionId: e.target.value })}
                            disabled={!stats.city}
                            className="w-full h-[46px] px-4 bg-[var(--surface-color)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--primary-color)]/20 outline-none appearance-none disabled:opacity-50"
                        >
                            <option value="">{loading ? "Loading..." : "Select Institution"}</option>
                            {institutions.map(inst => (
                                <option key={inst._id} value={inst._id}>{inst.name}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" size={16} />
                    </div>
                    {stats.city && institutions.length === 0 && !loading && (
                        <p className="text-xs text-[var(--text-muted)] mt-1">No institutions found. (Try creating one locally)</p>
                    )}
                </div>

                {/* Save Button */}
                <Button
                    onClick={handleSave}
                    loading={saving}
                    disabled={!stats.institutionId}
                    width="full"
                    className="mt-2"
                >
                    Save Changes
                </Button>

                {message.text && (
                    <p className={`text-sm text-center font-medium ${message.type === 'error' ? 'text-red-500' : 'text-green-500'}`}>
                        {message.text}
                    </p>
                )}
            </div>
        </div>
    );
};

export default LocationSelector;

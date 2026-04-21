import React, { useState } from 'react';
import { MapPin, Building2, Crosshair, Loader2, Search, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { getCurrentPosition, getNearbyColleges, searchLocation } from '../../services/LocationService';

export default function LocationInstitutionPicker({ selectedInstitution, onSelect }) {
    const [institutions, setInstitutions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [searchTimeout, setSearchTimeout] = useState(null);
    const [showManualEntry, setShowManualEntry] = useState(false);
    const [manualCollege, setManualCollege] = useState({
        name: '',
        city: '',
        state: '',
        country: 'India'
    });

    // Handle location search with autocomplete
    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchQuery(value);

        if (searchTimeout) clearTimeout(searchTimeout);

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

    // Handle selecting a search result
    const handleSelectSearchResult = async (result) => {
        setSearchQuery(result.name);
        setSearchResults([]);
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const colleges = await getNearbyColleges(result.location.lat, result.location.lng);
            const formattedColleges = colleges.map(c => ({
                _id: c.placeId,
                name: c.name,
                address: c.address,
                country: result.country || 'India',
                state: result.state || 'Unknown',
                city: result.city || result.name
            }));

            setInstitutions(formattedColleges);

            if (formattedColleges.length > 0) {
                setMessage({ type: 'success', text: `Found ${formattedColleges.length} colleges nearby!` });
            } else {
                setMessage({ type: 'warning', text: 'No colleges found nearby. You can add your college manually.' });
            }
        } catch (error) {
            console.error("Failed to fetch nearby colleges:", error);
            setMessage({ type: 'error', text: 'Failed to fetch colleges. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    // Handle auto-detect location
    const handleAutoDetect = async () => {
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const pos = await getCurrentPosition();
            const colleges = await getNearbyColleges(pos.lat, pos.lng);

            const formattedColleges = colleges.map(c => ({
                _id: c.placeId,
                name: c.name,
                address: c.address,
                country: 'India',
                state: 'Detected',
                city: 'Detected Location'
            }));

            setInstitutions(formattedColleges);

            if (formattedColleges.length > 0) {
                setMessage({ type: 'success', text: `Found ${formattedColleges.length} colleges nearby!` });
                setSearchQuery('Current Location');
            } else {
                setMessage({ type: 'warning', text: 'No colleges found nearby. You can add your college manually.' });
            }
        } catch (error) {
            console.error("Auto detect failed", error);
            setMessage({ type: 'error', text: 'Location detection failed. Please add your college manually.' });
        } finally {
            setLoading(false);
        }
    };

    // Handle manual college entry
    const handleAddManualCollege = () => {
        if (!manualCollege.name || !manualCollege.city) {
            setMessage({ type: 'error', text: 'Please enter college name and city' });
            return;
        }

        const newCollege = {
            _id: `manual_${Date.now()}`,
            name: manualCollege.name,
            address: `${manualCollege.city}, ${manualCollege.state || ''}`,
            country: manualCollege.country,
            state: manualCollege.state || 'N/A',
            city: manualCollege.city
        };

        onSelect(newCollege);
        setMessage({ type: 'success', text: 'College added successfully!' });
        setShowManualEntry(false);
        setManualCollege({ name: '', city: '', state: '', country: 'India' });
    };

    return (
        <div className="space-y-4">
            {/* Header Buttons */}
            <div className="flex justify-between items-center">
                <button
                    onClick={() => setShowManualEntry(!showManualEntry)}
                    className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-[var(--primary-color)] transition-all"
                >
                    <Plus size={16} />
                    {showManualEntry ? 'Hide Manual Entry' : 'Add College Manually'}
                </button>
                <button
                    onClick={handleAutoDetect}
                    disabled={loading}
                    className="flex items-center gap-2 text-sm font-medium text-[var(--primary-color)] hover:underline disabled:opacity-50 transition-all"
                >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <Crosshair size={16} />}
                    Auto-Detect
                </button>
            </div>

            {/* Manual Entry Form */}
            {showManualEntry && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3"
                >
                    <h4 className="text-sm font-bold text-slate-700">Enter Your College Details</h4>
                    <input
                        type="text"
                        placeholder="College Name *"
                        value={manualCollege.name}
                        onChange={(e) => setManualCollege({ ...manualCollege, name: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[var(--primary-color)]/20 outline-none"
                    />
                    <div className="grid grid-cols-2 gap-2">
                        <input
                            type="text"
                            placeholder="City *"
                            value={manualCollege.city}
                            onChange={(e) => setManualCollege({ ...manualCollege, city: e.target.value })}
                            className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[var(--primary-color)]/20 outline-none"
                        />
                        <input
                            type="text"
                            placeholder="State"
                            value={manualCollege.state}
                            onChange={(e) => setManualCollege({ ...manualCollege, state: e.target.value })}
                            className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[var(--primary-color)]/20 outline-none"
                        />
                    </div>
                    <input
                        type="text"
                        placeholder="Country"
                        value={manualCollege.country}
                        onChange={(e) => setManualCollege({ ...manualCollege, country: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[var(--primary-color)]/20 outline-none"
                    />
                    <button
                        onClick={handleAddManualCollege}
                        className="w-full px-4 py-2 bg-[var(--primary-color)] text-white rounded-lg text-sm font-medium hover:brightness-110 transition-all"
                    >
                        Add This College
                    </button>
                </motion.div>
            )}

            {/* Location Search */}
            {!showManualEntry && (
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-[var(--text-secondary)] flex items-center gap-2">
                        <Search size={16} />
                        Or Search Location for Nearby Colleges
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Type your city or location..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                            className="w-full h-[46px] px-4 bg-white/80 border border-slate-200 rounded-xl text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--primary-color)]/20 outline-none"
                        />
                        {searchResults.length > 0 && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                                {searchResults.map((result, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleSelectSearchResult(result)}
                                        className="w-full px-4 py-3 text-left hover:bg-[var(--primary-color)]/10 transition-colors border-b border-slate-100 last:border-0"
                                    >
                                        <div className="text-sm font-medium text-[var(--text-primary)]">{result.name}</div>
                                        <div className="text-xs text-slate-500 mt-0.5">
                                            {[result.city, result.state, result.country].filter(Boolean).join(', ')}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Message */}
            {message.text && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-3 rounded-xl text-sm font-medium ${message.type === 'error' ? 'bg-red-50 text-red-600 border border-red-100' :
                            message.type === 'warning' ? 'bg-yellow-50 text-yellow-700 border border-yellow-100' :
                                'bg-green-50 text-green-600 border border-green-100'
                        }`}
                >
                    {message.text}
                </motion.div>
            )}

            {/* Selected Institution Display */}
            {selectedInstitution && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 rounded-xl border-2 border-[var(--primary-color)] bg-[var(--primary-color)]/10"
                >
                    <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-[var(--primary-color)]/20">
                            <Building2 size={20} className="text-[var(--primary-color)]" />
                        </div>
                        <div className="flex-1">
                            <p className="font-bold text-sm text-slate-800">{selectedInstitution.name}</p>
                            {selectedInstitution.address && (
                                <p className="text-xs text-slate-500 mt-1">{selectedInstitution.address}</p>
                            )}
                            <p className="text-xs text-slate-400 mt-1">
                                {[selectedInstitution.city, selectedInstitution.state, selectedInstitution.country].filter(Boolean).join(', ')}
                            </p>
                        </div>
                        <div className="text-green-600">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Institution List */}
            {institutions.length > 0 && !selectedInstitution && (
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-[var(--text-secondary)] flex items-center gap-2">
                        <Building2 size={16} />
                        Select Your Institution ({institutions.length} found)
                    </label>
                    <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2">
                        {institutions.map(inst => (
                            <motion.button
                                key={inst._id}
                                whileHover={{ scale: 1.02 }}
                                onClick={() => onSelect(inst)}
                                className="w-full p-4 rounded-xl border border-slate-200 bg-white hover:border-[var(--primary-color)]/50 text-left flex items-start gap-3 transition-all"
                            >
                                <div className="p-2 rounded-lg bg-slate-100">
                                    <Building2 size={20} className="text-slate-500" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-bold text-sm text-slate-800">{inst.name}</p>
                                    {inst.address && (
                                        <p className="text-xs text-slate-500 mt-1">{inst.address}</p>
                                    )}
                                    <p className="text-xs text-slate-400 mt-1">
                                        {[inst.city, inst.state, inst.country].filter(Boolean).join(', ')}
                                    </p>
                                </div>
                            </motion.button>
                        ))}
                    </div>
                </div>
            )}

            {/* Loading State */}
            {loading && institutions.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-[var(--primary-color)] mb-3" />
                    <p className="text-sm text-slate-500">Searching for nearby colleges...</p>
                </div>
            )}

            {/* Empty State */}
            {!loading && institutions.length === 0 && !message.text && !selectedInstitution && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <MapPin className="w-12 h-12 text-slate-300 mb-3" />
                    <p className="text-sm font-medium text-slate-600">Add your college manually</p>
                    <p className="text-xs text-slate-400 mt-1">or search location to find nearby colleges</p>
                </div>
            )}
        </div>
    );
}

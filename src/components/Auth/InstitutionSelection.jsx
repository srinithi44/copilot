import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, School, Building2 } from 'lucide-react';
import { API_BASE_URL } from '../../config/api';

// Using a simplified list for now, ideally this comes from Google Maps API or Backend
const sampleCountries = ['India', 'USA', 'UK'];
const sampleStates = { 'India': ['Tamil Nadu', 'Karnataka', 'Maharashtra'], 'USA': ['California', 'New York'] };
const sampleCities = { 'Tamil Nadu': ['Chennai', 'Coimbatore'], 'Karnataka': ['Bangalore'], 'California': ['San Francisco'] };

export default function InstitutionSelection({ onSelect, selectedInstitution }) {
    // If we have Google Maps API Key, we would use Autocomplete here.
    // For now, we will use a cascaded dropdown approach + Manual Entry or Backend Search.

    // We will fetch institutions from our backend based on filters
    const [institutions, setInstitutions] = useState([]);
    const [loading, setLoading] = useState(false);

    const [filters, setFilters] = useState({
        country: '',
        state: '',
        city: ''
    });

    useEffect(() => {
        if (filters.city) {
            fetchInstitutions();
        }
    }, [filters.city]);

    const fetchInstitutions = async () => {
        setLoading(true);
        try {
            const query = new URLSearchParams(filters).toString();
            // Assuming this endpoint exists as per plan
            const res = await fetch(`${API_BASE_URL}/institutions?${query}`);
            const data = await res.json();
            setInstitutions(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <h3 className="text-xl font-bold text-center text-[var(--text-primary)]">Select Institution</h3>

            <div className="grid grid-cols-2 gap-2">
                <select
                    className="p-3 rounded-xl border border-slate-200 bg-white/80"
                    onChange={e => setFilters({ ...filters, country: e.target.value, state: '', city: '' })}
                    value={filters.country}
                >
                    <option value="">Country</option>
                    {sampleCountries.map(c => <option key={c} value={c}>{c}</option>)}
                </select>

                <select
                    className="p-3 rounded-xl border border-slate-200 bg-white/80"
                    disabled={!filters.country}
                    onChange={e => setFilters({ ...filters, state: e.target.value, city: '' })}
                    value={filters.state}
                >
                    <option value="">State</option>
                    {filters.country && sampleStates[filters.country]?.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>

            <select
                className="w-full p-3 rounded-xl border border-slate-200 bg-white/80"
                disabled={!filters.state}
                onChange={e => setFilters({ ...filters, city: e.target.value })}
                value={filters.city}
            >
                <option value="">City</option>
                {filters.state && sampleCities[filters.state]?.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            <div className="mt-4 max-h-[200px] overflow-y-auto space-y-2">
                {loading && <p className="text-center text-sm text-slate-500">Loading...</p>}

                {!loading && institutions.map(inst => (
                    <motion.button
                        key={inst._id}
                        whileHover={{ scale: 1.02 }}
                        onClick={() => onSelect(inst)}
                        className={`w-full p-3 rounded-xl border text-left flex items-center gap-3
                            ${selectedInstitution?._id === inst._id
                                ? 'border-[var(--primary-color)] bg-[var(--primary-color)]/10'
                                : 'border-slate-200 bg-white'
                            }
                        `}
                    >
                        <School className="text-slate-500" size={20} />
                        <div>
                            <p className="font-bold text-sm text-slate-800">{inst.name}</p>
                            <p className="text-xs text-slate-500">{inst.city}, {inst.state}</p>
                        </div>
                    </motion.button>
                ))}

                {!loading && filters.city && institutions.length === 0 && (
                    <div className="text-center p-4">
                        <p className="text-sm text-slate-500">No institutions found.</p>
                        <button className="text-[var(--primary-color)] text-sm font-bold mt-2 hover:underline">
                            Request to Add
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

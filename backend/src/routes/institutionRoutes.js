import express from 'express';
import Institution from '../models/Institution.js';
import User from '../models/User.js';

const router = express.Router();

// GET /api/institutions - Filter by location
router.get('/', async (req, res) => {
    try {
        const { country, state, city } = req.query;
        let filter = {};

        if (country) filter.country = country;
        if (state) filter.state = state;
        if (city) filter.city = city;

        const institutions = await Institution.find(filter).sort({ name: 1 });
        res.json(institutions);
    } catch (error) {
        console.error('Error fetching institutions:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/institutions/:id - Get single institution
router.get('/:id', async (req, res) => {
    try {
        const institution = await Institution.findById(req.params.id);
        if (!institution) return res.status(404).json({ error: 'Institution not found' });
        res.json(institution);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/institutions - Create (Admin only - simplified for now)
router.post('/', async (req, res) => {
    try {
        const { name, country, state, city, type } = req.body;

        // Basic validation
        if (!name || !country || !state || !city) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const newInstitution = new Institution({
            name,
            country,
            state,
            city,
            type: type || 'University'
        });

        await newInstitution.save();
        res.status(201).json(newInstitution);
    } catch (error) {
        console.error('Error creating institution:', error);
        res.status(500).json({ error: 'Failed to create institution' });
    }
});

export default router;

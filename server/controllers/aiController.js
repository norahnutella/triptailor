import OpenAI from 'openai';

const client = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

export async function travelPlan(req, res) {
    try {
        if (!client) return res.status(503).json({ message: 'OpenAI is not configured. Add OPENAI_API_KEY to the server environment.' });

        const destination = String(req.body.destination || '').trim();
        const request = String(req.body.request || '').trim();
        const dates = String(req.body.dates || '').trim();
        const travelers = Number(req.body.travelers || 1);
        const currency = String(req.body.currency || 'INR');
        if (!destination || !request) return res.status(400).json({ message: 'Destination and request are required.' });

        const response = await client.responses.create({
            model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
            input: [
                {
                    role: 'system',
                    content: [{ type: 'input_text', text: 'You are TripTailor, a practical travel planner. Give concise, destination-specific recommendations. Do not invent live availability, prices, opening hours, or bookings. Return valid JSON only with keys: summary (string), places (array of objects with name, category, why, estimatedCost), activities (array of strings), food (array of strings), itinerary (array of objects with day, title, stops array). Mention when details should be checked locally.' }],
                },
                {
                    role: 'user',
                    content: [{ type: 'input_text', text: JSON.stringify({ destination, dates, travelers, currency, request }) }],
                },
            ],
            text: { format: { type: 'json_object' } },
        });

        const result = JSON.parse(response.output_text || '{}');
        res.json({ result });
    } catch (error) {
        console.error('travel AI error', error);
        res.status(502).json({ message: 'Travel suggestions are temporarily unavailable.' });
    }
}
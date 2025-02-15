import fetch from 'node-fetch';
import { NextApiRequest, NextApiResponse } from 'next';

interface Query {
    url?: string;
}

interface ErrorResponse {
    error: string;
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<string | ErrorResponse>
) {
    const { url } = req.query as Query;

    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }

    try {
        const response = await fetch(url);
        const text = await response.text();
        res.status(200).send(text);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching data' });
    }
}
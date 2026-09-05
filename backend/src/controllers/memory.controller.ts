import type { Request, Response } from 'express';
import { db } from '../db/index.js';
import { memoryEntries } from '../db/schema.js';
import { applyMemory, learnFromObservation } from '../nlp/logic.js';

export const bulkLearn = async (req: Request, res: Response) => {
    try {
        const history = req.body;
        if (!Array.isArray(history)) return res.status(400).json({ error: "Expected array of interactions" });

        let count = 0;
        for (const row of history) {
            if (!row.llm || !row.user) continue;
            const result = await applyMemory(row.llm);
            await learnFromObservation(result.memoryAwareText, row.user);
            count++;
        }
        res.json({ status: "success", processedCount: count });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const learn = async (req: Request, res: Response) => {
    try {
        const { formatted_text, final_text } = req.body;
        if (!formatted_text || !final_text) return res.status(400).json({ error: "Missing formatted_text or final_text" });
        await learnFromObservation(formatted_text, final_text);
        res.json({ status: "success" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const infer = async (req: Request, res: Response) => {
    try {
        const { formatted_text } = req.body;
        const result = await applyMemory(formatted_text);
        res.json({
            memory_aware_text: result.memoryAwareText,
            chunks: result.chunks,
            logs: result.logs
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const getState = async (req: Request, res: Response) => {
    try {
        const state = await db.select().from(memoryEntries);
        res.json({ entries: state });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const reset = async (req: Request, res: Response) => {
    try {
        await db.delete(memoryEntries);
        res.json({ status: "success" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

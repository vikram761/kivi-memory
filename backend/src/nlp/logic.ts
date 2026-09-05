import { db } from '../db/index.js';
import { memoryEntries } from '../db/schema.js';
import { eq, and } from 'drizzle-orm';
import { diffArrays } from 'diff';
import { metaphone } from 'metaphone';
import fs from 'fs';
import path from 'path';

// Load static NLP data directly (no Python dependencies required)
const frequenciesPath = path.join(process.cwd(), 'data/frequencies.json');
const stopwordsPath = path.join(process.cwd(), 'data/stopwords.json');
const dictionaryPath = path.join(process.cwd(), 'data/dictionary.json');

const brownFreq: Record<string, number> = JSON.parse(fs.readFileSync(frequenciesPath, 'utf8'));
const stopwordsSet = new Set<string>(JSON.parse(fs.readFileSync(stopwordsPath, 'utf8')));
const standardDict = new Set<string>(JSON.parse(fs.readFileSync(dictionaryPath, 'utf8')));

// Mathematical constants
const INFERENCE_THRESHOLD = 0.005;
const REINFORCEMENT_THRESHOLD = 3;
const CONTEXT_RADIUS = 4;

function tokenize(text: string) {
    const tokens = text.split(/\b/);
    return tokens.map(w => ({
        word: w,
        isWord: /\w+/.test(w)
    })).filter(t => t.isWord);
}

function getPhoneticKey(word: string): string {
    return metaphone(word);
}

function getWeight(word: string): number {
    const w = word.toLowerCase();
    const docFreq = brownFreq[w] || 0;
    return 1.0 / (1.0 + docFreq);
}

function extractWindow(tokens: { word: string }[], centerIdx: number): string[] {
    const windowTokens = [];
    const start = Math.max(0, centerIdx - CONTEXT_RADIUS);
    const end = Math.min(tokens.length, centerIdx + CONTEXT_RADIUS + 1);

    for (let i = start; i < end; i++) {
        if (i !== centerIdx) {
            const w = tokens[i].word.toLowerCase();
            // Active filtering of stopwords prevents junk anchors and inflated scores
            if (!stopwordsSet.has(w)) {
                windowTokens.push(w);
            }
        }
    }
    return windowTokens;
}

export async function applyMemory(text: string) {
    const tokens = tokenize(text);
    const chunks = [];
    const logs = [];

    const entries = await db.select().from(memoryEntries);

    let lastEnd = 0;

    for (let idx = 0; idx < tokens.length; idx++) {
        const token = tokens[idx];
        const match = text.indexOf(token.word, lastEnd);
        
        if (match > lastEnd) {
            chunks.push({
                text: text.slice(lastEnd, match),
                is_modified: false,
                evaluated: false
            });
        }

        const origWord = token.word;
        const pkey = getPhoneticKey(origWord);
        const candidates = entries.filter(e => e.phoneticKey === pkey && e.observationCount >= REINFORCEMENT_THRESHOLD);

        if (candidates.length > 0) {
            let bestCandidate = null;
            let bestScore = -Infinity;

            for (const candidate of candidates) {
                const isAmbiguous = candidate.ambiguityRisk || candidates.length > 1;
                if (!isAmbiguous) {
                    bestCandidate = candidate;
                    bestScore = Infinity;
                    break;
                }

                const window = extractWindow(tokens, idx);
                let score = 0;
                
                const pos = candidate.positiveAnchors as Record<string, number>;
                const neg = candidate.negativeAnchors as Record<string, number>;

                for (const w of window) {
                    const wWeight = getWeight(w);
                    const pCount = pos[w] || 0;
                    const nCount = neg[w] || 0;
                    score += wWeight * (pCount - nCount);
                }

                if (score > bestScore) {
                    bestScore = score;
                    bestCandidate = candidate;
                }
            }

            if (bestCandidate && bestScore >= INFERENCE_THRESHOLD) {
                if (bestCandidate.canonicalTerm.toLowerCase() === origWord.toLowerCase()) {
                    chunks.push({
                        text: bestCandidate.canonicalTerm, // enforce canonical casing for proper nouns
                        is_modified: origWord !== bestCandidate.canonicalTerm,
                        evaluated: true,
                        score: bestScore === Infinity ? 'Infinity' : bestScore.toFixed(5),
                        reason: bestScore === Infinity ? "Unambiguous Identity Match" : "Identity Context Supported"
                    });
                    logs.push(`Confirmed identity for '${origWord}' (Score: ${bestScore === Infinity ? 'Infinity' : bestScore.toFixed(4)})`);
                } else {
                    chunks.push({
                        text: bestCandidate.canonicalTerm,
                        is_modified: true,
                        evaluated: true,
                        original: token.word,
                        score: bestScore === Infinity ? 'Infinity' : bestScore.toFixed(5),
                        reason: bestScore === Infinity ? "Unambiguous Match" : "Context Supported"
                    });
                    logs.push(`Replaced '${origWord}' -> '${bestCandidate.canonicalTerm}' (Score: ${bestScore === Infinity ? 'Infinity' : bestScore.toFixed(4)})`);
                }
                lastEnd = match + token.word.length;
                continue;
            } else {
                chunks.push({
                    text: token.word,
                    is_modified: false,
                    evaluated: true,
                    score: bestScore === Infinity ? 'Infinity' : bestScore.toFixed(5),
                    reason: "Context score below threshold (0.005)"
                });
                logs.push(`Rejected substitution for '${origWord}'. Best score: ${bestScore.toFixed(4)} < Threshold ${INFERENCE_THRESHOLD}`);
                lastEnd = match + token.word.length;
                continue;
            }
        }

        chunks.push({
            text: token.word,
            is_modified: false,
            evaluated: false
        });
        lastEnd = match + token.word.length;
    }

    if (lastEnd < text.length) {
        chunks.push({
            text: text.slice(lastEnd),
            is_modified: false,
            evaluated: false
        });
    }

    const result = chunks.map(c => c.text).join("");
    return { memoryAwareText: result, chunks, logs };
}

export async function learnFromObservation(formattedText: string, finalText: string) {
    const formattedTokens = tokenize(formattedText);
    const finalTokens = tokenize(finalText);

    const formattedWords = formattedTokens.map(t => t.word);
    const finalWords = finalTokens.map(t => t.word);

    const changes = diffArrays(
        formattedWords.map(w => w.toLowerCase()), 
        finalWords.map(w => w.toLowerCase())
    );

    const corrections = [];
    let fIdx = 0;
    let fnalIdx = 0;

    for (let i = 0; i < changes.length; i++) {
        const change = changes[i];
        if (change.removed && i + 1 < changes.length && changes[i+1].added) {
            const addedChange = changes[i+1];
            if (change.count === 1 && addedChange.count === 1) {
                corrections.push({
                    origIdx: fIdx,
                    finalIdx: fnalIdx,
                    origWord: formattedWords[fIdx],
                    newWord: finalWords[fnalIdx]
                });
            }
            fIdx += change.count || 0;
            fnalIdx += addedChange.count || 0;
            i++; 
        } else if (change.removed) {
            fIdx += change.count || 0;
        } else if (change.added) {
            fnalIdx += change.count || 0;
        } else {
            fIdx += change.count || 0;
            fnalIdx += change.count || 0;
        }
    }

    const changedOrigIndices = new Set(corrections.map(c => c.origIdx));
    const changedFinalIndices = new Set(corrections.map(c => c.finalIdx));

    for (const { origIdx, origWord, newWord } of corrections) {
        const reverts = await db.select().from(memoryEntries).where(eq(memoryEntries.canonicalTerm, origWord));
        
        let pkey = getPhoneticKey(origWord);
        let forceAmbiguity = false;

        if (reverts.length > 0) {
            const entry = reverts[0];
            pkey = entry.phoneticKey; 
            
            const negWindow = extractWindow(formattedTokens, origIdx);
            const negAnchors = { ...(entry.negativeAnchors as Record<string, number>) };
            for (const w of negWindow) {
                negAnchors[w] = (negAnchors[w] || 0) + 2; 
            }

            await db.update(memoryEntries).set({
                negativeAnchors: negAnchors,
                ambiguityRisk: true,
                updatedAt: new Date()
            }).where(eq(memoryEntries.id, entry.id));
            
            forceAmbiguity = true;
        }

        const canonical = newWord;

        let entryRes = await db.select().from(memoryEntries).where(
            and(
                eq(memoryEntries.phoneticKey, pkey),
                eq(memoryEntries.canonicalTerm, canonical)
            )
        );

        if (entryRes.length === 0) {
            const inserted = await db.insert(memoryEntries).values({
                canonicalTerm: canonical,
                phoneticKey: pkey,
                ambiguityRisk: forceAmbiguity || standardDict.has(origWord.toLowerCase()),
                positiveAnchors: {},
                negativeAnchors: {},
            }).returning();
            entryRes = inserted;
        }

        const entry = entryRes[0];
        let posAnchors = { ...(entry.positiveAnchors as Record<string, number>) };
        let negAnchors = { ...(entry.negativeAnchors as Record<string, number>) };
        
        let currentAmbiguityRisk = entry.ambiguityRisk || forceAmbiguity;

        const posWindow = extractWindow(formattedTokens, origIdx);
        for (const w of posWindow) {
            posAnchors[w] = (posAnchors[w] || 0) + 1;
        }

        if (currentAmbiguityRisk) {
            for (let siblingIdx = 0; siblingIdx < formattedTokens.length; siblingIdx++) {
                if (siblingIdx === origIdx || changedOrigIndices.has(siblingIdx)) continue;
                
                const siblingWord = formattedTokens[siblingIdx].word.toLowerCase();
                if (getPhoneticKey(siblingWord) === pkey) {
                    const negWindow = extractWindow(formattedTokens, siblingIdx);
                    for (const w of negWindow) {
                        negAnchors[w] = (negAnchors[w] || 0) + 1;
                    }
                }
            }
        }

        const newCount = entry.observationCount + 1;

        await db.update(memoryEntries).set({
            observationCount: newCount,
            positiveAnchors: posAnchors,
            negativeAnchors: negAnchors,
            ambiguityRisk: currentAmbiguityRisk,
            updatedAt: new Date()
        }).where(eq(memoryEntries.id, entry.id));
    }

}

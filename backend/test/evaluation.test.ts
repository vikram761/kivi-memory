import { expect, test, describe, beforeEach, afterAll } from "bun:test";
import request from "supertest";
import { app } from "../src/index";
import { db } from "../src/db";
import { memoryEntries } from "../src/db/schema";
import { eq, and } from "drizzle-orm";

describe("Phonetic Memory Evaluation Suite", () => {
  
  beforeEach(async () => {
    // Wipe DB clean before EVERY test to ensure complete independence
    await db.delete(memoryEntries);
  });

  afterAll(async () => {
    // Leave DB clean
    await db.delete(memoryEntries);
  });

  describe("1. Unambiguous Proper Nouns", () => {
    test("Should learn and apply a proper noun without context requirements", async () => {
      // LLM formats 'aditya' -> 'Aditya', but user wants 'Aaditya'
      await request(app).post("/api/memory/bulk-learn").send([
        { llm: "Call Aditya.", user: "Call Aaditya." },
        { llm: "Ask Aditya.", user: "Ask Aaditya." },
        { llm: "Tell Aditya.", user: "Tell Aaditya." },
      ]);

      // Infer a completely new formatted sentence
      const res = await request(app).post("/api/memory/infer").send({
        formatted_text: "Aditya should review the code."
      });

      expect(res.body.memory_aware_text).toBe("Aaditya should review the code.");
    });
  });

  describe("2. Ambiguous Terms (Dictionary Collision)", () => {
    beforeEach(async () => {
      // LLM formats 'kiwi' -> 'Kiwi' (capitalized as product name)
      // User corrects to 'Kivi' — positive anchors: 'product', 'sarvam', 'service'
      await request(app).post("/api/memory/bulk-learn").send([
        { llm: "The Kiwi product.", user: "The Kivi product." },
        { llm: "Sarvam Kiwi.", user: "Sarvam Kivi." },
        { llm: "Kiwi service.", user: "Kivi service." },
      ]);
    });

    test("Positive Context: Should apply correction when positive anchors match", async () => {
      const res = await request(app).post("/api/memory/infer").send({
        formatted_text: "The new Sarvam Kiwi product is great."
      });
      expect(res.body.memory_aware_text).toBe("The new Sarvam Kivi product is great.");
    });

    test("Negative Context: Should deliberately do nothing when no positive anchors exist", async () => {
      // LLM keeps 'kiwi' lowercase here — it recognizes the fruit, not a product
      const res = await request(app).post("/api/memory/infer").send({
        formatted_text: "I ate a kiwi for breakfast."
      });
      // Score will be 0 — none of the window words (ate, breakfast) are positive anchors
      expect(res.body.memory_aware_text).toBe("I ate a kiwi for breakfast.");
    });

    test("Weak Signal Rejection: Should reject substitutions based on generic words", async () => {
      // The word 'good' is very common, so docFreq is high, making its weight < INFERENCE_THRESHOLD (0.005)
      // Teach 'good' as a positive anchor
      await request(app).post("/api/memory/bulk-learn").send([
        { llm: "That Kiwi was good.", user: "That Kivi was good." }
      ]);

      const res = await request(app).post("/api/memory/infer").send({
        formatted_text: "The Kiwi is good."
      });
      
      // Because 'good' is a weak signal (IDF weight ≈ 0.001 < 0.005), it should be rejected!
      expect(res.body.memory_aware_text).toBe("The Kiwi is good.");
      expect(res.body.logs.some((l: string) => l.includes("Rejected substitution") && l.includes("good") === false)).toBe(true);
    });
  });

  describe("3. One-to-Many Collision Resolution", () => {
    beforeEach(async () => {
      // Teach BOTH 'Kiwi' -> 'Kivi' AND 'Kiwi' -> 'Kavi' (same phonetic key KW)
      await request(app).post("/api/memory/bulk-learn").send([
        // Candidate 1: Kivi (Product)
        { llm: "The Kiwi product.", user: "The Kivi product." },
        { llm: "Sarvam Kiwi.", user: "Sarvam Kivi." },
        { llm: "Kiwi service.", user: "Kivi service." },
        // Candidate 2: Kavi (Poet)
        { llm: "Kiwi writes a poem.", user: "Kavi writes a poem." },
        { llm: "Kiwi is a poet.", user: "Kavi is a poet." },
        { llm: "Poet Kiwi.", user: "Poet Kavi." },
      ]);
    });

    test("Should pick Kavi based on poetry context", async () => {
      const res = await request(app).post("/api/memory/infer").send({
        formatted_text: "That Kiwi writes very well."
      });
      expect(res.body.memory_aware_text).toBe("That Kavi writes very well.");
    });

    test("Should pick Kivi based on product context", async () => {
      const res = await request(app).post("/api/memory/infer").send({
        formatted_text: "How is the Sarvam Kiwi doing?"
      });
      expect(res.body.memory_aware_text).toBe("How is the Sarvam Kivi doing?");
    });
  });

  describe("4. Multiple Interventions in One Sentence", () => {
    test("Should correctly replace both Aditya and Kiwi", async () => {
      // Teach both concepts from scratch (tests are independent)
      await request(app).post("/api/memory/bulk-learn").send([
        { llm: "Call Aditya.", user: "Call Aaditya." },
        { llm: "Ask Aditya.", user: "Ask Aaditya." },
        { llm: "Tell Aditya.", user: "Tell Aaditya." },
        { llm: "The Kiwi product.", user: "The Kivi product." },
        { llm: "Sarvam Kiwi.", user: "Sarvam Kivi." },
        { llm: "Kiwi service.", user: "Kivi service." },
      ]);

      const res = await request(app).post("/api/memory/infer").send({
        formatted_text: "Tell Aditya about the Kiwi product."
      });
      // Aditya is active (no ambiguity risk). Kiwi is active (product anchor matches).
      expect(res.body.memory_aware_text).toBe("Tell Aaditya about the Kivi product.");
    });
  });

  describe("5. Revert Edgecase (Simulated Bulk Training)", () => {
    test("Should decay confidence and add negative anchors on user revert", async () => {
      // Teach it first so it reaches observation count = 4
      await request(app).post("/api/memory/bulk-learn").send([
        { llm: "The Kiwi product.", user: "The Kivi product." },
        { llm: "Sarvam Kiwi.", user: "Sarvam Kivi." },
        { llm: "Kiwi service.", user: "Kivi service." },
        { llm: "Good Kiwi.", user: "Good Kivi." },
      ]);

      // User reverts: the system replaced Kiwi->Kivi, but user keeps it as 'Kiwi'
      await request(app).post("/api/memory/bulk-learn").send([
        { llm: "Kiwi product is ugly.", user: "Kiwi product is ugly." }
      ]);

      // Verify the memory entry for KW -> Kivi was updated
      const entries = await db.select().from(memoryEntries).where(
          and(eq(memoryEntries.phoneticKey, "KW"), eq(memoryEntries.canonicalTerm, "Kivi"))
      );
      
      expect(entries.length).toBe(1);
      const kiviEntry = entries[0];
      
      // Observation count should have been halved (was 4, halved to 2)
      expect(kiviEntry.observationCount).toBe(2);
      
      // 'ugly' should now be a negative anchor
      const negAnchors = kiviEntry.negativeAnchors as Record<string, number>;
      expect(negAnchors["ugly"]).toBe(1);
    });
  });

});

import { pgTable, serial, text, integer, boolean, jsonb, real } from 'drizzle-orm/pg-core';

export const memoryEntries = pgTable('memory_entries', {
  id: serial('id').primaryKey(),
  canonicalTerm: text('canonical_term').notNull(),
  phoneticKey: text('phonetic_key').notNull(),
  confidence: real('confidence').default(0.0).notNull(),
  observationCount: integer('observation_count').default(0).notNull(),
  ambiguityRisk: boolean('ambiguity_risk').default(false).notNull(),
  positiveAnchors: jsonb('positive_anchors').$type<Record<string, number>>().default({}).notNull(),
  negativeAnchors: jsonb('negative_anchors').$type<Record<string, number>>().default({}).notNull(),
  status: text('status').default('candidate').notNull(), // 'candidate', 'active', 'retired'
});

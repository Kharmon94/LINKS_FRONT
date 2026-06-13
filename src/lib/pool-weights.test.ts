import { describe, expect, it } from 'vitest';
import {
  evenSplitWeights,
  maxForEntry,
  MIN_WEIGHT,
  normalizeWeightsTo100,
  rebalanceWeights,
} from '@/lib/pool-weights';

function sum(weights: number[]): number {
  return weights.reduce((a, b) => a + b, 0);
}

describe('evenSplitWeights', () => {
  it('returns integers summing to 100', () => {
    expect(sum(evenSplitWeights(6))).toBe(100);
    expect(evenSplitWeights(6)).toEqual([17, 17, 17, 17, 16, 16]);
  });

  it('handles edge counts', () => {
    expect(evenSplitWeights(1)).toEqual([100]);
    expect(sum(evenSplitWeights(3))).toBe(100);
    expect(sum(evenSplitWeights(100))).toBe(100);
  });
});

describe('maxForEntry', () => {
  it('reserves minimum weight for other entries', () => {
    expect(maxForEntry(6)).toBe(100 - 5 * MIN_WEIGHT);
    expect(maxForEntry(2)).toBe(99);
  });
});

describe('normalizeWeightsTo100', () => {
  it('normalizes legacy equal weights to sum 100', () => {
    const result = normalizeWeightsTo100([1, 1, 1, 1, 1, 1]);
    expect(sum(result)).toBe(100);
    expect(result.every((w) => w >= MIN_WEIGHT)).toBe(true);
  });

  it('leaves weights unchanged when already summing to 100', () => {
    expect(normalizeWeightsTo100([50, 30, 20])).toEqual([50, 30, 20]);
  });
});

describe('rebalanceWeights', () => {
  it('redistributes when one slider moves up', () => {
    const start = [20, 20, 20, 20, 20];
    const result = rebalanceWeights(start, 0, 30);
    expect(result[0]).toBe(30);
    expect(sum(result)).toBe(100);
    expect(result.slice(1).every((w) => w < 20)).toBe(true);
  });

  it('keeps sum at 100 after rebalance', () => {
    const start = [17, 17, 17, 17, 16, 16];
    const result = rebalanceWeights(start, 2, 40);
    expect(sum(result)).toBe(100);
  });

  it('enforces minimum 1% on all entries', () => {
    const start = [94, 2, 2, 2];
    const result = rebalanceWeights(start, 0, 96);
    expect(result.every((w) => w >= MIN_WEIGHT)).toBe(true);
    expect(sum(result)).toBe(100);
  });

  it('clamps to maxForEntry', () => {
    const start = [50, 25, 25];
    const result = rebalanceWeights(start, 0, 100);
    expect(result[0]).toBe(maxForEntry(3));
    expect(sum(result)).toBe(100);
  });
});

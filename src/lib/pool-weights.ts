export const MIN_WEIGHT = 1;

export function maxForEntry(count: number): number {
  return 100 - (count - 1) * MIN_WEIGHT;
}

export function evenSplitWeights(count: number): number[] {
  if (count <= 0) return [];
  const base = Math.floor(100 / count);
  const remainder = 100 % count;
  return Array.from({ length: count }, (_, i) => base + (i < remainder ? 1 : 0));
}

function roundToSum(ideals: number[], targetSum: number): number[] {
  const floored = ideals.map(Math.floor);
  let remainder = targetSum - floored.reduce((a, b) => a + b, 0);

  const byFraction = ideals
    .map((v, i) => ({ i, frac: v - Math.floor(v) }))
    .sort((a, b) => b.frac - a.frac);

  const result = [...floored];
  for (let r = 0; r < remainder; r++) {
    result[byFraction[r % byFraction.length].i]++;
  }
  return result;
}

function distributeToSum(relativeWeights: number[], targetSum: number): number[] {
  const n = relativeWeights.length;
  if (n === 0) return [];

  const minTotal = n * MIN_WEIGHT;
  const extra = targetSum - minTotal;

  const relSum = relativeWeights.reduce((a, b) => a + b, 0);

  let ideals: number[];
  if (relSum === 0) {
    const splits = evenSplitWeights(n);
    ideals = splits.map((s) => MIN_WEIGHT + (s / 100) * extra);
  } else {
    ideals = relativeWeights.map((w) => MIN_WEIGHT + (w / relSum) * extra);
  }

  return roundToSum(ideals, targetSum);
}

export function normalizeWeightsTo100(weights: number[]): number[] {
  if (weights.length === 0) return [];
  const sum = weights.reduce((a, b) => a + b, 0);
  if (sum === 100) return [...weights];
  return distributeToSum(weights, 100);
}

export function rebalanceWeights(
  weights: number[],
  changedIndex: number,
  newValue: number,
): number[] {
  const n = weights.length;
  if (n === 0) return [];

  const maxVal = maxForEntry(n);
  const clamped = Math.max(MIN_WEIGHT, Math.min(maxVal, Math.round(newValue)));

  const otherIndices = weights.map((_, i) => i).filter((i) => i !== changedIndex);
  const otherWeights = otherIndices.map((i) => weights[i]);
  const remaining = 100 - clamped;

  const newOthers = distributeToSum(otherWeights, remaining);

  const result = [...weights];
  result[changedIndex] = clamped;
  otherIndices.forEach((idx, j) => {
    result[idx] = newOthers[j];
  });

  return result;
}

export function cosineSimilarity(
  vectorA: Record<string, number>,
  vectorB: Record<string, number>
): number {
  const keySet: Record<string, boolean> = {};
  Object.keys(vectorA).forEach(k => { keySet[k] = true; });
  Object.keys(vectorB).forEach(k => { keySet[k] = true; });
  const allKeys = Object.keys(keySet);
  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (const key of allKeys) {
    const a = vectorA[key] || 0;
    const b = vectorB[key] || 0;
    dotProduct += a * b;
    magnitudeA += a * a;
    magnitudeB += b * b;
  }

  magnitudeA = Math.sqrt(magnitudeA);
  magnitudeB = Math.sqrt(magnitudeB);

  if (magnitudeA === 0 || magnitudeB === 0) return 0;
  return dotProduct / (magnitudeA * magnitudeB);
}

export function computeCoverageByCluster(
  programVector: Record<string, number>,
  skills: { id: string; cluster: string }[]
): Record<string, number> {
  const clusterScores: Record<string, { total: number; count: number }> = {};

  for (const skill of skills) {
    if (!clusterScores[skill.cluster]) {
      clusterScores[skill.cluster] = { total: 0, count: 0 };
    }
    clusterScores[skill.cluster].total += programVector[skill.id] || 0;
    clusterScores[skill.cluster].count += 1;
  }

  const result: Record<string, number> = {};
  for (const [cluster, data] of Object.entries(clusterScores)) {
    result[cluster] = data.count > 0
      ? Math.round((data.total / data.count) * 100)
      : 0;
  }

  return result;
}

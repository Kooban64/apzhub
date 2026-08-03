/**
 * Presentation-only helpers. Do not encode quality business rules.
 */

export function clampDisplayPercent(value: number): number {
  if (Number.isNaN(value)) {
    return 0;
  }
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function summarizeSeries(
  name: string,
  points: readonly { readonly y: number }[],
): string {
  if (points.length === 0) {
    return `${name}: no data`;
  }
  const last = points[points.length - 1]!.y;
  const first = points[0]!.y;
  const direction = last > first ? "up" : last < first ? "down" : "flat";
  return `${name}: ${points.length} points, latest ${last}, trend ${direction}`;
}

export function downsamplePoints<T>(
  points: readonly T[],
  maxPoints: number,
): readonly T[] {
  if (points.length <= maxPoints || maxPoints < 2) {
    return points;
  }
  const step = (points.length - 1) / (maxPoints - 1);
  const result: T[] = [];
  for (let i = 0; i < maxPoints; i += 1) {
    result.push(points[Math.round(i * step)]!);
  }
  return result;
}

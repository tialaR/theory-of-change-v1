export const EDITORIAL_PREVIEW_MOTION = {
  ease: [0.22, 1, 0.36, 1] as const,

  frameDelay: 0.28,

  connection: {
    duration: 0.74,
    settleDuration: 0.18,
    groupGap: 0.86,
    itemStagger: 0.065,
  },

  surface: {
    duration: 0.28,
    offsetY: 3,
  },

  opacity: {
    baseConnection: 0.22,
    activeConnection: 0.72,
    arrow: 0.56,
  },
} as const;

export function getEditorialConnectionDelay(
  groupIndex: number,
  itemIndex: number,
): number {
  return (
    EDITORIAL_PREVIEW_MOTION.frameDelay +
    groupIndex * EDITORIAL_PREVIEW_MOTION.connection.groupGap +
    itemIndex * EDITORIAL_PREVIEW_MOTION.connection.itemStagger
  );
}

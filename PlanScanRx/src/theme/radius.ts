// Neumorphic radii — generous rounding, minimum 12pt.
// Anti-pattern: never use 4pt or 8pt — breaks the soft material illusion.

export const Radius = {
  inner:     12,   // Badges, chips, small inner elements
  base:      16,   // Buttons, inputs, medium components
  container: 32,   // Cards, modals, large panels
  full:      9999, // Pills, avatars, toggle tracks
} as const;

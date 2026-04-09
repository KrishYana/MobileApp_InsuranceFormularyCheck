// Neumorphic animations — spring-based physics, not linear/ease.
// Every interaction should feel like pressing a real button or touching a soft surface.

export const Animation = {
  // Spring configs for react-native-reanimated
  spring: {
    button:  { damping: 12, stiffness: 200 },   // ~300ms, bouncy press
    card:    { damping: 15, stiffness: 150 },    // ~400ms, subtle press
    modal:   { damping: 20, stiffness: 120 },    // ~500ms, smooth slide
  },

  // Duration fallbacks (for non-spring animations)
  duration: {
    instant: 100,
    fast:    200,
    normal:  300,
    slow:    500,
  },

  // Press scale values — must be perceptible for the tactile metaphor
  pressScale: {
    button: 0.95,
    card:   0.98,
    chip:   0.93,
  },

  // Shimmer (skeleton loading)
  shimmer: {
    duration: 1200,
    delay:    200,
  },

  // Floating (ambient decoration)
  floating: {
    duration: 3000,
    offset:   10,
  },
} as const;

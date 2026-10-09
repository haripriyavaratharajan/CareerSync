// AI provider abstraction. Core features never call this; swap in any provider later.
export const ai = { enabled: false, async suggest() { return []; } };

// Single source of truth for the JWT signing secret.
//
// There is deliberately no fallback value: a default secret committed to a
// public repo lets anyone forge login tokens for any self-hosted instance.

const MIN_LENGTH = 32;

// Placeholder values that have shipped in this repo's examples/docs.
const KNOWN_PLACEHOLDERS = new Set([
  'change-me-to-a-long-random-string',
  'your-super-secret-jwt-key-change-in-production',
  'rebox-default-secret-key-2024-change-in-production',
]);

const problemWith = (secret) => {
  if (!secret || secret.trim() === '') return 'is not set';
  if (KNOWN_PLACEHOLDERS.has(secret)) return 'is still the example placeholder';
  if (process.env.NODE_ENV === 'production' && secret.length < MIN_LENGTH) {
    return `must be at least ${MIN_LENGTH} characters in production`;
  }
  return null;
};

// Call once at startup so a misconfigured server refuses to boot instead of
// failing on the first login.
const assertJwtSecret = () => {
  const problem = problemWith(process.env.JWT_SECRET);
  if (problem) {
    throw new Error(
      `JWT_SECRET ${problem}. Generate one with: openssl rand -hex 32`
    );
  }
};

const getJwtSecret = () => {
  assertJwtSecret();
  return process.env.JWT_SECRET;
};

module.exports = { assertJwtSecret, getJwtSecret };

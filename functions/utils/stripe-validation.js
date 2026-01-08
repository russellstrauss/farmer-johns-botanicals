/**
 * Stripe Key Validation Utilities
 * Helper functions to validate and detect Stripe key modes
 */

/**
 * Detects if a Stripe key is a test key or live key
 * @param {string} key - Stripe API key (secret or publishable)
 * @returns {'test'|'live'|'unknown'} - The mode of the key
 */
export function detectStripeKeyMode(key) {
  if (!key || typeof key !== 'string') {
    return 'unknown'
  }
  
  // Test keys start with sk_test_ or pk_test_
  if (key.startsWith('sk_test_') || key.startsWith('pk_test_')) {
    return 'test'
  }
  
  // Live keys start with sk_live_ or pk_live_
  if (key.startsWith('sk_live_') || key.startsWith('pk_live_')) {
    return 'live'
  }
  
  return 'unknown'
}

/**
 * Validates that secret and publishable keys are in the same mode
 * @param {string} secretKey - Stripe secret key
 * @param {string} publishableKey - Stripe publishable key
 * @returns {{valid: boolean, secretMode: string, publishableMode: string, error?: string}}
 */
export function validateStripeKeyPair(secretKey, publishableKey) {
  const secretMode = detectStripeKeyMode(secretKey)
  const publishableMode = detectStripeKeyMode(publishableKey)
  
  if (secretMode === 'unknown' || publishableMode === 'unknown') {
    return {
      valid: false,
      secretMode,
      publishableMode,
      error: 'Unable to detect key mode. Ensure keys start with sk_test_/sk_live_ (secret) or pk_test_/pk_live_ (publishable)'
    }
  }
  
  if (secretMode !== publishableMode) {
    return {
      valid: false,
      secretMode,
      publishableMode,
      error: `Key mode mismatch: Secret key is ${secretMode} but publishable key is ${publishableMode}. Both keys must be in the same mode.`
    }
  }
  
  return {
    valid: true,
    secretMode,
    publishableMode
  }
}

/**
 * Gets environment-specific key configuration recommendations
 * @param {string} environment - 'development' or 'production'
 * @returns {object} Configuration recommendations
 */
export function getKeyConfigurationGuide(environment) {
  const isProduction = environment === 'production'
  
  return {
    environment,
    recommendedMode: isProduction ? 'live' : 'test',
    secretKeyPrefix: isProduction ? 'sk_live_' : 'sk_test_',
    publishableKeyPrefix: isProduction ? 'pk_live_' : 'pk_test_',
    cardTesting: isProduction 
      ? 'Use real credit cards. Test cards (e.g., 4242 4242 4242 4242) will be rejected.' 
      : 'Use Stripe test cards (e.g., 4242 4242 4242 4242)',
    notes: isProduction
      ? 'Live keys process real payments. Ensure your keys are from the Stripe Dashboard → Developers → API keys (not test mode).'
      : 'Test keys are safe for development. No real charges will be made.'
  }
}



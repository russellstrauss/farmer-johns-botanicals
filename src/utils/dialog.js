/**
 * Global dialog utilities
 * Import this file to replace browser alert/confirm with custom dialogs
 * 
 * Note: Since our custom dialogs return Promises, they can't be direct
 * replacements for synchronous browser alerts. Use the useDialog composable
 * directly in your Vue components for best results.
 */

import { alert, confirm } from '../composables/useDialog'

// Store original browser functions
const originalAlert = window.alert
const originalConfirm = window.confirm

/**
 * Replace browser alert and confirm with custom dialogs
 * 
 * WARNING: Browser alert/confirm are synchronous, but our custom dialogs
 * are async (return Promises). This replacement will work for simple cases
 * but may cause issues if code expects synchronous behavior.
 * 
 * For best results, use the useDialog composable directly in Vue components.
 */
export const replaceBrowserDialogs = () => {
	window.alert = (message) => {
		// Fire and forget - can't return synchronously
		alert(message, 'Alert').catch(() => {})
		return undefined
	}

	window.confirm = (message) => {
		// This won't work as expected since confirm needs to return synchronously
		// but our dialog is async. We'll show the dialog but return false immediately.
		// For proper async handling, use the useDialog composable directly.
		confirm(message, 'Confirm').catch(() => {})
		return false // Default to false since we can't wait for async response
	}
}

/**
 * Restore original browser alert and confirm
 */
export const restoreBrowserDialogs = () => {
	window.alert = originalAlert
	window.confirm = originalConfirm
}


/**
 * Example usage of the custom dialog system
 * 
 * This file demonstrates how to use the custom dialog in your Vue components.
 * Delete this file if you don't need the examples.
 */

import { useDialog } from './useDialog'

// Example 1: Simple alert (like browser alert)
export const exampleAlert = async () => {
	const { alert } = useDialog()
	
	// Simple alert
	await alert('This is a simple alert message')
	
	// Alert with custom title
	await alert('Product saved successfully!', 'Success')
}

// Example 2: Confirm dialog (like browser confirm)
export const exampleConfirm = async () => {
	const { confirm } = useDialog()
	
	const result = await confirm('Are you sure you want to delete this item?', 'Confirm Delete')
	
	if (result) {
		console.log('User confirmed')
		// Proceed with deletion
	} else {
		console.log('User cancelled')
		// Cancel deletion
	}
}

// Example 3: Custom dialog with full options
export const exampleCustomDialog = async () => {
	const { dialog } = useDialog()
	
	const result = await dialog({
		title: 'Custom Dialog',
		message: 'This is a custom dialog with all options',
		confirmText: 'Yes, proceed',
		cancelText: 'No, cancel',
		showCancel: true,
		closeOnOverlay: true
	})
	
	if (result) {
		console.log('User clicked confirm')
	} else {
		console.log('User clicked cancel or closed dialog')
	}
}

// Example 4: Using in a Vue component
/*
<script>
import { useDialog } from '../composables/useDialog'

export default {
	setup() {
		const { alert, confirm } = useDialog()
		
		const handleSave = async () => {
			try {
				// Save operation
				await saveData()
				await alert('Data saved successfully!', 'Success')
			} catch (error) {
				await alert(`Error: ${error.message}`, 'Error')
			}
		}
		
		const handleDelete = async () => {
			const confirmed = await confirm('Are you sure?', 'Confirm Delete')
			if (confirmed) {
				// Proceed with delete
				await deleteItem()
			}
		}
		
		return {
			handleSave,
			handleDelete
		}
	}
}
</script>
*/


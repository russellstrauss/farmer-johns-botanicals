import { ref } from 'vue'

// Global dialog state
const dialogState = ref({
	isVisible: false,
	title: '',
	message: '',
	confirmText: 'OK',
	cancelText: 'Cancel',
	showCancel: false,
	closeOnOverlay: false,
	resolve: null,
	reject: null
})

const showDialog = (options = {}) => {
	return new Promise((resolve, reject) => {
		// Set dialog state
		dialogState.value = {
			isVisible: true,
			title: options.title || '',
			message: options.message || '',
			confirmText: options.confirmText || 'OK',
			cancelText: options.cancelText || 'Cancel',
			showCancel: options.showCancel || false,
			closeOnOverlay: options.closeOnOverlay || false,
			resolve,
			reject
		}
	})
}

const closeDialog = () => {
	dialogState.value.isVisible = false
	dialogState.value.resolve = null
	dialogState.value.reject = null
}

const handleConfirm = () => {
	if (dialogState.value.resolve) {
		dialogState.value.resolve(true)
	}
	closeDialog()
}

const handleCancel = () => {
	if (dialogState.value.reject) {
		dialogState.value.reject(false)
	}
	closeDialog()
}

// Simple alert (like browser alert)
export const alert = (message, title = 'Alert') => {
	return showDialog({
		message,
		title,
		confirmText: 'OK',
		showCancel: false
	})
}

// Confirm dialog (like browser confirm)
export const confirm = (message, title = 'Confirm') => {
	return showDialog({
		message,
		title,
		confirmText: 'OK',
		cancelText: 'Cancel',
		showCancel: true
	})
}

// Custom dialog with full options
export const dialog = (options) => {
	return showDialog(options)
}

export function useDialog() {
	return {
		alert,
		confirm,
		dialog,
		closeDialog,
		dialogState,
		handleConfirm,
		handleCancel
	}
}


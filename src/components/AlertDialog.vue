<template>
	<Teleport to="body">
		<Transition name="dialog">
			<div v-if="dialogState.isVisible" class="dialog-overlay" @click.self="handleOverlayClick">
				<div class="dialog-container">
					<div class="dialog-content">
						<h3 v-if="dialogState.title" class="dialog-title">{{ dialogState.title }}</h3>
						<div class="dialog-message">{{ dialogState.message }}</div>
						<div class="dialog-actions">
							<button class="dialog-button dialog-button-primary" @click="handleConfirm">
								{{ dialogState.confirmText }}
							</button>
							<button v-if="dialogState.showCancel" class="dialog-button dialog-button-secondary" @click="handleCancel">
								{{ dialogState.cancelText }}
							</button>
						</div>
					</div>
				</div>
			</div>
		</Transition>
	</Teleport>
</template>

<script>
import { watch } from 'vue'
import { useDialog } from '../composables/useDialog'

export default {
	name: 'AlertDialog',
	setup() {
		const { dialogState, handleConfirm: confirmHandler, handleCancel: cancelHandler } = useDialog()

		watch(() => dialogState.value.isVisible, (newValue) => {
			if (newValue) {
				// Prevent body scroll when dialog is open
				document.body.style.overflow = 'hidden'
			} else {
				document.body.style.overflow = ''
			}
		})

		const handleOverlayClick = () => {
			if (dialogState.value.closeOnOverlay) {
				cancelHandler()
			}
		}

		return {
			dialogState,
			handleConfirm: confirmHandler,
			handleCancel: cancelHandler,
			handleOverlayClick
		}
	}
}
</script>

<style scoped lang="scss">
@import '../assets/sass/_vars.scss';
@import '../assets/sass/_mixins.scss';

.dialog-overlay {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(0, 0, 0, 0.5);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 10000;
	padding: 20px;
	backdrop-filter: blur(2px);
}

.dialog-container {
	background-color: var(--bg-primary);
	border-radius: 8px;
	box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
	max-width: 400px;
	width: 100%;
	max-height: 90vh;
	overflow: auto;
	border: 1px solid var(--border-color);
}

.dialog-content {
	padding: 24px;
}

.dialog-title {
	@include Montserrat;
	font-size: 1.25rem;
	margin: 0 0 16px 0;
	color: var(--text-primary);
	text-transform: uppercase;
}

.dialog-message {
	font-size: $font-size-body;
	color: var(--text-primary);
	line-height: 1.6;
	margin-bottom: 24px;
	word-wrap: break-word;
}

.dialog-actions {
	display: flex;
	gap: 12px;
	justify-content: flex-end;
	flex-wrap: wrap;
}

.dialog-button {
	@include black-button;
	display: inline-block;

	&:hover {
		opacity: 0.9;
		transform: translateY(-1px);
	}

	&:active {
		transform: translateY(0);
	}
}

// Transition animations
.dialog-enter-active,
.dialog-leave-active {
	transition: opacity 0.3s ease;
}

.dialog-enter-active .dialog-container,
.dialog-leave-active .dialog-container {
	transition: transform 0.3s ease, opacity 0.3s ease;
}

.dialog-enter-from,
.dialog-leave-to {
	opacity: 0;

	.dialog-container {
		transform: scale(0.9) translateY(-20px);
		opacity: 0;
	}
}

.dialog-enter-to,
.dialog-leave-from {
	opacity: 1;

	.dialog-container {
		transform: scale(1) translateY(0);
		opacity: 1;
	}
}

@include mobile-only {
	.dialog-container {
		max-width: 100%;
		margin: 0;
	}

	.dialog-content {
		padding: 20px;
	}

	.dialog-actions {
		flex-direction: column;

		.dialog-button {
			width: 100%;
		}
	}
}
</style>


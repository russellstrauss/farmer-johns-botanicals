<template>
	<div class="content-area primary orders-area">
		<main class="site-main main" role="main">
			<div class="orders-header">
				<h1>Order Management</h1>
				<button @click="refreshOrders" class="button" :disabled="loading">
					{{ loading ? 'Loading...' : 'Refresh' }}
				</button>
			</div>

			<div v-if="error" class="error-message">
				{{ error }}
			</div>

			<div v-if="loading && orders.length === 0" class="loading">
				Loading orders...
			</div>

			<div v-else-if="orders.length === 0" class="no-orders">
				<p>No orders yet.</p>
			</div>

			<div v-else class="orders-content">
				<!-- Filters and Search -->
				<div class="orders-controls">
					<div class="search-box">
						<input 
							v-model="searchQuery" 
							type="text" 
							placeholder="Search by order number, customer name, or email..."
							class="search-input"
						/>
					</div>
					<div class="filter-box">
						<label>Status:</label>
						<select v-model="statusFilter" class="filter-select">
							<option value="">All Statuses</option>
							<option value="pending">Pending</option>
							<option value="paid">Paid</option>
							<option value="processing">Processing</option>
							<option value="shipped">Shipped</option>
							<option value="completed">Completed</option>
							<option value="cancelled">Cancelled</option>
						</select>
					</div>
				</div>

				<!-- Orders Table -->
				<div class="orders-table-container">
					<table class="orders-table">
						<thead>
							<tr>
								<th @click="sortBy('orderNumber')" class="sortable">
									Order #
									<span v-if="sortField === 'orderNumber'" class="sort-indicator">
										{{ sortDirection === 'asc' ? '↑' : '↓' }}
									</span>
								</th>
								<th @click="sortBy('createdAt')" class="sortable">
									Date
									<span v-if="sortField === 'createdAt'" class="sort-indicator">
										{{ sortDirection === 'asc' ? '↑' : '↓' }}
									</span>
								</th>
								<th>Customer</th>
								<th>Items</th>
								<th @click="sortBy('totals.total')" class="sortable">
									Total
									<span v-if="sortField === 'totals.total'" class="sort-indicator">
										{{ sortDirection === 'asc' ? '↑' : '↓' }}
									</span>
								</th>
								<th>Status</th>
								<th>Actions</th>
							</tr>
						</thead>
						<tbody>
							<tr v-for="order in filteredAndSortedOrders" :key="order.id" :class="{ 'expanded': expandedOrder === order.id }">
								<td>{{ order.orderNumber }}</td>
								<td>{{ formatDate(order.createdAt) }}</td>
								<td>
									<div class="customer-info">
										<div class="customer-name">{{ order.customer.name }}</div>
										<div class="customer-email">{{ order.customer.email }}</div>
									</div>
								</td>
								<td>{{ getItemCount(order) }} item(s)</td>
								<td class="total-cell">{{ formatPrice(order.totals.total) }}</td>
								<td>
									<select 
										:value="order.status" 
										@change="updateStatus(order.id, $event.target.value)"
										class="status-select"
									>
										<option value="pending">Pending</option>
										<option value="paid">Paid</option>
										<option value="processing">Processing</option>
										<option value="shipped">Shipped</option>
										<option value="completed">Completed</option>
										<option value="cancelled">Cancelled</option>
									</select>
								</td>
								<td>
									<div class="action-buttons">
										<button @click="toggleOrderDetails(order.id)" class="button small">
											{{ expandedOrder === order.id ? 'Hide' : 'View' }}
										</button>
										<button @click="handleDeleteOrder(order.id, order.orderNumber)" class="button small delete-button" :disabled="loading">
											Delete
										</button>
									</div>
								</td>
							</tr>
							<!-- Expanded Order Details -->
							<template v-if="expandedOrder && filteredAndSortedOrders.find(o => o.id === expandedOrder)">
								<tr :key="`details-${expandedOrder}`" class="order-details-row">
								<td colspan="7">
									<div class="order-details" v-if="getOrderById(expandedOrder)">
										<div class="order-details-content">
											<div class="details-section">
												<h3>Order Information</h3>
												<p><strong>Order Number:</strong> {{ getOrderById(expandedOrder).orderNumber }}</p>
												<p><strong>Order ID:</strong> {{ getOrderById(expandedOrder).id }}</p>
												<p><strong>Stripe Session ID:</strong> {{ getOrderById(expandedOrder).stripeSessionId }}</p>
												<p><strong>Status:</strong> {{ getOrderById(expandedOrder).status }}</p>
												<p><strong>Created:</strong> {{ formatDateTime(getOrderById(expandedOrder).createdAt) }}</p>
												<p><strong>Last Updated:</strong> {{ formatDateTime(getOrderById(expandedOrder).updatedAt) }}</p>
											</div>

											<div class="details-section">
												<h3>Customer Information</h3>
												<p><strong>Name:</strong> {{ getOrderById(expandedOrder).customer.name }}</p>
												<p><strong>Email:</strong> {{ getOrderById(expandedOrder).customer.email }}</p>
												<p><strong>Phone:</strong> {{ getOrderById(expandedOrder).customer.phone || 'N/A' }}</p>
											</div>

											<div class="details-section">
												<h3>Shipping Address</h3>
												<div class="address-block">
													{{ getOrderById(expandedOrder).shipping.name }}<br>
													{{ getOrderById(expandedOrder).shipping.address.line1 }}<br>
													<span v-if="getOrderById(expandedOrder).shipping.address.line2">
														{{ getOrderById(expandedOrder).shipping.address.line2 }}<br>
													</span>
													{{ getOrderById(expandedOrder).shipping.address.city }}, 
													{{ getOrderById(expandedOrder).shipping.address.state }} 
													{{ getOrderById(expandedOrder).shipping.address.postal_code }}<br>
													{{ getOrderById(expandedOrder).shipping.address.country }}
												</div>
											</div>

											<div class="details-section">
												<h3>Order Items</h3>
												<table class="items-table">
													<thead>
														<tr>
															<th>Product</th>
															<th>SKU</th>
															<th>Quantity</th>
															<th>Price</th>
															<th>Total</th>
														</tr>
													</thead>
													<tbody>
														<tr v-for="(item, index) in getOrderById(expandedOrder).items" :key="index">
															<td>{{ item.name }}</td>
															<td>{{ item.sku || 'N/A' }}</td>
															<td>{{ item.quantity }}</td>
															<td>{{ formatPrice(item.price) }}</td>
															<td>{{ formatPrice(item.total) }}</td>
														</tr>
													</tbody>
												</table>
												<div class="order-totals">
													<p><strong>Subtotal:</strong> {{ formatPrice(getOrderById(expandedOrder).totals.subtotal) }}</p>
													<p><strong>Shipping:</strong> {{ formatPrice(getOrderById(expandedOrder).totals.shipping || 0) }}</p>
													<p><strong>Tax:</strong> {{ formatPrice(getOrderById(expandedOrder).totals.tax || 0) }}</p>
													<p class="total"><strong>Total:</strong> {{ formatPrice(getOrderById(expandedOrder).totals.total) }}</p>
												</div>
											</div>

											<div class="details-section">
												<h3>Admin Notes</h3>
												<div v-if="getOrderById(expandedOrder).notes" class="notes-display">
													<pre>{{ getOrderById(expandedOrder).notes }}</pre>
												</div>
												<div v-else class="no-notes">No notes yet.</div>
												<div class="add-note">
													<textarea 
														v-model="newNote" 
														placeholder="Add a note about this order..."
														rows="3"
														class="note-input"
													></textarea>
													<button @click="addNoteToOrder(expandedOrder)" class="button small" :disabled="!newNote.trim()">
														Add Note
													</button>
												</div>
											</div>
										</div>
									</div>
								</td>
							</tr>
							</template>
						</tbody>
					</table>
				</div>
			</div>
		</main>
	</div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useOrders } from '../composables/useOrders'
import { useCart } from '../composables/useCart'
import { useDialog } from '../composables/useDialog'

export default {
	name: 'Orders',
	setup() {
		const { orders, loading, error, loadOrders, getOrderById, updateOrderStatus, addOrderNote, deleteOrder } = useOrders()
		const { formatPrice } = useCart()
		const { confirm, alert } = useDialog()

		const searchQuery = ref('')
		const statusFilter = ref('')
		const sortField = ref('createdAt')
		const sortDirection = ref('desc')
		const expandedOrder = ref(null)
		const newNote = ref('')

		const filteredOrders = computed(() => {
			let filtered = orders.value

			// Filter by search query
			if (searchQuery.value) {
				const query = searchQuery.value.toLowerCase()
				filtered = filtered.filter(order => {
					return (
						order.orderNumber.toLowerCase().includes(query) ||
						order.customer.name.toLowerCase().includes(query) ||
						order.customer.email.toLowerCase().includes(query)
					)
				})
			}

			// Filter by status
			if (statusFilter.value) {
				filtered = filtered.filter(order => order.status === statusFilter.value)
			}

			return filtered
		})

		const filteredAndSortedOrders = computed(() => {
			const sorted = [...filteredOrders.value]
			sorted.sort((a, b) => {
				let aVal, bVal

				if (sortField.value === 'totals.total') {
					aVal = a.totals.total
					bVal = b.totals.total
				} else if (sortField.value === 'createdAt') {
					aVal = new Date(a.createdAt)
					bVal = new Date(b.createdAt)
				} else {
					aVal = a[sortField.value]
					bVal = b[sortField.value]
				}

				if (sortDirection.value === 'asc') {
					return aVal > bVal ? 1 : -1
				} else {
					return aVal < bVal ? 1 : -1
				}
			})

			return sorted
		})

		const sortBy = (field) => {
			if (sortField.value === field) {
				sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
			} else {
				sortField.value = field
				sortDirection.value = 'asc'
			}
		}

		const formatDate = (dateString) => {
			return new Date(dateString).toLocaleDateString()
		}

		const formatDateTime = (dateString) => {
			return new Date(dateString).toLocaleString()
		}

		const getItemCount = (order) => {
			return order.items.reduce((sum, item) => sum + item.quantity, 0)
		}

		const toggleOrderDetails = (orderId) => {
			if (expandedOrder.value === orderId) {
				expandedOrder.value = null
			} else {
				expandedOrder.value = orderId
				newNote.value = ''
			}
		}

		const updateStatus = async (orderId, newStatus) => {
			try {
				await updateOrderStatus(orderId, newStatus)
			} catch (err) {
				await alert('Failed to update order status: ' + err.message, 'Error')
			}
		}

		const addNoteToOrder = async (orderId) => {
			if (!newNote.value.trim()) return

			try {
				await addOrderNote(orderId, newNote.value)
				newNote.value = ''
			} catch (err) {
				await alert('Failed to add note: ' + err.message, 'Error')
			}
		}

		const refreshOrders = async () => {
			try {
				await loadOrders()
			} catch (err) {
				// Error already set in composable
			}
		}

		const handleDeleteOrder = async (orderId, orderNumber) => {
			try {
				const confirmed = await confirm(
					`Are you sure you want to delete order #${orderNumber}? This action cannot be undone.`,
					'Delete Order'
				)
				
				if (confirmed) {
					await deleteOrder(orderId)
					// Close expanded order if it was the one deleted
					if (expandedOrder.value === orderId) {
						expandedOrder.value = null
					}
				}
			} catch (err) {
				await alert('Failed to delete order: ' + err.message, 'Error')
			}
		}

		onMounted(() => {
			loadOrders()
		})

		return {
			orders,
			loading,
			error,
			searchQuery,
			statusFilter,
			sortField,
			sortDirection,
			expandedOrder,
			newNote,
			filteredAndSortedOrders,
			sortBy,
			formatDate,
			formatDateTime,
			formatPrice,
			getItemCount,
			getOrderById,
			toggleOrderDetails,
			updateStatus,
			addNoteToOrder,
			refreshOrders,
			handleDeleteOrder
		}
	}
}
</script>

<style scoped lang="scss">
@import '../assets/sass/_vars.scss';
@import '../assets/sass/_mixins.scss';

.orders-area {
	max-width: 1400px;
	margin: 0 auto;
	padding: 2rem;
}

.orders-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 2rem;

	h1 {
		margin: 0;
	}
}

.error-message {
	padding: 1rem;
	background: #fee;
	color: #c00;
	border-radius: 4px;
	margin-bottom: 1rem;
}

.loading, .no-orders {
	text-align: center;
	padding: 3rem;
	font-size: 1.2rem;
	color: #666;
}

.orders-controls {
	display: flex;
	gap: 1rem;
	margin-bottom: 1.5rem;
	flex-wrap: wrap;

	.search-box {
		flex: 1;
		min-width: 300px;

		.search-input {
			width: 100%;
			padding: 0.75rem;
			border: 1px solid #ddd;
			border-radius: 4px;
			font-size: 1rem;
		}
	}

	.filter-box {
		display: flex;
		align-items: center;
		gap: 0.5rem;

		label {
			font-weight: 600;
		}

		.filter-select {
			padding: 0.75rem;
			border: 1px solid #ddd;
			border-radius: 4px;
			font-size: 1rem;
		}
	}
}

.orders-table-container {
	overflow-x: auto;
	background: white;
	border-radius: 8px;
	box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.orders-table {
	width: 100%;
	border-collapse: collapse;

	thead {
		background: #f5f5f5;

		th {
			padding: 1rem;
			text-align: left;
			font-weight: 600;
			border-bottom: 2px solid #ddd;

			&.sortable {
				cursor: pointer;
				user-select: none;

				&:hover {
					background: #eee;
				}

				.sort-indicator {
					margin-left: 0.5rem;
					color: #0098d6;
				}
			}
		}
	}

	tbody {
		tr {
			border-bottom: 1px solid #eee;

			&:hover {
				background: #f9f9f9;
			}

			&.expanded {
				background: #f0f7ff;
			}
		}

		td {
			padding: 1rem;
		}
	}
}

.customer-info {
	.customer-name {
		font-weight: 600;
		margin-bottom: 0.25rem;
	}

	.customer-email {
		font-size: 0.9em;
		color: #666;
	}
}

.total-cell {
	font-weight: 600;
	color: #0098d6;
}

.status-select {
	padding: 0.5rem;
	border: 1px solid #ddd;
	border-radius: 4px;
	font-size: 0.9rem;
	cursor: pointer;
}

.action-buttons {
	display: flex;
	gap: 0.5rem;
	flex-wrap: wrap;
}

.delete-button {
	background-color: #dc3545;
	color: white;
	border-color: #dc3545;

	&:hover:not(:disabled) {
		background-color: #c82333;
		border-color: #bd2130;
	}

	&:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}
}

.order-details-row {
	td {
		padding: 0;
	}
}

.order-details {
	background: white;
	padding: 2rem;
	border-top: 2px solid #0098d6;
}

.order-details-content {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
	gap: 2rem;
}

.details-section {
	h3 {
		margin-top: 0;
		margin-bottom: 1rem;
		color: #0098d6;
		border-bottom: 1px solid #ddd;
		padding-bottom: 0.5rem;
	}

	p {
		margin: 0.5rem 0;
	}
}

.address-block {
	background: #f9f9f9;
	padding: 1rem;
	border-radius: 4px;
	line-height: 1.6;
}

.items-table {
	width: 100%;
	border-collapse: collapse;
	margin-top: 1rem;

	th, td {
		padding: 0.75rem;
		text-align: left;
		border-bottom: 1px solid #eee;
	}

	th {
		background: #f5f5f5;
		font-weight: 600;
	}
}

.order-totals {
	margin-top: 1rem;
	padding-top: 1rem;
	border-top: 2px solid #ddd;
	text-align: right;

	p {
		margin: 0.5rem 0;

		&.total {
			font-size: 1.2em;
			font-weight: bold;
			color: #0098d6;
		}
	}
}

.notes-display {
	background: #f9f9f9;
	padding: 1rem;
	border-radius: 4px;
	margin-bottom: 1rem;
	max-height: 200px;
	overflow-y: auto;

	pre {
		margin: 0;
		white-space: pre-wrap;
		font-family: inherit;
	}
}

.no-notes {
	color: #999;
	font-style: italic;
	margin-bottom: 1rem;
}

.add-note {
	display: flex;
	flex-direction: column;
	gap: 0.5rem;

	.note-input {
		width: 100%;
		padding: 0.75rem;
		border: 1px solid #ddd;
		border-radius: 4px;
		font-family: inherit;
		resize: vertical;
	}

	button {
		align-self: flex-start;
	}
}

@include mobile-only {
	.orders-controls {
		flex-direction: column;
	}

	.orders-table {
		font-size: 0.9rem;

		th, td {
			padding: 0.5rem;
		}
	}

	.order-details-content {
		grid-template-columns: 1fr;
	}
}
</style>


<template>
  <div class="content-area primary">
    <main class="site-main main" role="main">
      <div class="custom-job-page">
        <div class="custom-job-card">
          <h1>Custom Job</h1>

          <form @submit.prevent="submitCustomJob" class="custom-job-form">
            <div class="form-group">
              <label for="custom-job-name">Name</label>
              <input id="custom-job-name" v-model="form.name" type="text" placeholder="Your name" required />
            </div>

            <div class="form-group">
              <label for="custom-job-email">Email</label>
              <input id="custom-job-email" v-model="form.email" type="email" placeholder="you@example.com" required />
            </div>

            <div class="form-group">
              <label for="custom-job-amount">Price</label>
              <div class="amount-input-wrap">
                <span class="currency-prefix">$</span>
                <input
                  id="custom-job-amount"
                  v-model.number="form.amount"
                  type="number"
                  min="1"
                  step="1"
                  placeholder="50"
                  required
                  inputmode="numeric"
                  class="no-spinner"
                />
              </div>
            </div>

            <button type="submit" class="button primary">Send Custom Job Request</button>
          </form>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import { reactive } from 'vue'
import { useStripe } from '../composables/useStripe'

export default {
  name: 'CustomJob',
  setup() {
    const { createCheckoutSession } = useStripe()

    const form = reactive({
      name: '',
      email: '',
      amount: 50
    })

    const submitCustomJob = async () => {
      try {
        const amount = Number(form.amount)
        if (!form.name || !form.email || !amount || amount <= 0) {
          throw new Error('Please complete all fields with a valid price.')
        }

        const cartItems = [{
          id: 999,
          slug: 'custom-job',
          sku: 'custom-job',
          name: 'Custom Job',
          price: amount,
          quantity: 1,
          image: null,
          custom_amount: true
        }]

        await createCheckoutSession(cartItems, {
          name: form.name,
          email: form.email,
          phone: '',
          notes: '',
          shipping: null
        })
      } catch (error) {
        console.error('Custom job submission error:', error)
        alert(error.message || 'There was a problem submitting your request.')
      }
    }

    return {
      form,
      submitCustomJob
    }
  }
}
</script>

<style scoped>
.custom-job-page {
  display: flex;
  justify-content: center;
  padding: 2rem 1rem;
}

.custom-job-card {
  width: min(100%, 720px);
  background: #fff;
  border: 1px solid #e6e6e6;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
}

.custom-job-card h1 {
  margin: 0 0 0.75rem;
}

.custom-job-intro {
  margin-bottom: 1.5rem;
  font-size: 1.05rem;
  color: #444;
}

.custom-job-form {
  display: grid;
  gap: 1.25rem;
}

.form-group {
  display: grid;
  gap: 0.45rem;
}

.form-group label {
  font-weight: 600;
}

.form-group input,
.form-group textarea {
  width: 100%;
  border: 1px solid #d5d5d5;
  border-radius: 8px;
  padding: 0.75rem 0.9rem;
  font: inherit;
  box-sizing: border-box;
}

.form-group textarea {
  resize: vertical;
}

.amount-input-wrap {
  position: relative;
}

.currency-prefix {
  position: absolute;
  left: 0.9rem;
  top: 50%;
  transform: translateY(-50%);
  color: #555;
  font-weight: 600;
}

.amount-input-wrap input {
  padding-left: 2rem;
}

.no-spinner {
  -moz-appearance: textfield;
  appearance: textfield;
}

.no-spinner::-webkit-outer-spin-button,
.no-spinner::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.button.primary {
  width: auto;
  justify-self: start;
}

@media (max-width: 600px) {
  .custom-job-card {
    padding: 1.25rem;
  }
}
</style>

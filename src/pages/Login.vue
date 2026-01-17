<template>
  <div class="login-page">
    <div class="login-container">
      <h1>Admin Login</h1>
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="username">Username</label>
          <input
            id="username"
            v-model="username"
            type="text"
            required
            autocomplete="username"
            placeholder="Enter username"
          />
        </div>
        <div class="form-group">
          <label for="password">Password</label>
          <input
            id="password"
            v-model="password"
            type="password"
            required
            autocomplete="current-password"
            placeholder="Enter password"
          />
        </div>
        <div v-if="error" class="error-message">
          {{ error }}
        </div>
        <button type="submit" class="button primary" :disabled="loading">
          {{ loading ? 'Logging in...' : 'Login' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '../composables/useAuth'

export default {
  name: 'Login',
  setup() {
    const router = useRouter()
    const route = useRoute()
    const { login } = useAuth()
    
    const username = ref('')
    const password = ref('')
    const error = ref('')
    const loading = ref(false)

    const handleLogin = async () => {
      error.value = ''
      loading.value = true

      try {
        const result = await login(username.value, password.value)
        
        if (result.success) {
          // Redirect to admin page or the originally requested page
          const redirect = route.query.redirect || '/admin'
          router.push(redirect)
        } else {
          error.value = result.error || 'Login failed'
        }
      } catch (err) {
        error.value = 'An error occurred during login'
        console.error('Login error:', err)
      } finally {
        loading.value = false
      }
    }

    return {
      username,
      password,
      error,
      loading,
      handleLogin
    }
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  padding: 2rem;
}

.login-container {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

.login-container h1 {
  margin: 0 0 2rem 0;
  text-align: center;
  color: #333;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: bold;
  color: #333;
}

.form-group input {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.form-group input:focus {
  outline: none;
  border-color: #333;
}

.error-message {
  padding: 0.75rem;
  background: #fee;
  color: #c33;
  border-radius: 4px;
  border: 1px solid #fcc;
}

.button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;
}

.button.primary {
  background: #333;
  color: white;
}

.button.primary:hover:not(:disabled) {
  background: #555;
}

.button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>






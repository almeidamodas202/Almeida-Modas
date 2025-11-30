<script setup lang="ts">
import { ref } from 'vue';
import { supabase } from '../supabase'; // Importa a conexão que criamos
import { useRouter } from 'vue-router';

const router = useRouter();
const email = ref('');
const password = ref('');
const loading = ref(false);

const handleLogin = async () => {
  loading.value = true;
  
  // Tenta fazer login no Supabase
  const { error } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value
  });

  if (error) {
    alert('Erro: ' + error.message); // Senha errada
  } else {
    // Sucesso! Manda para o Dashboard
    router.push('/admin/dashboard');
  }
  
  loading.value = false;
};
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100 px-4">
    <div class="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
      <h1 class="text-2xl font-bold text-center mb-6 text-gray-800">Painel Administrativo</h1>
      
      <form @submit.prevent="handleLogin" class="space-y-4">
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input 
            v-model="email"
            type="email" 
            required
            class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black focus:outline-none"
            placeholder="admin@almeidamodas.com"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Senha</label>
          <input 
            v-model="password"
            type="password" 
            required
            class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black focus:outline-none"
            placeholder="••••••••"
          />
        </div>

        <button 
          type="submit" 
          :disabled="loading"
          class="w-full bg-black text-white py-3 rounded-lg font-bold hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          {{ loading ? 'Entrando...' : 'Acessar Painel' }}
        </button>
      </form>

      <div class="mt-6 text-center">
        <router-link to="/" class="text-sm text-gray-500 hover:text-black hover:underline">
          ← Voltar para a Loja
        </router-link>
      </div>
    </div>
  </div>
</template>
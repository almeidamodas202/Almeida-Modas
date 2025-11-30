<script setup lang="ts">
import { useCartStore } from '../stores/cart';
import { X, Trash2, MessageCircle } from 'lucide-vue-next';

const cartStore = useCartStore();
</script>

<template>
  <div 
    v-if="cartStore.isDrawerOpen" 
    class="fixed inset-0 bg-black/50 z-50 transition-opacity"
    @click="cartStore.toggleDrawer"
  ></div>

  <div 
    class="fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col"
    :class="cartStore.isDrawerOpen ? 'translate-x-0' : 'translate-x-full'"
  >
    
    <div class="p-5 border-b border-gray-100 flex justify-between items-center bg-white">
      <h2 class="text-xl font-bold text-gray-800">Sua Sacola ({{ cartStore.count }})</h2>
      <button @click="cartStore.toggleDrawer" class="p-2 hover:bg-gray-100 rounded-full transition-colors">
        <X :size="24" />
      </button>
    </div>

    <div class="flex-1 overflow-y-auto p-5 space-y-4">
      <div v-if="cartStore.items.length === 0" class="text-center py-10 text-gray-500">
        <p>Sua sacola está vazia.</p>
        <button @click="cartStore.toggleDrawer" class="mt-4 text-black font-bold underline">
          Voltar a comprar
        </button>
      </div>

      <div 
        v-for="item in cartStore.items" 
        :key="item.cartId" 
        class="flex gap-4 bg-gray-50 p-3 rounded-xl animate-in fade-in slide-in-from-right-4"
      >
        <img :src="item.image" :alt="item.name" class="w-20 h-24 object-cover rounded-lg bg-gray-200">
        
        <div class="flex-1 flex flex-col justify-between">
          <div>
            <h3 class="font-bold text-gray-800 line-clamp-1">
              <span class="text-green-600 mr-1">{{ item.quantity }}x</span> 
              {{ item.name }}
            </h3>
            <p class="text-sm text-gray-500">Tamanho: <span class="font-bold text-black">{{ item.selectedSize }}</span></p>
          </div>
          <div class="flex justify-between items-end">
            <span class="font-bold text-gray-900">R$ {{ (item.price * item.quantity).toFixed(2) }}</span>
            
            <button 
              @click="cartStore.removeFromCart(item.cartId)"
              class="text-red-500 hover:bg-red-50 p-1 rounded transition-colors"
            >
              <Trash2 :size="18" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="p-6 bg-white border-t border-gray-100">
      <div class="flex justify-between items-center mb-4 text-xl font-bold">
        <span>Total:</span>
        <span>R$ {{ cartStore.total.toFixed(2) }}</span>
      </div>

      <button 
        @click="cartStore.checkoutViaWhatsApp"
        :disabled="cartStore.items.length === 0"
        class="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <MessageCircle :size="24" />
        Finalizar no WhatsApp
      </button>
      <p class="text-center text-xs text-gray-400 mt-3">
        Você será redirecionado para o WhatsApp para combinar o pagamento.
      </p>
    </div>
  </div>
</template>
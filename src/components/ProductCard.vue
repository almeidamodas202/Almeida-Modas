<script setup lang="ts">
import { ref } from 'vue';
import type { Product } from '../data/products';
import { useCartStore } from '../stores/cart';
import { ShoppingBag, Check, Plus, Minus } from 'lucide-vue-next'; 

defineProps<{
  product: Product
}>();

const cartStore = useCartStore();
const selectedSize = ref<string>(''); 
const quantity = ref(1); // Começa com 1
const isAdded = ref(false); // Estado para controlar o feedback do botão

// Aumentar Quantidade
const increaseQty = () => quantity.value++;

// Diminuir Quantidade (Mínimo 1)
const decreaseQty = () => {
  if (quantity.value > 1) quantity.value--;
};

const handleAddToCart = (product: Product) => {
  if (!selectedSize.value) return; 
  
  // Envia para o store com a quantidade
  cartStore.addToCart(product, selectedSize.value, quantity.value);

  // Feedback Visual (Muda o botão)
  isAdded.value = true;
  
  // Reseta o botão após 2 segundos
  setTimeout(() => {
    isAdded.value = false;
    quantity.value = 1; // Opcional: Reseta a quantidade para 1
    selectedSize.value = ''; // Opcional: Reseta o tamanho
  }, 2000);
};
</script>

<template>
  <div class="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col">
    
    <div class="relative h-72 overflow-hidden bg-gray-100">
      <img 
        :src="product.image" 
        :alt="product.name" 
        class="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
      />
      <span class="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 text-xs font-bold uppercase tracking-wider text-gray-800 rounded-full shadow-sm">
        {{ product.category }}
      </span>
    </div>

    <div class="p-6 flex-1 flex flex-col">
      <div class="mb-4">
        <h3 class="text-lg font-bold text-gray-900 leading-tight mb-2">{{ product.name }}</h3>
        <p class="text-sm text-gray-500 line-clamp-2">{{ product.description }}</p>
      </div>

      <div class="text-2xl font-bold text-gray-900 mb-4">
        R$ {{ product.price.toFixed(2).replace('.', ',') }}
      </div>

      <div class="mb-4">
        <span class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">Tamanho:</span>
        <div class="flex flex-wrap gap-2">
          <button 
            v-for="size in product.sizes" 
            :key="size"
            @click="selectedSize = size"
            :class="[
              'w-10 h-10 rounded-lg text-sm font-medium transition-all duration-200 border',
              selectedSize === size 
                ? 'bg-black text-white border-black shadow-md' 
                : 'bg-white text-gray-600 border-gray-200 hover:border-black hover:text-black'
            ]"
          >
            {{ size }}
          </button>
        </div>
      </div>

      <div class="mb-6 flex items-center gap-3">
        <span class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Qtd:</span>
        <div class="flex items-center border border-gray-200 rounded-lg">
          <button @click="decreaseQty" class="p-2 hover:bg-gray-100 text-gray-600 rounded-l-lg transition-colors">
            <Minus :size="16" />
          </button>
          <span class="w-8 text-center font-medium text-gray-900">{{ quantity }}</span>
          <button @click="increaseQty" class="p-2 hover:bg-gray-100 text-gray-600 rounded-r-lg transition-colors">
            <Plus :size="16" />
          </button>
        </div>
      </div>

      <div class="mt-auto">
        <button 
          @click="handleAddToCart(product)"
          :disabled="!selectedSize || isAdded"
          :class="[
            'w-full py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 font-bold transition-all duration-300',
            isAdded 
              ? 'bg-green-500 text-white shadow-green-200 scale-100 cursor-default'
              : selectedSize 
                ? 'bg-black text-white hover:bg-gray-800 shadow-lg hover:shadow-gray-300/50 transform active:scale-95' 
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          ]"
        >
          <component :is="isAdded ? Check : ShoppingBag" :size="20" />
          
          {{ isAdded ? 'Adicionado!' : (selectedSize ? 'Adicionar à Sacola' : 'Escolha um tamanho') }}
        </button>
      </div>
    </div>
  </div>
</template>
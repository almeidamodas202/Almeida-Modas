<script setup lang="ts">
import { ref, computed } from 'vue';
import type { Product } from '../data/products';
import { useCartStore } from '../stores/cart';
import { ShoppingBag, Check, Plus, Minus, AlertCircle } from 'lucide-vue-next'; 

const props = defineProps<{
  product: Product
}>();

const cartStore = useCartStore();
const selectedSize = ref<string>(''); 
const quantity = ref(1); 
const isAdded = ref(false);

// Verifica se está esgotado
const isSoldOut = computed(() => props.product.stock === 0);

// Verifica se é "Últimas Peças" (menos de 3 unidades)
const isLowStock = computed(() => props.product.stock > 0 && props.product.stock < 3);

// Aumentar Quantidade (Respeitando o Limite do Estoque)
const increaseQty = () => {
  if (quantity.value < props.product.stock) {
    quantity.value++;
  } else {
    alert(`Desculpe, só temos ${props.product.stock} unidades em estoque.`);
  }
};

const decreaseQty = () => {
  if (quantity.value > 1) quantity.value--;
};

const handleAddToCart = () => {
  if (!selectedSize.value || isSoldOut.value) return; 
  
  cartStore.addToCart(props.product, selectedSize.value, quantity.value);

  isAdded.value = true;
  setTimeout(() => {
    isAdded.value = false;
    quantity.value = 1; 
    selectedSize.value = ''; 
  }, 2000);
};
</script>

<template>
  <div 
    class="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col transition-all duration-300"
    :class="isSoldOut ? 'opacity-75 grayscale' : 'hover:shadow-xl'"
  >
    
    <div class="relative h-72 overflow-hidden bg-gray-100">
      <img 
        :src="product.image" 
        :alt="product.name" 
        class="w-full h-full object-cover transform transition-transform duration-700"
        :class="!isSoldOut && 'group-hover:scale-110'"
      />
      
      <span class="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 text-xs font-bold uppercase tracking-wider text-gray-800 rounded-full shadow-sm">
        {{ product.category }}
      </span>

      <div v-if="isSoldOut" class="absolute inset-0 bg-black/40 flex items-center justify-center">
        <span class="bg-red-600 text-white px-4 py-2 font-bold uppercase tracking-widest text-sm rounded shadow-lg transform -rotate-12 border-2 border-white">
          Esgotado
        </span>
      </div>

      <div v-if="isLowStock" class="absolute bottom-4 right-4">
        <span class="bg-orange-500 text-white px-2 py-1 text-xs font-bold rounded flex items-center gap-1 shadow-md">
          <AlertCircle :size="12" /> Últimas {{ product.stock }} Peças
        </span>
      </div>
    </div>

    <div class="p-6 flex-1 flex flex-col relative">
      <div class="mb-4">
        <h3 class="text-lg font-bold text-gray-900 leading-tight mb-2">{{ product.name }}</h3>
        <p class="text-sm text-gray-500 line-clamp-2">{{ product.description }}</p>
      </div>

      <div class="text-2xl font-bold text-gray-900 mb-4">
        R$ {{ product.price.toFixed(2).replace('.', ',') }}
      </div>

      <div v-if="!isSoldOut">
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
            <button 
              @click="increaseQty" 
              class="p-2 hover:bg-gray-100 text-gray-600 rounded-r-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              :disabled="quantity >= product.stock"
            >
              <Plus :size="16" />
            </button>
          </div>
          <span class="text-xs text-gray-400" v-if="quantity >= product.stock">(Máx)</span>
        </div>
      </div>

      <div class="mt-auto">
        <button 
          @click="handleAddToCart"
          :disabled="isSoldOut || !selectedSize || isAdded"
          :class="[
            'w-full py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 font-bold transition-all duration-300',
            isSoldOut
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : isAdded 
                ? 'bg-green-500 text-white shadow-green-200 scale-100 cursor-default'
                : selectedSize 
                  ? 'bg-black text-white hover:bg-gray-800 shadow-lg hover:shadow-gray-300/50 transform active:scale-95' 
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          ]"
        >
          <component :is="isAdded ? Check : ShoppingBag" :size="20" />
          
          <span v-if="isSoldOut">Produto Esgotado</span>
          <span v-else-if="isAdded">Adicionado!</span>
          <span v-else-if="selectedSize">Adicionar à Sacola</span>
          <span v-else>Escolha um tamanho</span>
        </button>
      </div>
    </div>
  </div>
</template>
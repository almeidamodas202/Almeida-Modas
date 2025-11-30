<script setup lang="ts">
import { ref, onMounted } from 'vue';
import ProductCard from '../components/ProductCard.vue';
import CartDrawer from '../components/CartDrawer.vue';
import WhatsAppFloat from '../components/WhatsAppFloat.vue';
import { useCartStore } from '../stores/cart';
import { ShoppingBag } from 'lucide-vue-next';
import { supabase } from '../supabase'; // Conexão com o banco

const cartStore = useCartStore();

// Estado dos produtos
const products = ref<any[]>([]);
const loading = ref(true);

// Função para buscar produtos do Supabase
const fetchProducts = async () => {
  loading.value = true;
  
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false }); // Mais recentes primeiro

  if (error) {
    console.error('Erro ao buscar produtos:', error);
  } else {
    products.value = data || [];
  }
  
  loading.value = false;
};

// Carrega assim que a página abre
onMounted(() => {
  fetchProducts();
});
</script>

<template>
  <div class="min-h-screen bg-gray-50 font-sans">
    
    <header class="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-gray-100">
      <div class="container mx-auto px-4 h-20 flex justify-between items-center">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white font-bold text-xl">A</div>
          <h1 class="text-2xl font-bold text-gray-900 tracking-tight">Almeida Modas</h1>
        </div>

        <button 
          @click="cartStore.toggleDrawer"
          class="relative p-2 hover:bg-gray-100 rounded-full transition-colors group"
        >
          <ShoppingBag :size="24" class="text-gray-700" />
          <span 
            v-if="cartStore.count > 0" 
            class="absolute top-0 right-0 bg-black text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full animate-bounce"
          >
            {{ cartStore.count }}
          </span>
        </button>
      </div>
    </header>
    
    <section class="bg-black text-white py-16 text-center px-4">
      <h2 class="text-4xl md:text-5xl font-bold mb-4">Verão 2025</h2>
      <p class="text-gray-400 max-w-xl mx-auto text-lg">Peças exclusivas selecionadas para trazer elegância e conforto para o seu dia a dia.</p>
    </section>

    <main class="container mx-auto px-4 py-12">
      
      <div v-if="loading" class="text-center py-20">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
        <p class="text-gray-500">Carregando coleção...</p>
      </div>

      <div v-else-if="products.length === 0" class="text-center py-20">
        <p class="text-gray-500 text-lg">Nenhum produto cadastrado no momento.</p>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        <ProductCard 
          v-for="product in products" 
          :key="product.id" 
          :product="product" 
        />
      </div>

    </main>
    
    <footer class="bg-gray-900 text-white py-8 text-center mt-12">
      <p class="text-gray-500 text-sm">© 2025 Almeida Modas. Todos os direitos reservados.</p>
    </footer>

    <CartDrawer />
    <WhatsAppFloat />

  </div>
</template>
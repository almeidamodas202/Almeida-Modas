<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from '../supabase';
import { Plus, Trash2, LogOut, Package, Minus } from 'lucide-vue-next'; // Adicionado Minus

const router = useRouter();

// Estado
const products = ref<any[]>([]);
const loading = ref(false);
const isModalOpen = ref(false);
const uploading = ref(false);

// Formulário
const form = ref({
  name: '',
  price: '',
  description: '',
  category: '',
  sizes: '', 
  stock: 1,
  image: ''
});
const imageFile = ref<File | null>(null);

// 1. Buscar Produtos
const fetchProducts = async () => {
  loading.value = true;
  const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
  if (error) console.error(error);
  else products.value = data || [];
  loading.value = false;
};

// 2. Upload de Imagem
const handleImageChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    imageFile.value = target.files[0];
  }
};

const uploadImage = async (): Promise<string | null> => {
  if (!imageFile.value) return null;
  
  const cleanName = imageFile.value.name
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") 
    .replace(/[^a-zA-Z0-9.-]/g, ""); 

  const fileName = `${Date.now()}-${cleanName}`;
  const { error } = await supabase.storage.from('produtos').upload(fileName, imageFile.value);
  
  if (error) {
    alert('Erro ao subir imagem: ' + error.message);
    return null;
  }

  const { data: publicUrl } = supabase.storage.from('produtos').getPublicUrl(fileName);
  return publicUrl.publicUrl;
};

// 3. Salvar Produto
const handleSave = async () => {
  if (!form.value.name || !form.value.price) return alert('Preencha nome e preço!');
  
  uploading.value = true;

  let imageUrl = form.value.image;
  if (imageFile.value) {
    const uploadedUrl = await uploadImage();
    if (uploadedUrl) imageUrl = uploadedUrl;
  } else if (!imageUrl) {
    imageUrl = 'https://via.placeholder.com/400'; 
  }

  const sizesArray = form.value.sizes.split(',').map(s => s.trim().toUpperCase()).filter(s => s);

  const newProduct = {
    name: form.value.name,
    price: parseFloat(form.value.price.replace(',', '.')), 
    description: form.value.description,
    category: form.value.category,
    sizes: sizesArray,
    stock: form.value.stock,
    image: imageUrl
  };

  const { error } = await supabase.from('products').insert(newProduct);

  if (error) {
    alert('Erro ao salvar: ' + error.message);
  } else {
    alert('Produto cadastrado com sucesso!');
    isModalOpen.value = false;
    form.value = { name: '', price: '', description: '', category: '', sizes: '', stock: 1, image: '' };
    imageFile.value = null;
    fetchProducts(); 
  }
  uploading.value = false;
};

// 4. Excluir Produto
const handleDelete = async (id: number) => {
  if (!confirm('Tem certeza que deseja excluir este produto?')) return;
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) alert('Erro ao excluir');
  else fetchProducts();
};

// 5. ATUALIZAR ESTOQUE (NOVO)
const updateStock = async (product: any, change: number) => {
  const newStock = product.stock + change;
  if (newStock < 0) return; // Não deixa ficar negativo

  // Atualiza no banco
  const { error } = await supabase
    .from('products')
    .update({ stock: newStock })
    .eq('id', product.id);

  if (error) {
    alert('Erro ao atualizar estoque');
  } else {
    // Atualiza visualmente na hora (sem precisar recarregar)
    product.stock = newStock;
  }
};

// Logout
const handleLogout = async () => {
  await supabase.auth.signOut();
  router.push('/');
};

onMounted(() => {
  fetchProducts();
});
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-white shadow px-6 py-4 flex justify-between items-center sticky top-0 z-10">
      <h1 class="text-xl font-bold text-gray-800 flex items-center gap-2">
        <Package class="text-black" /> Painel Admin
      </h1>
      <button @click="handleLogout" class="text-red-600 hover:text-red-800 text-sm font-semibold flex items-center gap-1">
        <LogOut :size="16" /> Sair
      </button>
    </header>

    <main class="container mx-auto p-6">
      <div class="flex justify-between items-center mb-8">
        <div>
          <h2 class="text-2xl font-bold text-gray-900">Gerenciar Loja</h2>
          <p class="text-gray-500 text-sm">{{ products.length }} produtos ativos</p>
        </div>
        <button 
          @click="isModalOpen = true"
          class="bg-black text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-gray-800 transition-colors"
        >
          <Plus :size="20" /> Novo Produto
        </button>
      </div>

      <div v-if="loading" class="text-center py-10 text-gray-500">Carregando estoque...</div>

      <div v-else-if="products.length === 0" class="text-center py-20 bg-white rounded-xl shadow border border-dashed border-gray-300">
        <p class="text-gray-400 mb-4">Nenhum produto encontrado.</p>
        <button @click="isModalOpen = true" class="text-blue-600 font-bold hover:underline">Cadastre o primeiro</button>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="product in products" :key="product.id" class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          
          <div class="flex gap-4 p-4">
            <img :src="product.image" class="w-20 h-24 object-cover rounded-lg bg-gray-100">
            <div class="flex-1 min-w-0">
              <h3 class="font-bold text-gray-800 truncate">{{ product.name }}</h3>
              <p class="text-green-600 font-bold">R$ {{ product.price }}</p>
              <p class="text-xs text-gray-400 mt-1 truncate">{{ product.category }}</p>
            </div>
            <div>
               <button @click="handleDelete(product.id)" class="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-colors" title="Excluir Produto">
                <Trash2 :size="18" />
              </button>
            </div>
          </div>

          <div class="bg-gray-50 p-3 flex justify-between items-center border-t border-gray-100">
            <span class="text-xs font-bold uppercase text-gray-500">Estoque:</span>
            
            <div class="flex items-center bg-white rounded-lg border border-gray-200 shadow-sm">
              <button 
                @click="updateStock(product, -1)" 
                class="p-2 hover:bg-red-50 text-red-500 transition-colors rounded-l-lg"
                title="Vendeu 1"
              >
                <Minus :size="16" />
              </button>
              
              <span class="w-10 text-center font-bold text-gray-800">{{ product.stock }}</span>
              
              <button 
                @click="updateStock(product, 1)" 
                class="p-2 hover:bg-green-50 text-green-500 transition-colors rounded-r-lg"
                title="Repor Estoque"
              >
                <Plus :size="16" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </main>

    <div v-if="isModalOpen" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div class="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
        <h2 class="text-xl font-bold mb-6">Novo Produto</h2>
        <form @submit.prevent="handleSave" class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">Nome</label>
            <input v-model="form.name" type="text" required class="w-full border rounded-lg p-2">
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-1">Preço (R$)</label>
              <input v-model="form.price" type="text" required class="w-full border rounded-lg p-2" placeholder="0,00">
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Estoque</label>
              <input v-model="form.stock" type="number" min="0" required class="w-full border rounded-lg p-2">
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-1">Categoria</label>
              <input v-model="form.category" type="text" class="w-full border rounded-lg p-2">
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Tamanhos (ex: P, M)</label>
              <input v-model="form.sizes" type="text" class="w-full border rounded-lg p-2">
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Descrição</label>
            <textarea v-model="form.description" rows="3" class="w-full border rounded-lg p-2"></textarea>
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Foto</label>
            <input @change="handleImageChange" type="file" accept="image/*" class="w-full file:bg-gray-100 file:border-0 file:rounded-full file:px-4 file:py-2 file:mr-4 file:text-sm file:font-semibold hover:file:bg-gray-200"/>
          </div>
          <div class="flex gap-3 pt-4">
            <button type="button" @click="isModalOpen = false" class="flex-1 py-3 border rounded-lg font-bold">Cancelar</button>
            <button type="submit" :disabled="uploading" class="flex-1 py-3 bg-black text-white rounded-lg font-bold disabled:opacity-50">
              {{ uploading ? 'Salvando...' : 'Cadastrar' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
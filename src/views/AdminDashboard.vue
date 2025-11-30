<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from '../supabase';
import { Plus, Trash2, LogOut, Package } from 'lucide-vue-next';

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
  sizes: '', // Vamos pedir separado por vírgula (ex: P, M, G)
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
  
  // 1. Limpeza do nome (Remove acentos, ç, espaços)
  const cleanName = imageFile.value.name
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Tira acentos
    .replace(/[^a-zA-Z0-9.-]/g, ""); // Tira tudo que não for letra/número

  // 2. Cria nome único
  const fileName = `${Date.now()}-${cleanName}`;
  
  const { error } = await supabase.storage.from('produtos').upload(fileName, imageFile.value);
  
  if (error) {
    alert('Erro ao subir imagem: ' + error.message);
    return null;
  }

  // Pega a URL pública
  const { data: publicUrl } = supabase.storage.from('produtos').getPublicUrl(fileName);
  return publicUrl.publicUrl;
};

// 3. Salvar Produto
const handleSave = async () => {
  if (!form.value.name || !form.value.price) return alert('Preencha nome e preço!');
  
  uploading.value = true;

  // Se tiver imagem nova, faz upload. Se não, usa placeholder.
  let imageUrl = form.value.image;
  if (imageFile.value) {
    const uploadedUrl = await uploadImage();
    if (uploadedUrl) imageUrl = uploadedUrl;
  } else if (!imageUrl) {
    imageUrl = 'https://via.placeholder.com/400'; // Imagem padrão
  }

  const sizesArray = form.value.sizes.split(',').map(s => s.trim().toUpperCase()).filter(s => s);

  const newProduct = {
    name: form.value.name,
    price: parseFloat(form.value.price.replace(',', '.')), // Aceita vírgula
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
    // Limpar form
    form.value = { name: '', price: '', description: '', category: '', sizes: '', stock: 1, image: '' };
    imageFile.value = null;
    fetchProducts(); // Recarrega a lista
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
          <h2 class="text-2xl font-bold text-gray-900">Seus Produtos</h2>
          <p class="text-gray-500 text-sm">{{ products.length }} produtos cadastrados</p>
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
        <p class="text-gray-400 mb-4">Nenhum produto encontrado no banco de dados.</p>
        <button @click="isModalOpen = true" class="text-blue-600 font-bold hover:underline">Cadastre o primeiro agora</button>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="product in products" :key="product.id" class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex gap-4 p-4">
          <img :src="product.image" class="w-24 h-24 object-cover rounded-lg bg-gray-100">
          
          <div class="flex-1 min-w-0">
            <h3 class="font-bold text-gray-800 truncate">{{ product.name }}</h3>
            <p class="text-green-600 font-bold">R$ {{ product.price }}</p>
            <p class="text-xs text-gray-500 mt-1">Estoque: <strong :class="product.stock < 3 ? 'text-red-500' : 'text-gray-800'">{{ product.stock }}</strong></p>
          </div>

          <div class="flex flex-col justify-between items-end">
            <button @click="handleDelete(product.id)" class="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-colors">
              <Trash2 :size="18" />
            </button>
          </div>
        </div>
      </div>
    </main>

    <div v-if="isModalOpen" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div class="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
        <h2 class="text-xl font-bold mb-6">Novo Produto</h2>
        
        <form @submit.prevent="handleSave" class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">Nome do Produto</label>
            <input v-model="form.name" type="text" required class="w-full border rounded-lg p-2" placeholder="Ex: Vestido Longo">
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
              <input v-model="form.category" type="text" class="w-full border rounded-lg p-2" placeholder="Ex: Vestidos">
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Tamanhos (Separe por vírgula)</label>
              <input v-model="form.sizes" type="text" class="w-full border rounded-lg p-2" placeholder="P, M, G, 42">
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Descrição</label>
            <textarea v-model="form.description" rows="3" class="w-full border rounded-lg p-2"></textarea>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Foto do Produto</label>
            <input @change="handleImageChange" type="file" accept="image/*" class="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"/>
          </div>

          <div class="flex gap-3 pt-4">
            <button type="button" @click="isModalOpen = false" class="flex-1 py-3 border rounded-lg font-bold hover:bg-gray-50">Cancelar</button>
            <button type="submit" :disabled="uploading" class="flex-1 py-3 bg-black text-white rounded-lg font-bold hover:bg-gray-800 disabled:opacity-50">
              {{ uploading ? 'Salvando...' : 'Cadastrar' }}
            </button>
          </div>
        </form>
      </div>
    </div>

  </div>
</template>
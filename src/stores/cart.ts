import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Product } from '../data/products';

// Interface define o formato do item no carrinho
export interface CartItem extends Product {
  selectedSize: string;
  cartId: string;
  quantity: number; // OBRIGATÓRIO: Campo de quantidade
}

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([]);
  const isDrawerOpen = ref(false);

  // Ação de adicionar (Recebe product, size E quantity)
  const addToCart = (product: Product, size: string, quantity: number) => {
    
    // Verifica se já existe esse item com mesmo tamanho no carrinho
    const existingItem = items.value.find(item => item.id === product.id && item.selectedSize === size);

    if (existingItem) {
      // Se já existe, apenas soma a quantidade
      existingItem.quantity += quantity;
    } else {
      // Se não existe, cria um novo
      const newItem: CartItem = {
        ...product,
        selectedSize: size,
        quantity: quantity, // Salva a quantidade escolhida
        cartId: `${product.id}-${size}-${Date.now()}`
      };
      items.value.push(newItem);
    }
    
    isDrawerOpen.value = true; // Abre o carrinho
  };

  const removeFromCart = (cartId: string) => {
    items.value = items.value.filter(item => item.cartId !== cartId);
  };

  // Calcula o total considerando as quantidades
  const total = computed(() => {
    return items.value.reduce((acc, item) => acc + (item.price * (item.quantity || 1)), 0);
  });

  const count = computed(() => items.value.length);

  const toggleDrawer = () => {
    isDrawerOpen.value = !isDrawerOpen.value;
  }

  const checkoutViaWhatsApp = () => {
    if (items.value.length === 0) return;

    const phoneNumber = "5511962209599"; // SEU NÚMERO AQUI
    
    let message = `Olá Almeida Modas! Gostaria de finalizar o seguinte pedido:\n\n`;
    
    items.value.forEach((item, index) => {
      // Usa || 1 como segurança caso quantity venha vazio
      const qtd = item.quantity || 1;
      const totalItem = (item.price * qtd).toFixed(2);
      
      message += `${index + 1}. *(${qtd}x) ${item.name}*\n   Tamanho: ${item.selectedSize}\n   Valor: R$ ${totalItem}\n\n`;
    });

    message += `--------------------\n*TOTAL FINAL: R$ ${total.value.toFixed(2)}*`;

    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return { 
    items, 
    addToCart, 
    removeFromCart, 
    total, 
    count, 
    checkoutViaWhatsApp,
    isDrawerOpen,
    toggleDrawer
  };
});
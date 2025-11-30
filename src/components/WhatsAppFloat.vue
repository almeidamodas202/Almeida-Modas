<script setup lang="ts">
import { MessageCircle } from 'lucide-vue-next';
</script>

<template>
  <a 
    href="https://wa.me/5511962209599" 
    target="_blank"
    class="fixed bottom-6 right-6 bg-green-500 text-white p-4 rounded-full shadow-2xl hover:bg-green-600 transition-all hover:-translate-y-1 z-40 flex items-center justify-center group"
    title="Falar com vendedor"
  >
    <MessageCircle :size="28" class="group-hover:scale-110 transition-transform" />
    <span class="absolute right-full mr-3 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
      Fale Conosco
    </span>
  </a>
</template>
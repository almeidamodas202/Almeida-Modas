export interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  image: string;
  category: string;
  sizes: string[];
  stock: number; // NOVO CAMPO
}

export const products: Product[] = [
  {
    id: 1,
    name: "Vestido Floral Verão",
    price: 159.90,
    description: "Tecido leve e fluido, perfeito para dias quentes. Estampa exclusiva floral com fundo claro.",
    image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=500&q=80",
    category: "Vestidos",
    sizes: ['P', 'M', 'G'],
    stock: 10 // Temos 10 unidades
  },
  {
    id: 2,
    name: "Blusa Social Branca",
    price: 89.90,
    description: "Essencial para o guarda-roupa. Corte moderno e tecido que não amassa fácil.",
    image: "https://images.unsplash.com/photo-1598532163474-6864f9cf17ab?auto=format&fit=crop&w=500&q=80",
    category: "Blusas",
    sizes: ['P', 'M', 'G', 'GG'],
    stock: 5 // Temos 5 unidades
  },
  {
    id: 3,
    name: "Calça Jeans Skinny (Esgotada)",
    price: 199.90,
    description: "Jeans com elastano que modela o corpo com conforto total. Lavagem escura.",
    image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=500&q=80",
    category: "Calças",
    sizes: ['36', '38', '40', '42', '44'],
    stock: 0 // PRODUTO DE TESTE SEM ESTOQUE
  },
  {
    id: 4,
    name: "Jaqueta de Couro Eco",
    price: 329.90,
    description: "Estilo e atitude. Jaqueta em material sintético de alta durabilidade com zíperes reforçados.",
    image: "https://images.unsplash.com/photo-1520975954732-35dd22299614?auto=format&fit=crop&w=500&q=80",
    category: "Casacos",
    sizes: ['P', 'M', 'G'],
    stock: 2 // Só tem 2 unidades (Últimas peças)
  }
];
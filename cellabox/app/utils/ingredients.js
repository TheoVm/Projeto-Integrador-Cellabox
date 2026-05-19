export const DEFAULT_INGREDIENTS = [
  { id: 'i1', nome: 'Chocolate', valor: 45.0 },
  { id: 'i2', nome: 'Farinha', valor: 12.5 },
  { id: 'i3', nome: 'Açúcar', valor: 8.75 },
];

const STORAGE_KEY = 'cellabox_ingredientes';

export function normalizeName(value = '') {
  return value.trim().toLowerCase();
}

export function getStoredIngredients() {
  if (typeof window === 'undefined') return DEFAULT_INGREDIENTS;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : DEFAULT_INGREDIENTS;
  } catch (error) {
    console.error('Erro ao ler ingredientes locais:', error);
    return DEFAULT_INGREDIENTS;
  }
}

export function saveStoredIngredients(items) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function calculateIngredientCost(ingredient, allIngredients) {
  const found = allIngredients.find(
    (item) => normalizeName(item.nome) === normalizeName(ingredient.nome)
  );
  const valorKg = Number(found?.valor || ingredient.valorKg || 0);
  const quantidadeGramas = Number(ingredient.quantidade || 0);

  return {
    valorKg,
    custo: (valorKg / 1000) * quantidadeGramas,
  };
}

export function calculateProductCost(ingredients = [], allIngredients = []) {
  return ingredients.reduce((sum, ingredient) => {
    return sum + calculateIngredientCost(ingredient, allIngredients).custo;
  }, 0);
}

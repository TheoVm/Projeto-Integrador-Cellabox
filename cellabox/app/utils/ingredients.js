export const DEFAULT_INGREDIENTS = [
  { id: 'i1', nome: 'Chocolate', valor: 45.0, unidadeMedida: 'kg' },
  { id: 'i2', nome: 'Farinha', valor: 12.5, unidadeMedida: 'kg' },
  { id: 'i3', nome: 'Açúcar', valor: 8.75, unidadeMedida: 'kg' },
];

const STORAGE_KEY = 'cellabox_ingredientes';

export function normalizeName(value = '') {
  return value.trim().toLowerCase();
}

export function normalizeMeasure(value = '') {
  if (value === 'un' || value === 'unidade' || value === 'unidades') return 'unidade';
  return 'kg';
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
  const unidadeMedida = normalizeMeasure(ingredient.unidadeMedida || found?.unidadeMedida || found?.medida);
  const unidadeUso = ingredient.unidade === 'un' ? 'unidade' : ingredient.unidade;
  const valor = Number(found?.valor || ingredient.valorKg || ingredient.valorUnidade || 0);
  const quantidade = Number(ingredient.quantidade || 0);
  const quantidadeGramas = unidadeUso === 'kg' ? quantidade * 1000 : quantidade;
  const custo = unidadeMedida === 'unidade' ? valor * quantidade : (valor / 1000) * quantidadeGramas;

  return {
    valorKg: unidadeMedida === 'kg' ? valor : 0,
    valorUnidade: unidadeMedida === 'unidade' ? valor : 0,
    unidadeMedida,
    custo,
  };
}

export function calculateProductCost(ingredients = [], allIngredients = []) {
  return ingredients.reduce((sum, ingredient) => {
    return sum + calculateIngredientCost(ingredient, allIngredients).custo;
  }, 0);
}

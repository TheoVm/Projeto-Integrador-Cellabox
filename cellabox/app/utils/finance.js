import { calculateProductCost } from './ingredients';

function monthKeyFromDate(value) {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) return monthKeyFromDate(new Date());
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function monthLabelFromKey(key) {
  const [year, month] = key.split('-').map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString('pt-BR', {
    month: 'short',
    year: '2-digit',
  });
}

function addMonth(map, key) {
  if (!map[key]) {
    map[key] = { label: monthLabelFromKey(key), receita: 0, gastos: 0, custos: 0, lucro: 0 };
  }
  return map[key];
}

function getRecentMonthKeys(existingKeys, minimumMonths = 6) {
  const now = new Date();
  const keys = new Set(existingKeys);

  for (let index = minimumMonths - 1; index >= 0; index -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - index, 1);
    keys.add(monthKeyFromDate(date));
  }

  return Array.from(keys).sort();
}

export function calculateSoldItemCost(item, produtosMap, ingredientesBase) {
  const produto = produtosMap[item.productId || item.produtoId || item.id];
  const productCost = produto
    ? calculateProductCost(produto.ingredientes || [], ingredientesBase) || Number(produto.custoProducao || produto.custo || 0)
    : Number(item.custo || 0);
  const packagingCost = Number(item.embalagemCusto || 0);
  const quantity = Number(item.quantidade || item.qtd || 1);

  return (productCost + packagingCost) * quantity;
}

export function buildMonthlyFinanceSeries({ pedidos = [], gastos = [], produtosMap = {}, ingredientesBase = [] }) {
  const months = {};

  pedidos.forEach((pedido) => {
    const key = monthKeyFromDate(pedido.createdAt || pedido.date);
    const month = addMonth(months, key);
    month.receita += Number(pedido.total || pedido.valorTotal || pedido.totalPedido || 0);
    month.custos += (pedido.items || []).reduce((sum, item) => (
      sum + calculateSoldItemCost(item, produtosMap, ingredientesBase)
    ), 0);
  });

  gastos.forEach((gasto) => {
    const key = monthKeyFromDate(gasto.createdAt || gasto.data || gasto.date);
    const month = addMonth(months, key);
    month.gastos += Number(gasto.valor || gasto.value || 0);
  });

  return getRecentMonthKeys(Object.keys(months)).map((key) => {
    const month = addMonth(months, key);
    return {
      ...month,
      lucro: month.receita - month.gastos - month.custos,
    };
  });
}

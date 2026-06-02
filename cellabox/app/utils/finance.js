import { getCombinationPricing } from './pricing';

function firstNumber(...values) {
  const found = values.find((value) => value !== undefined && value !== null && value !== '');
  const number = Number(found || 0);
  return Number.isFinite(number) ? number : 0;
}

function getProductFromItem(item, produtosMap) {
  return produtosMap[item.productId || item.produtoId || item.id] || null;
}

function getItemPackaging(item, produto) {
  const embalagemId = item.embalagemId || item.packageId;
  return (produto?.embalagens || []).find((embalagem) => (
    (embalagem.objectId || embalagem.id || embalagem.nome) === embalagemId
  ));
}

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

function sameMonth(date, month, year) {
  return date.getFullYear() === year && date.getMonth() === month;
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
  const snapshotFinalCost = firstNumber(item.custoTotalProducao, item.custoProducao);
  const quantity = firstNumber(item.quantidade, item.qtd, 1) || 1;

  if (snapshotFinalCost) return snapshotFinalCost * quantity;

  const produto = getProductFromItem(item, produtosMap);
  const embalagem = getItemPackaging(item, produto);
  const pricing = getCombinationPricing(produto || {}, embalagem || {}, ingredientesBase);
  const productCost = firstNumber(item.custoProduto, item.produtoCusto, item.custo) || pricing.custoBaseProduto;
  const packagingCost = firstNumber(item.embalagemCusto, item.custoEmbalagem) || pricing.custoEmbalagem;

  return (productCost + packagingCost) * quantity;
}

export function calculateSoldItemRevenue(item, produtosMap) {
  const produto = getProductFromItem(item, produtosMap);
  const embalagem = getItemPackaging(item, produto);
  const pricing = getCombinationPricing(produto || {}, embalagem || {});
  const unitPrice = firstNumber(item.valorVenda, item.preco, item.valorUnitario, item.precoUnitario, item.embalagemPreco) || pricing.valorVenda;
  const quantity = firstNumber(item.quantidade, item.qtd, 1) || 1;

  return unitPrice * quantity;
}

export function calculateSoldItemBreakdown(item, produtosMap = {}, ingredientesBase = []) {
  const produto = getProductFromItem(item, produtosMap);
  const embalagem = getItemPackaging(item, produto);
  const pricing = getCombinationPricing(produto || {}, embalagem || {}, ingredientesBase);
  const quantity = firstNumber(item.quantidade, item.qtd, 1) || 1;
  const custoProduto = firstNumber(item.custoProduto, item.produtoCusto, item.custo) || pricing.custoBaseProduto;
  const custoEmbalagem = firstNumber(item.embalagemCusto, item.custoEmbalagem) || pricing.custoEmbalagem;
  const custoUnitario = firstNumber(item.custoTotalProducao, item.custoProducao) || custoProduto + custoEmbalagem;
  const valorVenda = firstNumber(item.valorVenda, item.preco, item.valorUnitario, item.precoUnitario, item.embalagemPreco) || pricing.valorVenda;

  return {
    nomeProduto: item.nome || produto?.nome || 'Produto',
    nomeEmbalagem: item.embalagemNome || embalagem?.nome || 'Embalagem',
    quantidade: quantity,
    custoProduto,
    custoEmbalagem,
    custoUnitario,
    valorVenda,
    totalCustoProduto: custoProduto * quantity,
    totalCustoEmbalagem: custoEmbalagem * quantity,
    totalCusto: custoUnitario * quantity,
    totalVenda: valorVenda * quantity,
    lucro: (valorVenda - custoUnitario) * quantity,
  };
}

export function calculateOrderRevenue(pedido, produtosMap = {}) {
  const itemRevenue = (pedido.items || []).reduce((sum, item) => (
    sum + calculateSoldItemRevenue(item, produtosMap)
  ), 0);

  return itemRevenue || firstNumber(pedido.total, pedido.valorTotal, pedido.totalPedido, pedido.valor);
}

export function calculateOrderCost(pedido, produtosMap = {}, ingredientesBase = []) {
  return (pedido.items || []).reduce((sum, item) => (
    sum + calculateSoldItemCost(item, produtosMap, ingredientesBase)
  ), 0);
}

export function calculateExpenseValue(gasto) {
  return firstNumber(gasto.valor, gasto.value, gasto.total);
}

export function buildMonthlyFinanceSeries({ pedidos = [], gastos = [], produtosMap = {}, ingredientesBase = [] }) {
  const months = {};

  pedidos.forEach((pedido) => {
    const key = monthKeyFromDate(pedido.createdAt || pedido.date);
    const month = addMonth(months, key);
    month.receita += calculateOrderRevenue(pedido, produtosMap);
    month.custos += calculateOrderCost(pedido, produtosMap, ingredientesBase);
  });

  gastos.forEach((gasto) => {
    const key = monthKeyFromDate(gasto.createdAt || gasto.data || gasto.date);
    const month = addMonth(months, key);
    month.gastos += calculateExpenseValue(gasto);
  });

  return getRecentMonthKeys(Object.keys(months)).map((key) => {
    const month = addMonth(months, key);
    const gastosGerais = month.gastos + month.custos;
    return {
      ...month,
      gastosLancados: month.gastos,
      gastos: gastosGerais,
      lucro: month.receita - gastosGerais,
    };
  });
}

export function buildDailyFinanceSeries({
  pedidos = [],
  gastos = [],
  produtosMap = {},
  ingredientesBase = [],
  month,
  year,
}) {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, index) => ({
    label: String(index + 1).padStart(2, '0'),
    receita: 0,
    gastos: 0,
    custos: 0,
    lucro: 0,
  }));

  pedidos.forEach((pedido) => {
    const date = new Date(pedido.createdAt || pedido.date || pedido.data || Date.now());
    if (!sameMonth(date, month, year)) return;

    const day = days[date.getDate() - 1];
    day.receita += calculateOrderRevenue(pedido, produtosMap);
    day.custos += calculateOrderCost(pedido, produtosMap, ingredientesBase);
  });

  gastos.forEach((gasto) => {
    const date = new Date(gasto.createdAt || gasto.data || gasto.date || Date.now());
    if (!sameMonth(date, month, year)) return;

    const day = days[date.getDate() - 1];
    day.gastos += calculateExpenseValue(gasto);
  });

  return days.map((day) => ({
    ...day,
    gastosLancados: day.gastos,
    gastos: day.gastos + day.custos,
    lucro: day.receita - (day.gastos + day.custos),
  }));
}

export function getAvailableFinancePeriods({ pedidos = [], gastos = [] }) {
  const periods = new Map();

  [...pedidos, ...gastos].forEach((item) => {
    const date = new Date(item.createdAt || item.data || item.date || Date.now());
    if (Number.isNaN(date.getTime())) return;
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    periods.set(key, { year: date.getFullYear(), month: date.getMonth() });
  });

  const now = new Date();
  const currentKey = `${now.getFullYear()}-${now.getMonth()}`;
  periods.set(currentKey, { year: now.getFullYear(), month: now.getMonth() });

  return Array.from(periods.values()).sort((a, b) => (
    a.year === b.year ? a.month - b.month : a.year - b.year
  ));
}

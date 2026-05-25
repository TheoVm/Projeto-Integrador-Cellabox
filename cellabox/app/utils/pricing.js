import { calculateProductCost } from './ingredients';

export function toCurrencyNumber(value) {
  const number = Number(value ?? 0);
  return Number.isFinite(number) ? number : 0;
}

export function getProductBaseCost(produto = {}, ingredientesBase = []) {
  const storedCost = toCurrencyNumber(produto.custoProducao ?? produto.custo);
  if (storedCost) return storedCost;
  return calculateProductCost(produto.ingredientes || [], ingredientesBase);
}

export function getPackagingCost(embalagem = {}) {
  return toCurrencyNumber(embalagem.custoEmbalagem ?? embalagem.custo ?? embalagem.custoProducao);
}

export function getCombinationSalePrice(embalagem = {}) {
  return toCurrencyNumber(embalagem.valorVenda ?? embalagem.precoVenda ?? embalagem.valor);
}

export function getCombinationPricing(produto = {}, embalagem = {}, ingredientesBase = []) {
  const custoBaseProduto = toCurrencyNumber(embalagem.custoIngredientes) || getProductBaseCost(produto, ingredientesBase);
  const custoEmbalagem = getPackagingCost(embalagem);
  const hasCombinationCost = embalagem.custoIngredientes !== undefined
    || embalagem.custoEmbalagem !== undefined
    || embalagem.custoTotalProducao !== undefined;
  const custoFinalProducao = hasCombinationCost
    ? toCurrencyNumber(embalagem.custoTotalProducao) || toCurrencyNumber(embalagem.custoProducao) || custoBaseProduto + custoEmbalagem
    : custoBaseProduto + custoEmbalagem;
  const valorVenda = getCombinationSalePrice(embalagem);

  return {
    nomeProduto: produto.nome || '',
    nomeEmbalagem: embalagem.nome || '',
    custoBaseProduto,
    custoEmbalagem,
    custoFinalProducao,
    valorVenda,
    lucroEstimado: valorVenda - custoFinalProducao,
  };
}

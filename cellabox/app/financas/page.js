"use client";

import { useEffect, useMemo, useState } from 'react';
import styles from './page.module.css';

import {
  getPedidos,
  getGastos,
  getProdutos,
  getIngredientes,
  createGasto,
} from '@/services/back4app';

import FinancialCard from '../components/FinancialCard';
import FinanceChart from '../components/FinanceChart';
import ExpenseTable from '../components/ExpenseTable';
import compStyles from '../components/finance.module.css';
import pageStyles from './page.module.css';
import {
  buildDailyFinanceSeries,
  calculateExpenseValue,
  calculateOrderCost,
  calculateOrderRevenue,
  calculateSoldItemBreakdown,
  getAvailableFinancePeriods,
} from '../utils/finance';
import { useToast } from '../components/ToastProvider';

export default function Financas() {
  const toast = useToast();
  const [pedidos, setPedidos] = useState([]);
  const [gastos, setGastos] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [ingredientesBase, setIngredientesBase] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expenseNome, setExpenseNome] = useState('');
  const [expenseDescricao, setExpenseDescricao] = useState('');
  const [expenseValor, setExpenseValor] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear());
  const [selectedSale, setSelectedSale] = useState(null);

  useEffect(() => {
    carregarTudo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function carregarTudo() {
    setLoading(true);
    try {
      const [pedidosData, gastosData, produtosData, ingredientesData] = await Promise.all([
        getPedidos(),
        getGastos(),
        getProdutos(),
        getIngredientes(),
      ]);

      setPedidos(pedidosData || []);
      setGastos(gastosData || []);
      setProdutos(produtosData || []);
      setIngredientesBase((ingredientesData || []).map((item) => ({
        id: item.objectId || item.id,
        nome: item.nome,
        valor: Number(item.valor || 0),
      })));
    } catch (error) {
      console.error(error);
      toast.error('Não foi possível carregar os dados financeiros.');
    } finally {
      setLoading(false);
    }
  }

  const produtosMap = useMemo(() => {
    const map = {};
    (produtos || []).forEach((produto) => {
      map[produto.objectId || produto.id] = produto;
    });
    return map;
  }, [produtos]);

  const receitaTotal = useMemo(() => {
    return (pedidos || []).reduce((sum, pedido) => (
      sum + calculateOrderRevenue(pedido, produtosMap)
    ), 0);
  }, [pedidos, produtosMap]);

  const gastosLancados = useMemo(() => {
    return (gastos || []).reduce((sum, gasto) => sum + calculateExpenseValue(gasto), 0);
  }, [gastos]);

  const custoProdutos = useMemo(() => {
    return (pedidos || []).reduce((sum, pedido) => (
      sum + calculateOrderCost(pedido, produtosMap, ingredientesBase)
    ), 0);
  }, [pedidos, produtosMap, ingredientesBase]);

  const gastosTotais = gastosLancados + custoProdutos;
  const lucroTotal = receitaTotal - gastosTotais;

  const availablePeriods = useMemo(() => {
    return getAvailableFinancePeriods({ pedidos, gastos });
  }, [pedidos, gastos]);

  const monthOptions = useMemo(() => {
    return Array.from({ length: 12 }, (_, month) => ({
      value: month,
      label: new Date(selectedYear, month, 1).toLocaleDateString('pt-BR', { month: 'long' }),
    }));
  }, [selectedYear]);

  const yearOptions = useMemo(() => {
    const years = new Set(availablePeriods.map((period) => period.year));
    years.add(new Date().getFullYear());
    return Array.from(years).sort((a, b) => b - a);
  }, [availablePeriods]);

  const series = useMemo(() => {
    return buildDailyFinanceSeries({
      pedidos,
      gastos,
      produtosMap,
      ingredientesBase,
      month: selectedMonth,
      year: selectedYear,
    });
  }, [pedidos, gastos, produtosMap, ingredientesBase, selectedMonth, selectedYear]);

  const vendasDetalhadas = useMemo(() => {
    return (pedidos || []).map((pedido) => {
      const items = pedido.items || [];
      const total = calculateOrderRevenue(pedido, produtosMap);
      const custo = calculateOrderCost(pedido, produtosMap, ingredientesBase);
      return {
        ...pedido,
        totalCalculado: total,
        custoCalculado: custo,
        lucroCalculado: total - custo,
        quantidadeItens: items.reduce((sum, item) => sum + Number(item.quantidade || item.qtd || 1), 0),
      };
    });
  }, [pedidos, produtosMap, ingredientesBase]);

  const selectedSaleBreakdown = useMemo(() => {
    if (!selectedSale) return null;
    const itens = (selectedSale.items || []).map((item) => (
      calculateSoldItemBreakdown(item, produtosMap, ingredientesBase)
    ));
    const totalVenda = itens.reduce((sum, item) => sum + item.totalVenda, 0) || calculateOrderRevenue(selectedSale, produtosMap);
    const totalCustoProduto = itens.reduce((sum, item) => sum + item.totalCustoProduto, 0);
    const totalCustoEmbalagem = itens.reduce((sum, item) => sum + item.totalCustoEmbalagem, 0);
    const totalCusto = itens.reduce((sum, item) => sum + item.totalCusto, 0);

    return {
      itens,
      totalVenda,
      totalCustoProduto,
      totalCustoEmbalagem,
      totalCusto,
      lucro: totalVenda - totalCusto,
    };
  }, [selectedSale, produtosMap, ingredientesBase]);

  function formatDate(date) {
    return date ? new Date(date).toLocaleDateString('pt-BR') : '-';
  }

  async function handleAddExpense() {
    if (!expenseNome || !expenseValor || Number(expenseValor) <= 0) {
      toast.error('Preencha nome e valor positivo para o gasto.', 'Validação');
      return;
    }

    try {
      await createGasto({ nome: expenseNome, descricao: expenseDescricao, valor: Number(expenseValor) });
      setExpenseNome('');
      setExpenseDescricao('');
      setExpenseValor('');
      setShowExpenseModal(false);
      await carregarTudo();
      toast.success('Gasto adicionado com sucesso.');
    } catch (error) {
      console.error(error);
      toast.error('Erro ao salvar gasto.');
    }
  }

  return (
    <main className={styles.mainContainer}>
      <div className={styles.pageHeader}>
        <div>
          <h2>Finanças</h2>
          <p>Acompanhe receitas, gastos e lucro estimado por pedido.</p>
        </div>
        {loading && <span className={styles.status}>Atualizando...</span>}
      </div>

      <div className={compStyles.cards}>
        <FinancialCard title="Receita Total" value={receitaTotal} />
        <FinancialCard title="Gastos Totais" value={gastosTotais} />
        <FinancialCard title="Lucro Total" value={lucroTotal} />
        <FinancialCard title="Quantidade de Pedidos" value={pedidos.length} subtitle={`${pedidos.length} pedidos`} format="number" />
      </div>

      <div className={pageStyles.layoutGrid}>
        <div className={pageStyles.chartArea}>
          <div className={pageStyles.chartHeader}>
            <div>
              <h3>Lucro e gastos por dia</h3>
              <p>Receita, gastos gerais e lucro diário do mês selecionado.</p>
            </div>
            <div className={pageStyles.chartFilters}>
              <select value={selectedMonth} onChange={(event) => setSelectedMonth(Number(event.target.value))}>
                {monthOptions.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
              <select value={selectedYear} onChange={(event) => setSelectedYear(Number(event.target.value))}>
                {yearOptions.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <FinanceChart series={series} />
        </div>

        <aside className={pageStyles.sideArea}>
          <div className={pageStyles.sideHeader}>
            <h3>Gastos Recentes</h3>
            <div className={pageStyles.sideActions}>
              <button className={pageStyles.actionButton} onClick={() => setShowExpenseModal(true)}>+ Novo Gasto</button>
            </div>
          </div>

          <ExpenseTable items={gastos.slice(0, 8)} />
        </aside>
      </div>

      <section className={pageStyles.salesSection}>
        <div className={pageStyles.salesHeader}>
          <div>
            <h3>Tabela de vendas</h3>
            <p>Todas as vendas registradas com total, custo e lucro estimado.</p>
          </div>
          <span>{vendasDetalhadas.length} vendas</span>
        </div>

        <div className={pageStyles.salesTable}>
          <div className={pageStyles.salesTableHeader}>
            <span>Cliente</span>
            <span>Data</span>
            <span>Itens</span>
            <span>Total</span>
            <span>Custo</span>
            <span>Lucro</span>
          </div>

          {vendasDetalhadas.length === 0 ? (
            <div className={pageStyles.emptySales}>Nenhuma venda registrada.</div>
          ) : vendasDetalhadas.map((pedido) => (
            <button
              key={pedido.objectId || pedido.id}
              className={pageStyles.salesRow}
              onClick={() => setSelectedSale(pedido)}
            >
              <span>{pedido.clienteNome || 'Cliente'}</span>
              <span>{formatDate(pedido.createdAt || pedido.data || pedido.date)}</span>
              <span>{pedido.quantidadeItens}</span>
              <strong>R$ {pedido.totalCalculado.toFixed(2)}</strong>
              <strong>R$ {pedido.custoCalculado.toFixed(2)}</strong>
              <strong>R$ {pedido.lucroCalculado.toFixed(2)}</strong>
            </button>
          ))}
        </div>
      </section>

      {showExpenseModal && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <h3>Novo Gasto</h3>
            <input placeholder="Nome" value={expenseNome} onChange={(e) => setExpenseNome(e.target.value)} />
            <input placeholder="Descrição" value={expenseDescricao} onChange={(e) => setExpenseDescricao(e.target.value)} />
            <div className={styles.inputGroup}>
              <span>R$</span>
              <input type="number" value={expenseValor} onChange={(e) => setExpenseValor(e.target.value)} />
            </div>

            <div className={styles.modalActions}>
              <button onClick={() => setShowExpenseModal(false)}>Cancelar</button>
              <button className={styles.saveButton} onClick={handleAddExpense}>Salvar</button>
            </div>
          </div>
        </div>
      )}

      {selectedSale && selectedSaleBreakdown && (
        <div className={styles.overlay}>
          <div className={`${styles.modal} ${pageStyles.saleModal}`}>
            <div className={pageStyles.saleModalHeader}>
              <div>
                <h3>Detalhes da venda</h3>
                <p>{selectedSale.clienteNome || 'Cliente'} · {formatDate(selectedSale.createdAt || selectedSale.data || selectedSale.date)}</p>
              </div>
              <button onClick={() => setSelectedSale(null)}>Fechar</button>
            </div>

            <div className={pageStyles.saleSummary}>
              <div>
                <span>Total da venda</span>
                <strong>R$ {selectedSaleBreakdown.totalVenda.toFixed(2)}</strong>
              </div>
              <div>
                <span>Custo produtos</span>
                <strong>R$ {selectedSaleBreakdown.totalCustoProduto.toFixed(2)}</strong>
              </div>
              <div>
                <span>Custo embalagens</span>
                <strong>R$ {selectedSaleBreakdown.totalCustoEmbalagem.toFixed(2)}</strong>
              </div>
              <div>
                <span>Lucro estimado</span>
                <strong>R$ {selectedSaleBreakdown.lucro.toFixed(2)}</strong>
              </div>
            </div>

            <div className={pageStyles.saleItems}>
              <div className={pageStyles.saleItemHeader}>
                <span>Produto</span>
                <span>Qtd</span>
                <span>Produto</span>
                <span>Embalagem</span>
                <span>Total</span>
              </div>
              {selectedSaleBreakdown.itens.map((item, index) => (
                <div key={`${item.nomeProduto}-${index}`} className={pageStyles.saleItemRow}>
                  <span>
                    <strong>{item.nomeProduto}</strong>
                    <small>{item.nomeEmbalagem}</small>
                  </span>
                  <span>{item.quantidade}</span>
                  <span>R$ {item.totalCustoProduto.toFixed(2)}</span>
                  <span>R$ {item.totalCustoEmbalagem.toFixed(2)}</span>
                  <strong>R$ {item.totalVenda.toFixed(2)}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

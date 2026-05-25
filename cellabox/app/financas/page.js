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

  const gastosTotais = useMemo(() => {
    return (gastos || []).reduce((sum, gasto) => sum + calculateExpenseValue(gasto), 0);
  }, [gastos]);

  const custoProdutos = useMemo(() => {
    return (pedidos || []).reduce((sum, pedido) => (
      sum + calculateOrderCost(pedido, produtosMap, ingredientesBase)
    ), 0);
  }, [pedidos, produtosMap, ingredientesBase]);

  const lucroTotal = receitaTotal - gastosTotais - custoProdutos;

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
              <p>Receita, gastos e lucro diário do mês selecionado.</p>
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
    </main>
  );
}

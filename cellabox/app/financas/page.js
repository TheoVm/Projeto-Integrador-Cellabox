"use client";

import { useEffect, useMemo, useState } from 'react';
import styles from './page.module.css';

import {
  getPedidos,
  getGastos,
  getProdutos,
  createGasto,
} from '@/services/back4app';

import FinancialCard from '../components/FinancialCard';
import FinanceChart from '../components/FinanceChart';
import ExpenseTable from '../components/ExpenseTable';
import compStyles from '../components/finance.module.css';
import pageStyles from './page.module.css';
import { calculateProductCost, getStoredIngredients } from '../utils/ingredients';

export default function Financas() {
  const [pedidos, setPedidos] = useState([]);
  const [gastos, setGastos] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [ingredientesBase, setIngredientesBase] = useState([]);

  const [loading, setLoading] = useState(false);

  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expenseNome, setExpenseNome] = useState('');
  const [expenseDescricao, setExpenseDescricao] = useState('');
  const [expenseValor, setExpenseValor] = useState('');

  

  useEffect(() => {
    carregarTudo();
  }, []);

  async function carregarTudo() {
    setLoading(true);
    setIngredientesBase(getStoredIngredients());
    const [p, g, pr] = await Promise.all([getPedidos(), getGastos(), getProdutos()]);
    setPedidos(p || []);
    setGastos(g || []);
    setProdutos(pr || []);
    setLoading(false);
  }

  const produtosMap = useMemo(() => {
    const m = {};
    (produtos || []).forEach((p) => { m[p.objectId || p.id] = p; });
    return m;
  }, [produtos]);

  const receitaTotal = useMemo(() => {
    return (pedidos || []).reduce((sum, ped) => {
      const t = ped.total || ped.valorTotal || ped.totalPedido || 0;
      return sum + Number(t || 0);
    }, 0);
  }, [pedidos]);

  const gastosTotais = useMemo(() => {
    return (gastos || []).reduce((sum, g) => sum + Number(g.valor || g.value || 0), 0);
  }, [gastos]);

  const custoProdutos = useMemo(() => {
    // calcula custo com base no custoProducao dos produtos
    return (pedidos || []).reduce((sum, ped) => {
      const items = ped.items || [];
      if (!items.length) return sum;
      const parcial = items.reduce((s, it) => {
        const prod = produtosMap[it.productId || it.produtoId || it.id];
        const custo = prod
          ? calculateProductCost(prod.ingredientes || [], ingredientesBase) || Number(prod.custoProducao || prod.custo || 0)
          : 0;
        const embalagemCusto = Number(it.embalagemCusto || 0);
        return s + (custo + embalagemCusto) * Number(it.quantidade || it.qtd || 1);
      }, 0);
      return sum + parcial;
    }, 0);
  }, [pedidos, produtosMap, ingredientesBase]);

  const lucroTotal = receitaTotal - gastosTotais - custoProdutos;

  const series = useMemo(() => {
    const map = {};
    function keyFrom(dateStr) {
      const d = new Date(dateStr);
      const m = d.getMonth() + 1;
      const y = d.getFullYear();
      return `${y}-${String(m).padStart(2,'0')}`;
    }

    (pedidos || []).forEach((p) => {
      const k = keyFrom(p.createdAt || p.date || new Date());
      map[k] = map[k] || { receita: 0, gastos: 0 };
      map[k].receita += Number(p.total || p.valorTotal || 0);
    });

    (gastos || []).forEach((g) => {
      const k = keyFrom(g.createdAt || g.date || new Date());
      map[k] = map[k] || { receita: 0, gastos: 0 };
      map[k].gastos += Number(g.valor || g.value || 0);
    });

    const keys = Object.keys(map).sort();
    return keys.map((k) => ({ label: k, receita: map[k].receita, gastos: map[k].gastos }));
  }, [pedidos, gastos]);

  async function handleAddExpense() {
    if (!expenseNome || !expenseValor) return alert('Preencha nome e valor');
    try {
      await createGasto({ nome: expenseNome, descricao: expenseDescricao, valor: Number(expenseValor) });
      setExpenseNome(''); setExpenseDescricao(''); setExpenseValor(''); setShowExpenseModal(false);
      carregarTudo();
    } catch (e) {
      console.error(e); alert('Erro ao salvar gasto');
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
          <FinanceChart series={series} />
        </div>

        <aside className={pageStyles.sideArea}>
          <div className={pageStyles.sideHeader}>
            <h3>Gastos Recentes</h3>
            <div className={pageStyles.sideActions}>
              <button className={pageStyles.actionButton} onClick={() => setShowExpenseModal(true)}>+ Novo Gasto</button>
            </div>
          </div>

          <ExpenseTable items={gastos.slice(0,8)} />
        </aside>
      </div>

      {showExpenseModal && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <h3>Novo Gasto</h3>
            <input placeholder="Nome" value={expenseNome} onChange={(e)=>setExpenseNome(e.target.value)} />
            <input placeholder="Descrição" value={expenseDescricao} onChange={(e)=>setExpenseDescricao(e.target.value)} />
            <div className={styles.inputGroup}>
              <span>R$</span>
              <input type="number" value={expenseValor} onChange={(e)=>setExpenseValor(e.target.value)} />
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

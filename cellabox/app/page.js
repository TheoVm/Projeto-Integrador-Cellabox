'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { getClientes, getGastos, getPedidos, getProdutos } from '@/services/back4app';
import styles from './page.module.css';

export default function Home() {
  const [clientes, setClientes] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [gastos, setGastos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregar() {
      setLoading(true);
      const [clientesData, produtosData, pedidosData, gastosData] = await Promise.all([
        getClientes(),
        getProdutos(),
        getPedidos(),
        getGastos(),
      ]);
      setClientes(clientesData || []);
      setProdutos(produtosData || []);
      setPedidos(pedidosData || []);
      setGastos(gastosData || []);
      setLoading(false);
    }

    carregar();
  }, []);

  const resumo = useMemo(() => {
    const receita = pedidos.reduce((sum, pedido) => sum + Number(pedido.total || pedido.valorTotal || 0), 0);
    const despesas = gastos.reduce((sum, gasto) => sum + Number(gasto.valor || gasto.value || 0), 0);
    const ticketMedio = pedidos.length ? receita / pedidos.length : 0;

    return {
      receita,
      despesas,
      ticketMedio,
      lucro: receita - despesas,
    };
  }, [pedidos, gastos]);

  const recentes = pedidos.slice(0, 4);
  const formatDate = (date) => date ? new Date(date).toLocaleDateString('pt-BR') : '-';

  return (
    <main className={styles.main}>
      <section className={styles.hero}>
        <div>
          <span className={styles.eyebrow}>Painel operacional</span>
          <h1>Cella Box</h1>
          <p>
            Visão rápida de vendas, clientes, produtos e saúde financeira para tocar a operação sem sair do fluxo.
          </p>
        </div>
        <Link href="/vendas" className={styles.primaryAction}>Registrar venda</Link>
      </section>

      <section className={styles.metrics} aria-label="Resumo">
        <div>
          <span>Receita</span>
          <strong>R$ {resumo.receita.toFixed(2)}</strong>
        </div>
        <div>
          <span>Lucro estimado</span>
          <strong>R$ {resumo.lucro.toFixed(2)}</strong>
        </div>
        <div>
          <span>Ticket médio</span>
          <strong>R$ {resumo.ticketMedio.toFixed(2)}</strong>
        </div>
        <div>
          <span>Clientes</span>
          <strong>{clientes.length}</strong>
        </div>
      </section>

      <section className={styles.grid}>
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2>Atalhos</h2>
            {loading && <span>Atualizando...</span>}
          </div>
          <div className={styles.shortcuts}>
            <Link href="/clientes">Cadastrar cliente</Link>
            <Link href="/produtos-embalagens">Gerenciar produtos</Link>
            <Link href="/ingredientes">Atualizar ingredientes</Link>
            <Link href="/financas">Ver finanças</Link>
          </div>
        </div>

        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2>Pedidos recentes</h2>
            <span>{pedidos.length} no total</span>
          </div>
          <div className={styles.list}>
            {recentes.length === 0 ? (
              <p>Nenhum pedido registrado ainda.</p>
            ) : recentes.map((pedido) => (
              <div key={pedido.objectId || pedido.id} className={styles.orderRow}>
                <div>
                  <strong>{pedido.clienteNome || 'Cliente'}</strong>
                  <span>{formatDate(pedido.createdAt)}</span>
                </div>
                <strong>R$ {Number(pedido.total || 0).toFixed(2)}</strong>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2>Cadastro</h2>
            <span>{produtos.length} produtos</span>
          </div>
          <div className={styles.stockLine}>
            <span>Produtos cadastrados</span>
            <strong>{produtos.length}</strong>
          </div>
          <div className={styles.stockLine}>
            <span>Gastos lançados</span>
            <strong>{gastos.length}</strong>
          </div>
          <div className={styles.stockLine}>
            <span>Despesas</span>
            <strong>R$ {resumo.despesas.toFixed(2)}</strong>
          </div>
        </div>
      </section>
    </main>
  );
}

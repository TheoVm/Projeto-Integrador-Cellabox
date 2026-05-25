'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { getClientes, getPedidos, getProdutos, updateCliente } from '@/services/back4app';
import { calculateOrderRevenue } from '../utils/finance';
import { useToast } from '../components/ToastProvider';
import styles from './[id]/page.module.css';

function parseBrazilianDate(value) {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  if (!match) return null;
  const [, day, month, year] = match;
  const parsed = new Date(Number(year), Number(month) - 1, Number(day));
  if (
    parsed.getFullYear() !== Number(year)
    || parsed.getMonth() !== Number(month) - 1
    || parsed.getDate() !== Number(day)
  ) return null;
  return parsed;
}

function formatBirthdayInput(value = '') {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

function calculateAgeFromBirthday(value) {
  const birthday = parseBrazilianDate(value);
  if (!birthday) return '';

  const today = new Date();
  let age = today.getFullYear() - birthday.getFullYear();
  const birthdayThisYear = new Date(today.getFullYear(), birthday.getMonth(), birthday.getDate());
  if (today < birthdayThisYear) age -= 1;
  return age >= 0 ? age : '';
}

export default function ClienteDetalheClient({ clienteId }) {
  const toast = useToast();
  const [cliente, setCliente] = useState(null);
  const [pedidos, setPedidos] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editando, setEditando] = useState(false);
  const [form, setForm] = useState({
    nome: '',
    idade: '',
    aniversario: '',
    endereco: '',
  });

  useEffect(() => {
    carregarDados();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clienteId]);

  async function carregarDados() {
    setLoading(true);
    try {
      const [clientesData, pedidosData, produtosData] = await Promise.all([getClientes(), getPedidos(), getProdutos()]);
      const encontrado = clientesData.find((item) => (item.objectId || item.id) === clienteId);

      if (!encontrado) {
        setCliente(null);
        setPedidos([]);
        return;
      }

      setCliente(encontrado);
      setPedidos((pedidosData || []).filter((pedido) => pedido.clienteId === clienteId));
      setProdutos(produtosData || []);
      setForm({
        nome: encontrado.nome || '',
        idade: encontrado.idade || '',
        aniversario: encontrado.aniversario || '',
        endereco: encontrado.endereco || '',
      });
    } catch (error) {
      console.error(error);
      toast.error('Erro ao carregar cliente.');
    } finally {
      setLoading(false);
    }
  }

  const produtosMap = useMemo(() => {
    const produtosMap = {};
    produtos.forEach((produto) => {
      produtosMap[produto.objectId || produto.id] = produto;
    });
    return produtosMap;
  }, [produtos]);

  const receita = useMemo(() => {
    return pedidos.reduce((sum, pedido) => sum + calculateOrderRevenue(pedido, produtosMap), 0);
  }, [pedidos, produtosMap]);

  const ultimoPedido = pedidos[0];
  const pedidoFavorito = useMemo(() => {
    const contagem = {};

    pedidos.forEach((pedido) => {
      (pedido.items || []).forEach((item) => {
        if (!item.nome) return;
        contagem[item.nome] = (contagem[item.nome] || 0) + Number(item.quantidade || 1);
      });
    });

    return Object.entries(contagem).sort((a, b) => b[1] - a[1])[0]?.[0] || '-';
  }, [pedidos]);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function salvarAlteracoes() {
    if (!form.nome.trim()) {
      toast.error('Preencha o nome do cliente.', 'Validação');
      return;
    }

    const idadeCalculada = calculateAgeFromBirthday(form.aniversario);

    try {
      await updateCliente(clienteId, {
        nome: form.nome,
        idade: idadeCalculada === '' ? Number(form.idade || 0) : idadeCalculada,
        aniversario: form.aniversario,
        endereco: form.endereco,
      });
      toast.success('Cliente atualizado com sucesso.');
      setEditando(false);
      await carregarDados();
    } catch (error) {
      console.error(error);
      toast.error('Erro ao atualizar cliente.');
    }
  }

  if (loading) {
    return (
      <main className={styles.mainContainer}>
        <div className={styles.card}>Carregando cliente...</div>
      </main>
    );
  }

  if (!cliente) {
    return (
      <main className={styles.mainContainer}>
        <Link href="/clientes" className={styles.backLink}>Voltar</Link>
        <div className={styles.card}>Cliente não encontrado.</div>
      </main>
    );
  }

  return (
    <main className={styles.mainContainer}>
      <Link href="/clientes" className={styles.backLink}>Voltar</Link>

      <div className={styles.card}>
        <div className={styles.hero}>
          <div>
            {editando ? (
              <input
                className={styles.titleInput}
                value={form.nome}
                onChange={(event) => updateField('nome', event.target.value)}
              />
            ) : (
              <h1>{cliente.nome}</h1>
            )}
            <p>{form.endereco || 'Endereço não cadastrado.'}</p>
          </div>

          <div className={styles.actions}>
            {editando ? (
              <>
                <button className={styles.secondaryButton} onClick={() => setEditando(false)}>Cancelar</button>
                <button className={styles.primaryButton} onClick={salvarAlteracoes}>Salvar</button>
              </>
            ) : (
              <button className={styles.primaryButton} onClick={() => setEditando(true)}>Editar</button>
            )}
          </div>
        </div>

        <div className={styles.metrics}>
          <div>
            <span>Receita gerada</span>
            <strong>R$ {receita.toFixed(2)}</strong>
          </div>
          <div>
            <span>Total de pedidos</span>
            <strong>{pedidos.length}</strong>
          </div>
          <div>
            <span>Produto favorito</span>
            <strong>{pedidoFavorito}</strong>
          </div>
        </div>

        <div className={styles.contentGrid}>
          <section className={styles.panel}>
            <h2>Informações</h2>
            <div className={styles.infoRows}>
              <div>
                <span>Idade</span>
                {editando ? (
                  <input type="number" value={calculateAgeFromBirthday(form.aniversario) || form.idade} readOnly />
                ) : (
                  <strong>{form.idade || '-'}</strong>
                )}
              </div>
              <div>
                <span>Aniversário</span>
                {editando ? (
                  <input
                    value={form.aniversario}
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="dd/mm/aaaa"
                    onChange={(event) => updateField('aniversario', formatBirthdayInput(event.target.value))}
                  />
                ) : (
                  <strong>{form.aniversario || '-'}</strong>
                )}
              </div>
              <div>
                <span>Endereço</span>
                {editando ? (
                  <input value={form.endereco} onChange={(event) => updateField('endereco', event.target.value)} />
                ) : (
                  <strong>{form.endereco || '-'}</strong>
                )}
              </div>
              <div>
                <span>Último pedido</span>
                <strong>
                  {ultimoPedido
                    ? new Date(ultimoPedido.createdAt || ultimoPedido.date || Date.now()).toLocaleDateString('pt-BR')
                    : '-'}
                </strong>
              </div>
            </div>
          </section>

          <section className={styles.panel}>
            <h2>Últimos pedidos</h2>
            <div className={styles.ordersTable}>
              <div className={styles.orderHeader}>
                <span>Pedido</span>
                <span>Data</span>
                <span>Total</span>
              </div>
              {pedidos.length === 0 ? (
                <div className={styles.empty}>Nenhum pedido registrado para este cliente.</div>
              ) : pedidos.map((pedido) => (
                <div key={pedido.objectId || pedido.id} className={styles.orderRow}>
                  <span>{(pedido.items || []).map((item) => item.nome).filter(Boolean).join(', ') || 'Pedido'}</span>
                  <span>{pedido.createdAt ? new Date(pedido.createdAt).toLocaleDateString('pt-BR') : '-'}</span>
                  <strong>R$ {calculateOrderRevenue(pedido, produtosMap).toFixed(2)}</strong>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

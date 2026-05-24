'use client';

import { useEffect, useMemo, useState } from 'react';
import { getClientes, getProdutos, createPedido } from '@/services/back4app';
import { getPackagingId } from '../utils/packaging';
import styles from '../vendas/page.module.css';
import { useToast } from './ToastProvider';

export default function VendasClient() {
  const toast = useToast();
  const [clientes, setClientes] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [cliente, setCliente] = useState('');
  const [items, setItems] = useState([{ productId: '', embalagemId: '', quantidade: 1 }]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    setLoading(true);
    const [c, p] = await Promise.all([getClientes(), getProdutos()]);
    setClientes(c || []);
    setProdutos(p || []);
    setLoading(false);
  }

  function updateItem(idx, field, value) {
    const copy = [...items];
    copy[idx] = {
      ...copy[idx],
      [field]: value,
      ...(field === 'productId' ? { embalagemId: '' } : {}),
    };
    setItems(copy);
  }

  function addItem() {
    setItems((current) => [...current, { productId: '', embalagemId: '', quantidade: 1 }]);
  }

  function removeItem(index) {
    setItems((current) => current.filter((_, idx) => idx !== index));
  }

  const produtosMap = useMemo(() => {
    const map = {};
    (produtos || []).forEach((produto) => {
      map[produto.objectId || produto.id] = produto;
    });
    return map;
  }, [produtos]);

  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => {
      const produto = produtosMap[item.productId];
      const preco = produto ? Number(produto.precoVenda || produto.preco || 0) : 0;
      return sum + preco * Number(item.quantidade || 0);
    }, 0);
  }, [items, produtosMap]);

  async function confirmar() {
    if (!cliente) {
      toast.error('Selecione um cliente.', 'Validação');
      return;
    }
    if (!items.length) {
      toast.error('Adicione pelo menos um item.', 'Validação');
      return;
    }
    if (items.some((item) => !item.productId || Number(item.quantidade || 0) <= 0)) {
      toast.error('Selecione os produtos e informe quantidades válidas.', 'Validação');
      return;
    }
    if (items.some((item) => {
      const produto = produtosMap[item.productId] || {};
      return (produto.embalagens || []).length > 0 && !item.embalagemId;
    })) {
      toast.error('Escolha a embalagem de cada produto.', 'Validação');
      return;
    }

    const clienteSelecionado = clientes.find((c) => (c.objectId || c.id) === cliente);
    const payload = {
      clienteId: cliente,
      clienteNome: clienteSelecionado?.nome || '',
      items: items.map((item) => {
        const produto = produtosMap[item.productId] || {};
        const embalagem = (produto.embalagens || []).find((pack) => getPackagingId(pack) === item.embalagemId);

        return {
          productId: item.productId,
          nome: produto.nome || '',
          embalagemId: item.embalagemId,
          embalagemNome: embalagem?.nome || '',
          embalagemCusto: Number(embalagem?.custoProducao || embalagem?.valor || 0),
          quantidade: Number(item.quantidade || 1),
          preco: Number(produto.precoVenda || produto.preco || 0),
        };
      }),
      total: subtotal,
    };

    try {
      await createPedido(payload);
      toast.success('Pedido criado com sucesso.');
      setCliente('');
      setItems([{ productId: '', embalagemId: '', quantidade: 1 }]);
      carregar();
    } catch (error) {
      console.error(error);
      toast.error('Erro ao criar pedido.');
    }
  }

  return (
    <main className={styles.mainContainer}>
      <div className={styles.pageHeader}>
        <div>
          <h2>Vendas</h2>
          <p>Monte pedidos com cliente, produtos e embalagem definida para cada item.</p>
        </div>
        {loading && <span className={styles.status}>Atualizando...</span>}
      </div>

      <div className={styles.form}>
        <div className={styles.customerField}>
          <label>Cliente</label>
          <select value={cliente} onChange={(e) => setCliente(e.target.value)}>
            <option value="">Selecione um cliente</option>
            {clientes.map((c) => (
              <option key={c.objectId || c.id} value={c.objectId || c.id}>
                {c.nome}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.items}>
          <div className={styles.itemHeader}>
            <span>Produto</span>
            <span>Embalagem</span>
            <span>Qtd</span>
            <span />
          </div>

          {items.map((item, idx) => {
            const produto = produtosMap[item.productId] || {};
            const embalagens = produto.embalagens || [];

            return (
              <div key={idx} className={styles.itemRow}>
                <select
                  className={styles.productSelect}
                  value={item.productId}
                  onChange={(e) => updateItem(idx, 'productId', e.target.value)}
                >
                  <option value="">Produto</option>
                  {produtos.map((p) => (
                    <option key={p.objectId || p.id} value={p.objectId || p.id}>
                      {p.nome} - R$ {Number(p.precoVenda || p.preco || 0).toFixed(2)}
                    </option>
                  ))}
                </select>

                <select
                  className={styles.packageSelect}
                  value={item.embalagemId}
                  onChange={(e) => updateItem(idx, 'embalagemId', e.target.value)}
                  disabled={!item.productId || embalagens.length === 0}
                >
                  <option value="">Embalagem</option>
                  {embalagens.map((embalagem) => (
                    <option key={getPackagingId(embalagem)} value={getPackagingId(embalagem)}>
                      {embalagem.nome}
                    </option>
                  ))}
                </select>

                <input
                  type="number"
                  min="1"
                  value={item.quantidade}
                  onChange={(e) => updateItem(idx, 'quantidade', e.target.value)}
                  className={styles.qty}
                  aria-label="Quantidade"
                />

                <button className={styles.remove} onClick={() => removeItem(idx)} disabled={items.length === 1}>
                  Remover
                </button>
              </div>
            );
          })}
        </div>

        <button className={styles.add} onClick={addItem}>+ Adicionar item</button>

        <div className={styles.summary}>
          <span>Subtotal</span>
          <strong>R$ {subtotal.toFixed(2)}</strong>
        </div>

        <div className={styles.actions}>
          <button onClick={confirmar} className={styles.save}>Confirmar Pedido</button>
        </div>
      </div>
    </main>
  );
}

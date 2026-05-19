'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { getProduto, updateProduto } from '@/services/back4app';
import { calculateIngredientCost, calculateProductCost, getStoredIngredients } from '../../utils/ingredients';
import { getPackagingId, getStoredPackaging } from '../../utils/packaging';
import styles from './page.module.css';

export default function ProdutoIndividual() {
  const { id } = useParams();
  const [produto, setProduto] = useState(null);
  const [ingredientesBase, setIngredientesBase] = useState([]);
  const [embalagensBase, setEmbalagensBase] = useState([]);
  const [savingPackaging, setSavingPackaging] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregarProduto() {
      setLoading(true);
      setIngredientesBase(getStoredIngredients());
      setEmbalagensBase(getStoredPackaging());
      const data = await getProduto(id);
      setProduto(data);
      setLoading(false);
    }

    if (id) carregarProduto();
  }, [id]);

  const ingredientes = useMemo(() => produto?.ingredientes || [], [produto]);
  const embalagens = useMemo(() => produto?.embalagens || [], [produto]);
  const custoProduto = useMemo(() => {
    return calculateProductCost(ingredientes, ingredientesBase);
  }, [ingredientes, ingredientesBase]);

  const lucro = useMemo(() => {
    if (!produto) return 0;
    return Number(produto.precoVenda || produto.preco || 0) - custoProduto;
  }, [produto, custoProduto]);

  const embalagensIds = useMemo(() => {
    return new Set(embalagens.map((embalagem) => getPackagingId(embalagem)));
  }, [embalagens]);

  const embalagensDisponiveis = useMemo(() => {
    return embalagensBase.filter((embalagem) => !embalagensIds.has(getPackagingId(embalagem)));
  }, [embalagensBase, embalagensIds]);

  async function salvarEmbalagens(nextEmbalagens) {
    setSavingPackaging(true);
    try {
      await updateProduto(id, { embalagens: nextEmbalagens });
      setProduto((current) => ({ ...current, embalagens: nextEmbalagens }));
    } catch (error) {
      console.error(error);
      alert('Erro ao atualizar embalagens do produto');
    } finally {
      setSavingPackaging(false);
    }
  }

  function adicionarEmbalagem(embalagemId) {
    const embalagem = embalagensBase.find((item) => getPackagingId(item) === embalagemId);
    if (!embalagem) return;
    salvarEmbalagens([...embalagens, embalagem]);
  }

  function removerEmbalagem(embalagemId) {
    salvarEmbalagens(embalagens.filter((item) => getPackagingId(item) !== embalagemId));
  }

  if (loading) {
    return (
      <main className={styles.mainContainer}>
        <div className={styles.card}>Carregando produto...</div>
      </main>
    );
  }

  if (!produto) {
    return (
      <main className={styles.mainContainer}>
        <div className={styles.card}>Produto não encontrado.</div>
      </main>
    );
  }

  return (
    <main className={styles.mainContainer}>
      <div className={styles.card}>
        <div className={styles.topSection}>
          <div className={styles.imagePlaceholder}>{produto.nome?.slice(0, 1) || 'P'}</div>

          <div className={styles.info}>
            <h1>{produto.nome}</h1>
            <hr />
            <p>{produto.descricao || 'Sem descrição cadastrada.'}</p>
          </div>
        </div>

        <div className={styles.metrics}>
          <div>
            <span>Custo médio</span>
            <strong>R$ {custoProduto.toFixed(2)}</strong>
          </div>

          <div>
            <span>Preço de venda</span>
            <strong>R$ {Number(produto.precoVenda || produto.preco || 0).toFixed(2)}</strong>
          </div>

          <div>
            <span>Lucro médio</span>
            <strong>R$ {lucro.toFixed(2)}</strong>
          </div>
        </div>

        <div className={styles.bottomRow}>
          <div className={styles.sectionWrapper}>
            <h3 className={styles.sectionTitle}>Ingredientes</h3>

            <div className={styles.section}>
              <div className={styles.table3}>
                <div className={styles.rowHeader3}>
                  <span>Ingrediente</span>
                  <span>Qtd</span>
                  <span>Custo</span>
                </div>

                {ingredientes.length === 0 ? (
                  <div className={styles.empty}>Nenhum ingrediente cadastrado.</div>
                ) : ingredientes.map((ingrediente, index) => {
                  const calculo = calculateIngredientCost(ingrediente, ingredientesBase);

                  return (
                    <div key={`${ingrediente.nome}-${index}`} className={styles.row3}>
                      <span>{ingrediente.nome || '-'}</span>
                      <span>{ingrediente.quantidade || '-'}g</span>
                      <span>R$ {calculo.custo.toFixed(2)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className={styles.sectionWrapperSmall}>
            <h3 className={styles.sectionTitle}>Embalagens</h3>

            <div className={styles.sectionSmall}>
              <div className={styles.packageControls}>
                <select
                  value=""
                  onChange={(event) => adicionarEmbalagem(event.target.value)}
                  disabled={savingPackaging || embalagensDisponiveis.length === 0}
                >
                  <option value="">Adicionar embalagem</option>
                  {embalagensDisponiveis.map((embalagem) => (
                    <option key={getPackagingId(embalagem)} value={getPackagingId(embalagem)}>
                      {embalagem.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.table2}>
                <div className={styles.rowHeader2}>
                  <span>Tipo</span>
                  <span>Valor</span>
                </div>

                {embalagens.length === 0 ? (
                  <div className={styles.empty}>Nenhuma embalagem vinculada.</div>
                ) : embalagens.map((embalagem, index) => (
                  <div key={`${embalagem.nome}-${index}`} className={styles.row2}>
                    <span>{embalagem.nome || '-'}</span>
                    <span>
                      R$ {Number(embalagem.custoProducao || embalagem.valor || 0).toFixed(2)}
                      <button
                        className={styles.removePackage}
                        onClick={() => removerEmbalagem(getPackagingId(embalagem))}
                        disabled={savingPackaging}
                      >
                        Remover
                      </button>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

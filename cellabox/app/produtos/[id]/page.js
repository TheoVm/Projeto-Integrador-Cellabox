'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { getIngredientes, getProduto, updateProduto } from '@/services/back4app';
import { calculateIngredientCost, calculateProductCost, getStoredIngredients, normalizeMeasure } from '../../utils/ingredients';
import { getPackagingId, getStoredPackaging } from '../../utils/packaging';
import { useToast } from '../../components/ToastProvider';
import styles from './page.module.css';

function getIngredientId(ingrediente) {
  return ingrediente?.objectId || ingrediente?.id || ingrediente?.nome || '';
}

function encontrarIngredienteBase(ingrediente, baseList = []) {
  return baseList.find((item) => (
    getIngredientId(item) === ingrediente.ingredienteId
    || item.nome?.trim().toLowerCase() === ingrediente.nome?.trim().toLowerCase()
  ));
}

function prepararIngredienteEditavel(ingrediente = {}, baseList = []) {
  const base = encontrarIngredienteBase(ingrediente, baseList);
  const unidadeBase = normalizeMeasure(ingrediente.unidadeMedida || base?.unidadeMedida || base?.medida);
  return {
    ingredienteId: ingrediente.ingredienteId || getIngredientId(base) || '',
    nome: ingrediente.nome || base?.nome || '',
    quantidade: ingrediente.quantidade ? String(ingrediente.quantidade) : '',
    unidade: ingrediente.unidade || (unidadeBase === 'unidade' ? 'un' : 'g'),
  };
}

function toQuantidadeBase(quantidade, unidade) {
  const valor = Number(quantidade || 0);
  if (unidade === 'un') return valor;
  return unidade === 'kg' ? valor * 1000 : valor;
}

function montarIngredientesCalculados(lista, ingredientesBase) {
  return lista
    .filter((ingrediente) => ingrediente.nome && Number(ingrediente.quantidade || 0) > 0)
    .map((ingrediente) => {
      const quantidade = toQuantidadeBase(ingrediente.quantidade, ingrediente.unidade);
      const unidadeNormalizada = ingrediente.unidade === 'un' ? 'un' : 'g';
      const normalizado = { nome: ingrediente.nome, quantidade, unidade: unidadeNormalizada };
      const calculo = calculateIngredientCost(normalizado, ingredientesBase);

      return {
        ingredienteId: ingrediente.ingredienteId || '',
        nome: ingrediente.nome,
        quantidade,
        unidade: unidadeNormalizada,
        unidadeMedida: calculo.unidadeMedida,
        valorKg: calculo.valorKg,
        valorUnidade: calculo.valorUnidade,
        custo: calculo.custo,
      };
    });
}

function getPackageCost(embalagem) {
  return Number(embalagem?.custoEmbalagem ?? embalagem?.custoProducao ?? embalagem?.custo ?? 0);
}

function getPackageSalePrice(embalagem) {
  return Number(embalagem?.valorVenda ?? embalagem?.precoVenda ?? embalagem?.valor ?? 0);
}

function montarEmbalagemDoProduto(embalagem, custoIngredientes, custoEmbalagem, valorVenda) {
  const custoFinal = Number(custoIngredientes || 0) + Number(custoEmbalagem || 0);
  const venda = Number(valorVenda || 0);

  return {
    ...embalagem,
    embalagemId: embalagem.embalagemId || getPackagingId(embalagem),
    nome: embalagem.nome || '',
    custoIngredientes: Number(custoIngredientes || 0),
    custoEmbalagem: Number(custoEmbalagem || 0),
    custoProducao: custoFinal,
    valorVenda: venda,
    precoVenda: venda,
    lucroEstimado: venda - custoFinal,
  };
}

export default function ProdutoIndividual() {
  const toast = useToast();
  const { id } = useParams();
  
  const [produto, setProduto] = useState(null);
  const [ingredientesBase, setIngredientesBase] = useState([]);
  const [embalagensBase, setEmbalagensBase] = useState([]);
  const [savingPackaging, setSavingPackaging] = useState(false);
  const [loading, setLoading] = useState(true);

  const [editando, setEditando] = useState(false);
  const [nomeEditado, setNomeEditado] = useState('');
  const [descricaoEditada, setDescricaoEditada] = useState('');
  const [precoEditado, setPrecoEditado] = useState('');
  const [ingredientesEditados, setIngredientesEditados] = useState([]);
  const [novaEmbalagemId, setNovaEmbalagemId] = useState('');
  const [novoValorVenda, setNovoValorVenda] = useState('');

  useEffect(() => {
    async function carregarProduto() {
      setLoading(true);
      const ingredientesCadastrados = await getIngredientes();
      const ingredientesFormatados = (ingredientesCadastrados || []).map((item) => ({
        id: item.objectId || item.id,
        objectId: item.objectId,
        nome: item.nome,
        valor: Number(item.valor || 0),
        unidadeMedida: normalizeMeasure(item.unidadeMedida || item.medida),
      }));
      setIngredientesBase(ingredientesFormatados.length ? ingredientesFormatados : getStoredIngredients());
      setEmbalagensBase(getStoredPackaging());
      
      const data = await getProduto(id);
      if (data) {
        setProduto(data);
        setNomeEditado(data.nome || '');
        setDescricaoEditada(data.descricao || '');
        setPrecoEditado(data.precoVenda || data.preco || '');
        setIngredientesEditados((data.ingredientes || []).map((ingrediente) => (
          prepararIngredienteEditavel(ingrediente, ingredientesFormatados.length ? ingredientesFormatados : getStoredIngredients())
        )));
      }
      setLoading(false);
    }

    if (id) carregarProduto();
  }, [id]);

  const ingredientes = useMemo(() => (
    editando ? montarIngredientesCalculados(ingredientesEditados, ingredientesBase) : produto?.ingredientes || []
  ), [editando, ingredientesEditados, produto, ingredientesBase]);
  const embalagens = useMemo(() => produto?.embalagens || [], [produto]);
  
  const custoProduto = useMemo(() => {
    return calculateProductCost(ingredientes, ingredientesBase);
  }, [ingredientes, ingredientesBase]);

  const lucro = useMemo(() => {
    if (!produto) return 0;
    const precoAtual = editando ? Number(precoEditado || 0) : Number(produto.precoVenda || produto.preco || 0);
    return precoAtual - custoProduto;
  }, [produto, custoProduto, editando, precoEditado]);

  const embalagensIds = useMemo(() => {
    return new Set(embalagens.map((embalagem) => getPackagingId(embalagem)));
  }, [embalagens]);

  const embalagensDisponiveis = useMemo(() => {
    return embalagensBase.filter((embalagem) => !embalagensIds.has(getPackagingId(embalagem)));
  }, [embalagensBase, embalagensIds]);

  const embalagensComCustos = useMemo(() => {
    return embalagens.map((embalagem) => montarEmbalagemDoProduto(
      embalagem,
      custoProduto,
      getPackageCost(embalagem),
      getPackageSalePrice(embalagem)
    ));
  }, [embalagens, custoProduto]);

  const menorCustoFinal = useMemo(() => {
    if (!embalagensComCustos.length) return custoProduto;
    return Math.min(...embalagensComCustos.map((embalagem) => Number(embalagem.custoProducao || 0)));
  }, [embalagensComCustos, custoProduto]);

  async function salvarEdicao() {
    const ingredientesCalculados = montarIngredientesCalculados(ingredientesEditados, ingredientesBase);
    const custoBaseAtualizado = calculateProductCost(ingredientesCalculados, ingredientesBase);
    const hasIngredienteInvalido = ingredientesEditados.some((ingrediente) => (
      ingrediente.nome && Number(ingrediente.quantidade || 0) <= 0
    ));

    if (hasIngredienteInvalido) {
      toast.error('Informe uma quantidade valida para cada ingrediente.', 'Validacao');
      return;
    }

    try {
      const dadosAtualizados = {
        nome: nomeEditado,
        descricao: descricaoEditada,
        precoVenda: Number(precoEditado),
        custoProducao: custoBaseAtualizado,
        ingredientes: ingredientesCalculados,
        embalagens: embalagens.map((embalagem) => montarEmbalagemDoProduto(
          embalagem,
          custoBaseAtualizado,
          getPackageCost(embalagem),
          getPackageSalePrice(embalagem)
        )),
      };
      await updateProduto(id, dadosAtualizados);
      
      setProduto({ ...produto, ...dadosAtualizados });
      setEditando(false);
      toast.success("Informações do produto atualizadas!");
    } catch (error) {
      console.error(error);
      toast.error('Erro ao atualizar produto.');
    }
  }

  function iniciarEdicao() {
    setIngredientesEditados((produto?.ingredientes || []).map((ingrediente) => prepararIngredienteEditavel(ingrediente)));
    setEditando(true);
  }

  function adicionarIngrediente() {
    setIngredientesEditados((current) => [
      ...current,
      { ingredienteId: '', nome: '', quantidade: '', unidade: 'g' },
    ]);
  }

  function atualizarIngrediente(index, field, value) {
    setIngredientesEditados((current) => current.map((ingrediente, currentIndex) => {
      if (currentIndex !== index) return ingrediente;

      if (field === 'ingredienteId') {
        const selecionado = ingredientesBase.find((item) => getIngredientId(item) === value);
        return {
          ...ingrediente,
          ingredienteId: value,
          nome: selecionado?.nome || '',
          unidade: normalizeMeasure(selecionado?.unidadeMedida || selecionado?.medida) === 'unidade' ? 'un' : 'g',
        };
      }

      return { ...ingrediente, [field]: value };
    }));
  }

  function removerIngrediente(index) {
    setIngredientesEditados((current) => current.filter((_, currentIndex) => currentIndex !== index));
  }

  function ingredienteEditadoIsUnit(ingrediente) {
    const base = ingredientesBase.find((item) => getIngredientId(item) === ingrediente.ingredienteId);
    return normalizeMeasure(ingrediente.unidadeMedida || base?.unidadeMedida || base?.medida) === 'unidade';
  }

  async function salvarEmbalagens(nextEmbalagens) {
    setSavingPackaging(true);
    try {
      const embalagensCalculadas = nextEmbalagens.map((embalagem) => montarEmbalagemDoProduto(
        embalagem,
        custoProduto,
        getPackageCost(embalagem),
        getPackageSalePrice(embalagem)
      ));
      await updateProduto(id, { embalagens: embalagensCalculadas });
      setProduto((current) => ({ ...current, embalagens: embalagensCalculadas }));
    } catch (error) {
      console.error(error);
      toast.error('Erro ao atualizar embalagens do produto');
    } finally {
      setSavingPackaging(false);
    }
  }

  function selecionarNovaEmbalagem(embalagemId) {
    setNovaEmbalagemId(embalagemId);
    const embalagem = embalagensBase.find((item) => getPackagingId(item) === embalagemId);
    setNovoValorVenda(embalagem ? String(getPackageSalePrice(embalagem)) : '');
  }

  function adicionarEmbalagem() {
    const embalagem = embalagensBase.find((item) => getPackagingId(item) === novaEmbalagemId);
    if (!embalagem) return;
    if (Number(novoValorVenda || 0) < 0) {
      toast.error('Informe um valor de venda valido para a combinacao.', 'Validacao');
      return;
    }

    const novaRelacao = montarEmbalagemDoProduto(
      embalagem,
      custoProduto,
      getPackageCost(embalagem),
      Number(novoValorVenda || 0)
    );

    salvarEmbalagens([...embalagens, novaRelacao]);
    setNovaEmbalagemId('');
    setNovoValorVenda('');
  }

  function atualizarValorVendaEmbalagem(index, value) {
    const atualizadas = embalagens.map((embalagem, currentIndex) => {
      if (currentIndex !== index) return embalagem;
      return montarEmbalagemDoProduto(embalagem, custoProduto, getPackageCost(embalagem), Number(value || 0));
    });

    salvarEmbalagens(atualizadas);
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

          <div className={styles.info} style={{ flex: 1 }}>
            {editando ? (
              <>
                <input 
                  value={nomeEditado} 
                  onChange={(e) => setNomeEditado(e.target.value)} 
                  style={{ fontSize: '24px', fontWeight: 'bold', width: '100%', marginBottom: '10px', padding: '5px' }}
                />
                <hr />
                <textarea 
                  value={descricaoEditada} 
                  onChange={(e) => setDescricaoEditada(e.target.value)} 
                  className={styles.descriptionInput}
                />
              </>
            ) : (
              <>
                <h1>{produto.nome}</h1>
                <hr />
                <p>{produto.descricao || 'Sem descrição cadastrada.'}</p>
              </>
            )}
          </div>
          
          <div style={{ marginLeft: '20px', alignSelf: 'flex-start' }}>
            {editando ? (
              <button 
                onClick={salvarEdicao} 
                style={{ background: '#4CAF50', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
                Salvar
              </button>
            ) : (
              <button 
                onClick={iniciarEdicao} 
                style={{ background: '#f0f0f0', border: '1px solid #ccc', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer' }}>
                Editar
              </button>
            )}
          </div>
        </div>

        <div className={styles.metrics}>
          <div>
            <span>Custo base</span>
            <strong>R$ {custoProduto.toFixed(2)}</strong>
          </div>

          <div>
            <span>Menor custo final</span>
            <strong>R$ {menorCustoFinal.toFixed(2)}</strong>
          </div>

          <div>
            <span>Combinações</span>
            <strong>{embalagensComCustos.length}</strong>
          </div>
        </div>

        <div className={styles.bottomRow}>
          <div className={styles.sectionWrapper}>
            <h3 className={styles.sectionTitle}>Ingredientes</h3>

            <div className={styles.section}>
              {editando && (
                <div className={styles.ingredientEditor}>
                  {ingredientesEditados.map((ingrediente, index) => (
                    <div key={`${ingrediente.nome}-${index}`} className={styles.ingredientEditorRow}>
                      <select
                        value={ingrediente.ingredienteId}
                        onChange={(event) => atualizarIngrediente(index, 'ingredienteId', event.target.value)}
                      >
                        <option value="">Selecionar ingrediente</option>
                        {ingredientesBase.map((item) => (
                          <option key={getIngredientId(item)} value={getIngredientId(item)}>
                            {item.nome}
                          </option>
                        ))}
                      </select>

                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={ingrediente.quantidade}
                        onChange={(event) => atualizarIngrediente(index, 'quantidade', event.target.value)}
                        placeholder="Qtd"
                      />

                      <select
                        value={ingredienteEditadoIsUnit(ingrediente) ? 'un' : ingrediente.unidade}
                        onChange={(event) => atualizarIngrediente(index, 'unidade', event.target.value)}
                        disabled={ingredienteEditadoIsUnit(ingrediente)}
                      >
                        {ingredienteEditadoIsUnit(ingrediente) ? (
                          <option value="un">unidades</option>
                        ) : (
                          <>
                            <option value="g">g</option>
                            <option value="kg">kg</option>
                          </>
                        )}
                      </select>

                      <button type="button" onClick={() => removerIngrediente(index)}>
                        Remover
                      </button>
                    </div>
                  ))}

                  <button type="button" className={styles.addIngredient} onClick={adicionarIngrediente}>
                    + Adicionar ingrediente
                  </button>
                </div>
              )}

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
                      <span>{ingrediente.quantidade || '-'}{ingrediente.unidade === 'un' ? ' un' : 'g'}</span>
                      <span>R$ {calculo.custo.toFixed(2)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div className={styles.sectionWrapper}>
            <h3 className={styles.sectionTitle}>Custos por embalagem</h3>

            <div className={styles.section}>
              <div className={styles.packageControls}>
                <select
                  value={novaEmbalagemId}
                  onChange={(event) => selecionarNovaEmbalagem(event.target.value)}
                  disabled={savingPackaging || embalagensDisponiveis.length === 0}
                >
                  <option value="">Adicionar embalagem</option>
                  {embalagensDisponiveis.map((embalagem) => (
                    <option key={getPackagingId(embalagem)} value={getPackagingId(embalagem)}>
                      {embalagem.nome}
                    </option>
                  ))}
                </select>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={novoValorVenda}
                  onChange={(event) => setNovoValorVenda(event.target.value)}
                  placeholder="Valor de venda"
                />

                <button
                  type="button"
                  onClick={adicionarEmbalagem}
                  disabled={savingPackaging || !novaEmbalagemId}
                >
                  Adicionar
                </button>
              </div>

              <div className={styles.packageTable}>
                <div className={styles.packageHeader}>
                  <span>Tipo</span>
                  <span>Custo base</span>
                  <span>Custo embalagem</span>
                  <span>Custo final</span>
                  <span>Venda final</span>
                  <span>Lucro estimado</span>
                  <span></span>
                </div>

                {embalagensComCustos.length === 0 ? (
                  <div className={styles.empty}>Nenhuma embalagem vinculada.</div>
                ) : embalagensComCustos.map((embalagem, index) => (
                  <div key={`${embalagem.nome}-${index}`} className={styles.packageRow}>
                    <span>{embalagem.nome || '-'}</span>
                    <span>R$ {Number(embalagem.custoIngredientes || 0).toFixed(2)}</span>
                    <span>R$ {Number(embalagem.custoEmbalagem || 0).toFixed(2)}</span>
                    <strong>R$ {Number(embalagem.custoProducao || 0).toFixed(2)}</strong>
                    <span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        defaultValue={Number(embalagem.valorVenda || 0).toFixed(2)}
                        onBlur={(event) => atualizarValorVendaEmbalagem(index, event.target.value)}
                        aria-label={`Valor de venda da embalagem ${embalagem.nome}`}
                      />
                    </span>
                    <strong>R$ {Number(embalagem.lucroEstimado || 0).toFixed(2)}</strong>
                    <button
                      className={styles.removePackage}
                      onClick={() => removerEmbalagem(getPackagingId(embalagem))}
                      disabled={savingPackaging}
                    >
                      Remover
                    </button>
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

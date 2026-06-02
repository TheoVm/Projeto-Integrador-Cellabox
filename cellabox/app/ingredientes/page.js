"use client";

import { useEffect, useMemo, useState } from 'react';
import styles from './page.module.css';
import IngredientesList from '../components/IngredientesList';
import {
  createIngrediente,
  getIngredientes,
  updateIngrediente,
  deleteIngrediente,
} from '@/services/back4app';
import { useToast } from '../components/ToastProvider';
import { normalizeMeasure } from '../utils/ingredients';

export default function Ingredientes() {
  const toast = useToast();
  const [showModal, setShowModal] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [nome, setNome] = useState('');
  const [valor, setValor] = useState('');
  const [unidadeMedida, setUnidadeMedida] = useState('kg');
  const [calcIngrediente, setCalcIngrediente] = useState('');
  const [calcPeso, setCalcPeso] = useState('');
  const [calcUnidade, setCalcUnidade] = useState('kg');

  useEffect(() => {
    carregarIngredientes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function carregarIngredientes() {
    setLoading(true);
    try {
      const dados = await getIngredientes();
      const formatados = dados.map((item) => ({
        id: item.objectId,
        nome: item.nome,
        valor: Number(item.valor || 0),
        unidadeMedida: normalizeMeasure(item.unidadeMedida || item.medida),
      }));
      setItems(formatados);
      if (!calcIngrediente && formatados[0]) setCalcIngrediente(formatados[0].id);
    } catch (error) {
      console.error(error);
      toast.error('Erro ao carregar ingredientes.');
    } finally {
      setLoading(false);
    }
  }

  function atualizarEstadoLocal(novosItens) {
    setItems(novosItens);
  }

  async function salvarEdicaoBanco(id, novoValor) {
    if (Number(novoValor) < 0) {
      toast.error('O valor do ingrediente não pode ser negativo.', 'Validação');
      return;
    }

    try {
      await updateIngrediente(id, { valor: Number(novoValor) });
      toast.success('Valor do ingrediente atualizado.');
    } catch (error) {
      console.error(error);
      toast.error('Erro ao atualizar valor do ingrediente.');
    }
  }

  async function removerIngrediente(id) {
    try {
      await deleteIngrediente(id);
      toast.success('Ingrediente excluído com sucesso.');
      await carregarIngredientes();
    } catch (error) {
      console.error(error);
      toast.error('Erro ao excluir ingrediente.');
    }
  }

  async function salvarIngrediente() {
    if (!nome) {
      toast.error('Preencha o nome do ingrediente.', 'Validação');
      return;
    }
    if (Number(valor) < 0) {
      toast.error('O valor por kg não pode ser negativo.', 'Validação');
      return;
    }

    const novo = { nome, valor: Number(valor || 0), unidadeMedida };

    try {
      await createIngrediente(novo);
      toast.success('Ingrediente adicionado com sucesso.');
      await carregarIngredientes();
      setShowModal(false);
      setNome('');
      setValor('');
      setUnidadeMedida('kg');
    } catch (error) {
      console.error(error);
      toast.error('Erro ao salvar ingrediente.');
    }
  }

  const ingredienteCalculado = useMemo(() => {
    return items.find((item) => item.id === calcIngrediente);
  }, [items, calcIngrediente]);

  const calcIsUnit = ingredienteCalculado?.unidadeMedida === 'unidade';

  const pesoEmKg = useMemo(() => {
    const peso = Number(calcPeso || 0);
    if (!peso || peso < 0) return 0;
    return calcUnidade === 'g' ? peso / 1000 : peso;
  }, [calcPeso, calcUnidade]);

  const resultadoCalculadora = useMemo(() => {
    if (calcIsUnit || calcUnidade === 'un') {
      return Number(calcPeso || 0) * Number(ingredienteCalculado?.valor || 0);
    }
    return pesoEmKg * Number(ingredienteCalculado?.valor || 0);
  }, [pesoEmKg, ingredienteCalculado, calcPeso, calcUnidade, calcIsUnit]);

  const calcErro = calcPeso && Number(calcPeso) < 0 ? 'Informe um peso positivo.' : '';

  return (
    <main className={styles.mainContainer}>
      <div className={styles.pageHeader}>
        <div>
          <h2>Ingredientes</h2>
          <p className={styles.sub}>Gerencie preços por quilo diretamente na tabela.</p>
        </div>
        {loading && <span className={styles.status}>Atualizando...</span>}
      </div>

      <div className={styles.topBar}>
        <div />
        <button className={styles.addButton} onClick={() => setShowModal(true)}>+ Adicionar</button>
      </div>

      <IngredientesList
        initial={items}
        onChange={atualizarEstadoLocal}
        onSave={salvarEdicaoBanco}
        onDelete={removerIngrediente}
      />

      <section className={styles.calculator}>
        <div className={styles.calculatorHeader}>
          <div>
            <h3>Calculadora de Ingredientes</h3>
            <p>Simule o custo por peso ou unidade usando o valor cadastrado.</p>
          </div>
        </div>

        <div className={styles.calculatorGrid}>
          <label>
            Ingrediente
            <select
              value={calcIngrediente}
              onChange={(e) => {
                setCalcIngrediente(e.target.value);
                const selected = items.find((item) => item.id === e.target.value);
                if (selected?.unidadeMedida === 'unidade') setCalcUnidade('un');
                if (selected?.unidadeMedida !== 'unidade' && calcUnidade === 'un') setCalcUnidade('kg');
              }}
            >
              <option value="">Selecione</option>
              {items.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nome}
                </option>
              ))}
            </select>
          </label>

          <label>
            {calcIsUnit ? 'Quantidade' : 'Peso'}
            <input
              type="number"
              min="0"
              step="0.01"
              value={calcPeso}
              onChange={(e) => setCalcPeso(e.target.value)}
              placeholder={calcIsUnit ? 'Ex: 3' : calcUnidade === 'g' ? 'Ex: 500' : 'Ex: 2'}
            />
          </label>

          <label>
            Unidade
            <select value={calcIsUnit ? 'un' : calcUnidade} onChange={(e) => setCalcUnidade(e.target.value)} disabled={calcIsUnit}>
              {calcIsUnit ? (
                <option value="un">unidades</option>
              ) : (
                <>
                  <option value="kg">kg</option>
                  <option value="g">g</option>
                </>
              )}
            </select>
          </label>

          <div className={styles.calculatorResult}>
            <span>Resultado</span>
            <strong>R$ {resultadoCalculadora.toFixed(2)}</strong>
            <small>
              {ingredienteCalculado ? `R$ ${Number(ingredienteCalculado.valor || 0).toFixed(2)} / ${ingredienteCalculado.unidadeMedida === 'unidade' ? 'unidade' : 'kg'}` : 'Selecione um ingrediente'}
            </small>
          </div>
        </div>

        {calcErro && <p className={styles.errorText}>{calcErro}</p>}
      </section>

      {showModal && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <h3>Novo Ingrediente</h3>
            <input placeholder="Nome" value={nome} onChange={(e) => setNome(e.target.value)} />
            <select value={unidadeMedida} onChange={(e) => setUnidadeMedida(e.target.value)}>
              <option value="kg">Quilos/gramas</option>
              <option value="unidade">Unidades</option>
            </select>
            <div className={styles.inputGroupSmall}>
              <span>R$</span>
              <input placeholder={unidadeMedida === 'unidade' ? 'Valor por unidade' : 'Valor por kg'} type="number" value={valor} onChange={(e) => setValor(e.target.value)} />
            </div>

            <div className={styles.modalActions}>
              <button onClick={() => setShowModal(false)}>Cancelar</button>
              <button className={styles.saveButton} onClick={salvarIngrediente}>Salvar</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

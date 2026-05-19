"use client";

import { useState, useEffect } from 'react';
import styles from './page.module.css';
import IngredientesList from '../components/IngredientesList';
import { 
  createIngrediente, 
  getIngredientes, 
  updateIngrediente, 
  deleteIngrediente 
} from '@/services/back4app';

export default function Ingredientes() {
  const [showModal, setShowModal] = useState(false);
  const [items, setItems] = useState([]);
  const [nome, setNome] = useState('');
  const [valor, setValor] = useState('');

  useEffect(() => {
    carregarIngredientes();
  }, []);

  async function carregarIngredientes() {
    try {
      const dados = await getIngredientes();
      const formatados = dados.map((it) => ({
        id: it.objectId,
        nome: it.nome,
        valor: it.valor || 0
      }));
      setItems(formatados);
    } catch (error) {
      console.error(error);
    }
  }

  function atualizarEstadoLocal(novosItens) {
    setItems(novosItens);
  }

  async function salvarEdicaoBanco(id, novoValor) {
    try {
      await updateIngrediente(id, { valor: Number(novoValor) });
      console.log('Valor atualizado no banco de dados!');
    } catch (error) {
      console.error(error);
      alert('Erro ao atualizar valor do ingrediente no servidor.');
    }
  }

  async function removerIngrediente(id) {
    const confirmar = confirm("Tem certeza que deseja excluir este ingrediente?");
    if (!confirmar) return;

    try {
      await deleteIngrediente(id);
      alert('Ingrediente excluído com sucesso!');
      await carregarIngredientes();
    } catch (error) {
      console.error(error);
      alert('Erro ao excluir ingrediente.');
    }
  }

  async function salvarIngrediente() {
    if (!nome) return alert('Preencha o nome');
    
    const novo = { nome, valor: Number(valor || 0) };
    
    try {
      await createIngrediente(novo);
      alert('Ingrediente adicionado com sucesso!');
      await carregarIngredientes();
      setShowModal(false);
      setNome('');
      setValor('');
    } catch (error) {
      console.error(error);
      alert('Erro ao salvar ingrediente no banco.');
    }
  }

  return (
    <main className={styles.mainContainer}>
      <div className={styles.pageHeader}>
        <div>
          <h2>Ingredientes</h2>
          <p className={styles.sub}>Gerencie preços por quilo diretamente na tabela.</p>
        </div>
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

      {showModal && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <h3>Novo Ingrediente</h3>
            <input placeholder="Nome" value={nome} onChange={(e) => setNome(e.target.value)} />
            <div className={styles.inputGroupSmall}>
              <span>R$</span>
              <input placeholder="Valor por kg" type="number" value={valor} onChange={(e) => setValor(e.target.value)} />
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
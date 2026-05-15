"use client";

import { useState } from 'react';
import styles from './page.module.css';
import IngredientesList from '../components/IngredientesList';

export default function Ingredientes() {
  const [showModal, setShowModal] = useState(false);
  const [items, setItems] = useState([
    { id: 'i1', nome: 'Chocolate', valor: 45.0 },
    { id: 'i2', nome: 'Farinha', valor: 12.5 },
    { id: 'i3', nome: 'Açúcar', valor: 8.75 },
  ]);

  const [nome, setNome] = useState('');
  const [valor, setValor] = useState('');

  function salvarIngrediente() {
    if (!nome) return alert('Preencha o nome');
    const novo = { id: String(Date.now()), nome, valor: Number(valor || 0) };
    setItems((s) => [novo, ...s]);
    setShowModal(false);
    setNome(''); setValor('');
  }

  return (
    <main className={styles.mainContainer}>
      <h2>Ingredientes</h2>
      <p className={styles.sub}>Gerencie preços por quilo diretamente na tabela</p>

      <div className={styles.topBar}>
        <div />
        <button className={styles.addButton} onClick={() => setShowModal(true)}>+ Adicionar</button>
      </div>

      <IngredientesList initial={items} />

      {showModal && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <h3>Novo Ingrediente</h3>
            <input placeholder="Nome" value={nome} onChange={(e)=>setNome(e.target.value)} />
            <div className={styles.inputGroupSmall}>
              <span>R$</span>
              <input placeholder="Valor por kg" type="number" value={valor} onChange={(e)=>setValor(e.target.value)} />
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
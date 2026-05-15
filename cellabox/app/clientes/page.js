"use client";

import { useState } from 'react';
import styles from './page.module.css';
import ClientesList from '../components/ClientesList';

export default function Clientes() {
  const [showModal, setShowModal] = useState(false);

  const [clients, setClients] = useState([
    { id: '1', nome: 'João Silva', valor: 0.0 },
    { id: '2', nome: 'Maria Oliveira', valor: 120.5 },
    { id: '3', nome: 'Carlos Pereira', valor: 45.9 },
  ]);

  const [nome, setNome] = useState('');
  const [idade, setIdade] = useState('');
  const [aniversario, setAniversario] = useState('');
  const [pedidoRecente, setPedidoRecente] = useState('');
  const [pedidoMaisRealizado, setPedidoMaisRealizado] = useState('');
  const [receita, setReceita] = useState('');
  const [numeroPedidos, setNumeroPedidos] = useState('');

  function salvarCliente() {
    if (!nome) return alert('Preencha o nome');

    const novo = {
      id: String(Date.now()),
      nome,
      valor: Number(receita || 0),
    };

    setClients((s) => [novo, ...s]);
    setShowModal(false);
    setNome('');
    setIdade('');
    setAniversario('');
    setPedidoRecente('');
    setPedidoMaisRealizado('');
    setReceita('');
    setNumeroPedidos('');
  }

  return (
    <main className={styles.mainContainer}>
      <h2>Clientes</h2>
      <p className={styles.sub}>Lista de clientes cadastrados</p>

      <div className={styles.topBar}>
        <div />
        <button className={styles.addButton} onClick={() => setShowModal(true)}>+ Adicionar</button>
      </div>

      <ClientesList clients={clients} />

      {showModal && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <h3>Novo Cliente</h3>
            <input placeholder="Nome" value={nome} onChange={(e) => setNome(e.target.value)} />
            <div className={styles.rowInputs}>
              <input placeholder="Idade" type="number" value={idade} onChange={(e)=>setIdade(e.target.value)} />
              <input placeholder="Aniversário" value={aniversario} onChange={(e)=>setAniversario(e.target.value)} />
            </div>

            <input placeholder="Pedido mais recente" value={pedidoRecente} onChange={(e)=>setPedidoRecente(e.target.value)} />
            <input placeholder="Pedido mais realizado" value={pedidoMaisRealizado} onChange={(e)=>setPedidoMaisRealizado(e.target.value)} />

            <div className={styles.rowInputs}>
              <div className={styles.inputGroupSmall}>
                <span>R$</span>
                <input placeholder="Receita" type="number" value={receita} onChange={(e)=>setReceita(e.target.value)} />
              </div>

              <input placeholder="Total de pedidos" type="number" value={numeroPedidos} onChange={(e)=>setNumeroPedidos(e.target.value)} />
            </div>

            <div className={styles.modalActions}>
              <button onClick={() => setShowModal(false)}>Cancelar</button>
              <button className={styles.saveButton} onClick={salvarCliente}>Salvar</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
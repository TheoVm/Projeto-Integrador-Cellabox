"use client";

import { useEffect, useMemo, useState } from 'react';
import styles from './page.module.css';
import ClientesList from '../components/ClientesList';
import {
  createCliente,
  getClientes,
  deleteCliente,
  getPedidos,
} from '@/services/back4app';

export default function Clientes() {
  const [showModal, setShowModal] = useState(false);
  const [clientes, setClientes] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [nome, setNome] = useState('');
  const [idade, setIdade] = useState('');
  const [aniversario, setAniversario] = useState('');
  const [endereco, setEndereco] = useState('');

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    try {
      const [clientesData, pedidosData] = await Promise.all([getClientes(), getPedidos()]);
      setClientes(clientesData || []);
      setPedidos(pedidosData || []);
    } catch (error) {
      console.error(error);
    }
  }

  const clients = useMemo(() => {
    return clientes.map((cliente) => {
      const clienteId = cliente.objectId || cliente.id;
      const pedidosCliente = pedidos.filter((pedido) => pedido.clienteId === clienteId);
      const receita = pedidosCliente.reduce((sum, pedido) => sum + Number(pedido.total || 0), 0);

      return {
        id: clienteId,
        nome: cliente.nome,
        valor: receita,
        pedidos: pedidosCliente.length,
      };
    });
  }, [clientes, pedidos]);

  async function removerCliente(id) {
    const confirmar = confirm("Tem certeza que deseja excluir este cliente?");
    if (!confirmar) return;

    try {
      await deleteCliente(id);
      alert('Cliente excluído com sucesso!');
      await carregarDados();
    } catch (error) {
      console.error(error);
      alert('Erro ao excluir cliente.');
    }
  }

  async function salvarCliente() {
    if (!nome) {
      alert('Preencha o nome');
      return;
    }

    const novoCliente = {
      nome,
      idade: Number(idade || 0),
      aniversario,
      endereco,
    };

    try {
      await createCliente(novoCliente);
      alert('Cliente salvo com sucesso!');
      await carregarDados();
      setShowModal(false);
      setNome('');
      setIdade('');
      setAniversario('');
      setEndereco('');
    } catch (error) {
      console.error(error);
      alert('Erro ao salvar cliente');
    }
  }

  return (
    <main className={styles.mainContainer}>
      <div className={styles.pageHeader}>
        <div>
          <h2>Clientes</h2>
          <p className={styles.sub}>Cadastre dados fixos dos clientes. Receita e pedidos são calculados automaticamente.</p>
        </div>
      </div>

      <div className={styles.topBar}>
        <div />
        <button
          className={styles.addButton}
          onClick={() => setShowModal(true)}
        >
          + Adicionar
        </button>
      </div>

      <ClientesList clients={clients} onDelete={removerCliente} />

      {showModal && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <h3>Novo Cliente</h3>
            <input
              placeholder="Nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
            <div className={styles.rowInputs}>
              <input
                placeholder="Idade"
                type="number"
                value={idade}
                onChange={(e) => setIdade(e.target.value)}
              />
              <input
                placeholder="Aniversário"
                value={aniversario}
                onChange={(e) => setAniversario(e.target.value)}
              />
            </div>
            <input
              placeholder="Endereço"
              value={endereco}
              onChange={(e) => setEndereco(e.target.value)}
            />
            <div className={styles.modalActions}>
              <button onClick={() => setShowModal(false)}>
                Cancelar
              </button>
              <button
                className={styles.saveButton}
                onClick={salvarCliente}
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

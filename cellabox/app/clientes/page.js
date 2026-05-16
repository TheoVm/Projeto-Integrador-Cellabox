"use client";

import { useState, useEffect } from 'react';

import styles from './page.module.css';

import ClientesList from '../components/ClientesList';

import {
  createCliente,
  getClientes
} from '@/services/back4app';

export default function Clientes() {

  const [showModal, setShowModal] = useState(false);

  const [clients, setClients] = useState([]);

  const [nome, setNome] = useState('');

  const [idade, setIdade] = useState('');

  const [aniversario, setAniversario] = useState('');

  const [pedidoRecente, setPedidoRecente] = useState('');

  const [pedidoMaisRealizado, setPedidoMaisRealizado] = useState('');

  const [receita, setReceita] = useState('');

  const [numeroPedidos, setNumeroPedidos] = useState('');


  useEffect(() => {

    carregarClientes();

  }, []);


  async function carregarClientes() {

    try {

      const dados = await getClientes();

      const clientesFormatados = dados.map((cliente) => ({
        id: cliente.objectId,
        nome: cliente.nome,
        valor: cliente.receita || 0,
      }));

      setClients(clientesFormatados);

    } catch (error) {

      console.error(error);
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
      pedidoRecente,
      pedidoMaisRealizado,
      receita: Number(receita || 0),
      numeroPedidos: Number(numeroPedidos || 0),
    };

    console.log("Cliente enviado:", novoCliente);

    try {

      const resultado = await createCliente(novoCliente);

      console.log("Cliente salvo:", resultado);

      alert('Cliente salvo com sucesso!');

      await carregarClientes();

      setShowModal(false);

      setNome('');
      setIdade('');
      setAniversario('');
      setPedidoRecente('');
      setPedidoMaisRealizado('');
      setReceita('');
      setNumeroPedidos('');

    } catch (error) {

      console.error(error);

      alert('Erro ao salvar cliente');
    }
  }

  return (

    <main className={styles.mainContainer}>

      <h2>Clientes</h2>

      <p className={styles.sub}>
        Lista de clientes cadastrados
      </p>

      <div className={styles.topBar}>

        <div />

        <button
          className={styles.addButton}
          onClick={() => setShowModal(true)}
        >
          + Adicionar
        </button>

      </div>

      <ClientesList clients={clients} />

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
              placeholder="Pedido mais recente"
              value={pedidoRecente}
              onChange={(e) => setPedidoRecente(e.target.value)}
            />

            <input
              placeholder="Pedido mais realizado"
              value={pedidoMaisRealizado}
              onChange={(e) => setPedidoMaisRealizado(e.target.value)}
            />

            <div className={styles.rowInputs}>

              <div className={styles.inputGroupSmall}>

                <span>R$</span>

                <input
                  placeholder="Receita"
                  type="number"
                  value={receita}
                  onChange={(e) => setReceita(e.target.value)}
                />

              </div>

              <input
                placeholder="Total de pedidos"
                type="number"
                value={numeroPedidos}
                onChange={(e) => setNumeroPedidos(e.target.value)}
              />

            </div>

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
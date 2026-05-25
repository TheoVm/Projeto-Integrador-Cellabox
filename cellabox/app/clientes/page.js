"use client";

import { useEffect, useMemo, useState } from 'react';
import styles from './page.module.css';
import ClientesList from '../components/ClientesList';
import { createCliente, deleteCliente, getClientes, getPedidos, getProdutos } from '@/services/back4app';
import { calculateOrderRevenue } from '../utils/finance';
import { useToast } from '../components/ToastProvider';

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

function formatBirthdayInput(value) {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

function calculateAgeFromBirthday(value) {
  if (!value) return '';
  const birthday = parseBrazilianDate(value);
  if (!birthday) return '';

  const today = new Date();
  let age = today.getFullYear() - birthday.getFullYear();
  const birthdayThisYear = new Date(today.getFullYear(), birthday.getMonth(), birthday.getDate());
  if (today < birthdayThisYear) age -= 1;
  return age >= 0 ? age : '';
}

export default function Clientes() {
  const toast = useToast();
  const [clientes, setClientes] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [nome, setNome] = useState('');
  const [aniversario, setAniversario] = useState('');
  const [endereco, setEndereco] = useState('');

  useEffect(() => {
    carregarDados();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function carregarDados() {
    setLoading(true);
    try {
      const [clientesData, pedidosData, produtosData] = await Promise.all([getClientes(), getPedidos(), getProdutos()]);
      setClientes(clientesData || []);
      setPedidos(pedidosData || []);
      setProdutos(produtosData || []);
    } catch (error) {
      console.error(error);
      toast.error('Erro ao carregar clientes.');
    } finally {
      setLoading(false);
    }
  }

  const clients = useMemo(() => {
    const produtosMap = {};
    produtos.forEach((produto) => {
      produtosMap[produto.objectId || produto.id] = produto;
    });

    return clientes.map((cliente) => {
      const clienteId = cliente.objectId || cliente.id;
      const pedidosCliente = pedidos.filter((pedido) => pedido.clienteId === clienteId);
      const receita = pedidosCliente.reduce((sum, pedido) => (
        sum + calculateOrderRevenue(pedido, produtosMap)
      ), 0);

      return {
        id: clienteId,
        nome: cliente.nome,
        valor: receita,
      };
    });
  }, [clientes, pedidos, produtos]);

  async function removerCliente(id) {
    try {
      await deleteCliente(id);
      toast.success('Cliente excluído com sucesso.');
      await carregarDados();
    } catch (error) {
      console.error(error);
      toast.error('Erro ao excluir cliente.');
    }
  }

  const idadeCalculada = useMemo(() => calculateAgeFromBirthday(aniversario), [aniversario]);

  async function salvarCliente() {
    if (!nome.trim()) {
      toast.error('Preencha o nome do cliente.', 'Validação');
      return;
    }

    try {
      await createCliente({
        nome: nome.trim(),
        aniversario,
        endereco,
        idade: idadeCalculada === '' ? 0 : idadeCalculada,
      });
      toast.success('Cliente adicionado com sucesso.');
      setNome('');
      setAniversario('');
      setEndereco('');
      setShowModal(false);
      await carregarDados();
    } catch (error) {
      console.error(error);
      toast.error('Erro ao salvar cliente.');
    }
  }

  return (
    <main className={styles.mainContainer}>
      <div className={styles.pageHeader}>
        <div>
          <h2>Clientes</h2>
          <p className={styles.sub}>Lista de clientes cadastrados e receita gerada por pedidos.</p>
        </div>
      </div>

      <div className={styles.topBar}>
        <div>{loading && <span className={styles.status}>Atualizando...</span>}</div>
        <button className={styles.addButton} onClick={() => setShowModal(true)}>+ Adicionar</button>
      </div>

      <ClientesList clients={clients} onDelete={removerCliente} />

      {showModal && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <h3>Novo Cliente</h3>
            <input
              placeholder="Nome"
              value={nome}
              onChange={(event) => setNome(event.target.value)}
            />

            <input
              placeholder="Aniversário (dd/mm/aaaa)"
              inputMode="numeric"
              maxLength={10}
              value={aniversario}
              onChange={(event) => setAniversario(formatBirthdayInput(event.target.value))}
            />

            <input
              placeholder="Endereço"
              value={endereco}
              onChange={(event) => setEndereco(event.target.value)}
            />

            <div className={styles.agePreview}>
              <span>Idade calculada</span>
              <strong>{idadeCalculada === '' ? '-' : `${idadeCalculada} anos`}</strong>
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

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

import { getClientes, createCliente, deleteCliente } from '@/services/back4app';

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [dadosFormulario, setDadosFormulario] = useState({
    nome: '',
    lucroBruto: '',
    endereco: '',
    aniversario: '',
    historicoCliente: '',
    produtoMaisPedido: '',
  });

  useEffect(() => {
    carregarClientes();
  }, []);

  async function carregarClientes() {
    try {
      const dados = await getClientes();
      setClientes(dados);
    } catch (erro) {
      console.error("Erro ao buscar clientes:", erro);
    }
  }

  function atualizarFormulario(e) {
    const { name, value } = e.target;
    setDadosFormulario(estadoAnterior => ({ ...estadoAnterior, [name]: value }));
  }

  async function salvarNovoCliente(e) {
    e.preventDefault();
    
    if (dadosFormulario.nome.trim()) {
      try {
        await createCliente(dadosFormulario);
        alert("Cliente cadastrado com sucesso!");
        
        setDadosFormulario({
          nome: '',
          lucroBruto: '',
          endereco: '',
          aniversario: '',
          historicoCliente: '',
          produtoMaisPedido: '',
        });
        setMostrarFormulario(false);
        carregarClientes();
      } catch (erro) {
        console.error(erro);
        alert("Erro ao salvar o cliente no banco de dados.");
      }
    }
  }

  async function excluirCliente(id) {
    const confirmacao = confirm("Tem certeza que deseja excluir este cliente permanentemente?");
    if (!confirmacao) return;

    try {
      await deleteCliente(id);
      alert("Cliente excluído com sucesso!");
      carregarClientes(); 
    } catch (erro) {
      console.error(erro);
      alert("Erro ao excluir o cliente.");
    }
  }

  return (
    <main className={styles.mainContainer}>
      <div className={styles.header}>
        <h2>Clientes</h2>
        <button className={styles.addButton} onClick={() => setMostrarFormulario(!mostrarFormulario)}>
          + Adicionar Cliente
        </button>
      </div>

      {mostrarFormulario && (
        <form className={styles.form} onSubmit={salvarNovoCliente}>
          <div className={styles.formGroup}>
            <label>Nome do Cliente:</label>
            <input
              type="text"
              name="nome"
              value={dadosFormulario.nome}
              onChange={atualizarFormulario}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label>Lucro Bruto:</label>
            <input
              type="text"
              name="lucroBruto"
              value={dadosFormulario.lucroBruto}
              onChange={atualizarFormulario}
              placeholder="R$"
            />
          </div>
          <div className={styles.formGroup}>
            <label>Endereço:</label>
            <input
              type="text"
              name="endereco"
              value={dadosFormulario.endereco}
              onChange={atualizarFormulario}
            />
          </div>
          <div className={styles.formGroup}>
            <label>Aniversário:</label>
            <input
              type="date"
              name="aniversario"
              value={dadosFormulario.aniversario}
              onChange={atualizarFormulario}
            />
          </div>
          <div className={styles.formGroup}>
            <label>Histórico do Cliente:</label>
            <input
              type="text"
              name="historicoCliente"
              value={dadosFormulario.historicoCliente}
              onChange={atualizarFormulario}
            />
          </div>
          <div className={styles.formGroup}>
            <label>Produto Mais Pedido:</label>
            <input
              type="text"
              name="produtoMaisPedido"
              value={dadosFormulario.produtoMaisPedido}
              onChange={atualizarFormulario}
            />
          </div>
          <div className={styles.formButtons}>
            <button type="submit" className={styles.submitBtn}>Salvar</button>
            <button type="button" className={styles.cancelBtn} onClick={() => setMostrarFormulario(false)}>Cancelar</button>
          </div>
        </form>
      )}

      <div className={styles.searchContainer}>
        <input
          type="text"
          placeholder="Search"
          className={styles.searchInput}
        />
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Cliente</th>
            <th>Lucro Bruto</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {clientes.map((cliente) => {
            const idCliente = cliente.objectId || cliente.id;
            
            return (
              <tr key={idCliente}>
                <td>{cliente.nome}</td>
                <td>{cliente.lucroBruto || 'R$ 0,00'}</td>
                <td>
                  <Link href={`/clientes/${idCliente}`} className={styles.viewLink}>
                    Ver Detalhes
                  </Link>
                  
                  <button
                    onClick={() => excluirCliente(idCliente)}
                    style={{
                      marginLeft: '15px',
                      background: 'none',
                      border: 'none',
                      color: '#ff4d4d',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      fontSize: '14px',
                      textDecoration: 'underline'
                    }}
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </main>
  );
}
'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

export default function Clientes() {
  const [clientes, setClientes] = useState([
    { id: 1, nome: 'Felipe De Azevedo Augusto', lucroBruto: 'R$322,44', endereco: 'Avenida JJ Apolinário, 123', aniversario: '17/03/2004', historicoCliente: 'Último pedido: Quattro Sapori', produtoMaisPedido: 'Quattro Sapori' },
    { id: 2, nome: 'Paula Cristiane de Souza', lucroBruto: 'R$134,07', endereco: 'Rua das Flores, 456', aniversario: '22/05/1995', historicoCliente: 'Última compra há 2 semanas', produtoMaisPedido: 'Pesto Classico' },
    { id: 3, nome: 'Regina Nobrega da Silva', lucroBruto: 'R$240,67', endereco: 'Avenida Principal, 789', aniversario: '10/11/1988', historicoCliente: 'Cliente há 3 anos', produtoMaisPedido: 'Tomate Seco' },
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    lucroBruto: '',
    endereco: '',
    aniversario: '',
    historicoCliente: '',
    produtoMaisPedido: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddCliente = (e) => {
    e.preventDefault();
    if (formData.nome.trim()) {
      setClientes(prev => [
        ...prev,
        { id: prev.length + 1, ...formData }
      ]);
      setFormData({
        nome: '',
        lucroBruto: '',
        endereco: '',
        aniversario: '',
        historicoCliente: '',
        produtoMaisPedido: '',
      });
      setShowAddForm(false);
    }
  };

  return (
    <main className={styles.mainContainer}>
      <div className={styles.header}>
        <h2>Clientes</h2>
        <button className={styles.addButton} onClick={() => setShowAddForm(!showAddForm)}>
          + Adicionar Cliente
        </button>
      </div>

      {showAddForm && (
        <form className={styles.form} onSubmit={handleAddCliente}>
          <div className={styles.formGroup}>
            <label>Nome do Cliente:</label>
            <input
              type="text"
              name="nome"
              value={formData.nome}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label>Lucro Bruto:</label>
            <input
              type="text"
              name="lucroBruto"
              value={formData.lucroBruto}
              onChange={handleInputChange}
              placeholder="R$"
            />
          </div>
          <div className={styles.formGroup}>
            <label>Endereço:</label>
            <input
              type="text"
              name="endereco"
              value={formData.endereco}
              onChange={handleInputChange}
            />
          </div>
          <div className={styles.formGroup}>
            <label>Aniversário:</label>
            <input
              type="date"
              name="aniversario"
              value={formData.aniversario}
              onChange={handleInputChange}
            />
          </div>
          <div className={styles.formGroup}>
            <label>Histórico do Cliente:</label>
            <input
              type="text"
              name="historicoCliente"
              value={formData.historicoCliente}
              onChange={handleInputChange}
            />
          </div>
          <div className={styles.formGroup}>
            <label>Produto Mais Pedido:</label>
            <input
              type="text"
              name="produtoMaisPedido"
              value={formData.produtoMaisPedido}
              onChange={handleInputChange}
            />
          </div>
          <div className={styles.formButtons}>
            <button type="submit" className={styles.submitBtn}>Salvar</button>
            <button type="button" className={styles.cancelBtn} onClick={() => setShowAddForm(false)}>Cancelar</button>
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
          {clientes.map((cliente) => (
            <tr key={cliente.id}>
              <td>{cliente.nome}</td>
              <td>{cliente.lucroBruto}</td>
              <td>
                <Link href={`/clientes/${cliente.id}`} className={styles.viewLink}>
                  Ver Detalhes
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

export default function ClientesListClient({ clientes: clientesIniciais }) {
  const [clientes, setClientes] = useState(clientesIniciais);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    lucroBruto: '',
    endereco: '',
    aniversario: '',
    historicoCliente: '',
    produtoMaisPedido: '',
  });

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleAddCliente = (event) => {
    event.preventDefault();

    if (!formData.nome.trim()) {
      return;
    }

    setClientes((current) => [
      ...current,
      { id: current.length + 1, ...formData },
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
  };

  return (
    <main className={styles.mainContainer}>
      <div className={styles.header}>
        <h2>Clientes</h2>
        <button className={styles.addButton} onClick={() => setShowAddForm((current) => !current)}>
          + Adicionar Cliente
        </button>
      </div>

      {showAddForm && (
        <form className={styles.form} onSubmit={handleAddCliente}>
          <div className={styles.formGroup}>
            <label htmlFor="nome">Nome do Cliente:</label>
            <input id="nome" type="text" name="nome" value={formData.nome} onChange={handleInputChange} required />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="lucroBruto">Lucro Bruto:</label>
            <input id="lucroBruto" type="text" name="lucroBruto" value={formData.lucroBruto} onChange={handleInputChange} placeholder="R$" />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="endereco">Endereço:</label>
            <input id="endereco" type="text" name="endereco" value={formData.endereco} onChange={handleInputChange} />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="aniversario">Aniversário:</label>
            <input id="aniversario" type="date" name="aniversario" value={formData.aniversario} onChange={handleInputChange} />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="historicoCliente">Histórico do Cliente:</label>
            <input id="historicoCliente" type="text" name="historicoCliente" value={formData.historicoCliente} onChange={handleInputChange} />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="produtoMaisPedido">Produto Mais Pedido:</label>
            <input id="produtoMaisPedido" type="text" name="produtoMaisPedido" value={formData.produtoMaisPedido} onChange={handleInputChange} />
          </div>
          <div className={styles.formButtons}>
            <button type="submit" className={styles.submitBtn}>Salvar</button>
            <button type="button" className={styles.cancelBtn} onClick={() => setShowAddForm(false)}>Cancelar</button>
          </div>
        </form>
      )}

      <div className={styles.searchContainer}>
        <input type="text" placeholder="Search" className={styles.searchInput} />
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
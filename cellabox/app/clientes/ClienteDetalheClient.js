'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

export default function ClienteDetalheClient({ cliente }) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <main className={styles.mainContainer}>
      <div className={styles.backButton}>
        <Link href="/clientes">← Voltar</Link>
      </div>

      <div className={styles.detailCard}>
        <div className={styles.cardHeader}>
          <h2>{cliente.nome}</h2>
          <button className={styles.editButton} onClick={() => setIsEditing((current) => !current)}>
            ✏️
          </button>
        </div>

        <div className={styles.detailRow}>
          <div className={styles.labelColumn}>Lucro gerado:</div>
          <div className={styles.valueColumn}>
            <span className={styles.lucroValue}>{cliente.lucroBruto}</span>
          </div>
        </div>

        <div className={styles.detailRow}>
          <div className={styles.labelColumn}>Endereço:</div>
          <div className={styles.valueColumn}>{cliente.endereco}</div>
        </div>

        <div className={styles.detailRow}>
          <div className={styles.labelColumn}>Aniversário:</div>
          <div className={styles.valueColumn}>{cliente.aniversario}</div>
        </div>

        <div className={styles.detailRow}>
          <div className={styles.labelColumn}>Histórico do cliente:</div>
          <div className={styles.valueColumn}>{cliente.historicoCliente}</div>
        </div>

        <div className={styles.detailRow}>
          <div className={styles.labelColumn}>Produto mais pedido:</div>
          <div className={styles.valueColumn}>{cliente.produtoMaisPedido}</div>
        </div>
      </div>
    </main>
  );
}
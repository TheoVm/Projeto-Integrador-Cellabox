'use client'

import Link from 'next/link';
import styles from './list.module.css';

export default function ClientesList({ clients }) {
    const lista = clients || [
    { id: '1', nome: 'Ana Beatriz', valor: 245.9 },
    { id: '2', nome: 'Lucas Fernandes', valor: 89.5 },
    { id: '3', nome: 'Mariana Costa', valor: 420.0 },
    { id: '4', nome: 'Gabriel Souza', valor: 157.3 },
    { id: '5', nome: 'Juliana Almeida', valor: 98.75 },
    { id: '6', nome: 'Rafael Martins', valor: 310.2 },
    { id: '7', nome: 'Camila Rocha', valor: 52.4 },
    { id: '8', nome: 'Felipe Santos', valor: 184.99 },
    { id: '9', nome: 'Larissa Melo', valor: 276.6 },
    { id: '10', nome: 'Thiago Lima', valor: 133.45 },
    ];

  return (
    <div className={styles.container}>
      <div className={styles.table}>
        <div className={styles.rowHeader}>
          <div>Cliente</div>
          <div style={{textAlign:'right'}}>Total (R$)</div>
        </div>

        {lista.map((c, idx) => (
          <Link key={c.id} href={`/clientes/${c.id}`} className={`${styles.row} ${styles.rowData}`}>
            <span className={styles.left}>{c.nome}</span>
            <span className={styles.right}>R$ {c.valor.toFixed(2)}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

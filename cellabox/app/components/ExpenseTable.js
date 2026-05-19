'use client'

import listStyles from './list.module.css';
import styles from './ExpenseTable.module.css';

export default function ExpenseTable({ items, onDelete }) {
  const lista = items || [];
  const formatDate = (date) => date ? new Date(date).toLocaleDateString('pt-BR') : '-';

  return (
    <div className={styles.container}>
      <div className={styles.table}>
        <div className={styles.rowHeader}>
          <div>Nome</div>
          <div className={styles.value}>Valor (R$)</div>
          <div>Data</div>
        </div>

        {lista.map((g) => (
          <div key={g.objectId || g.id} className={`${styles.row} ${listStyles.rowData}`}>
            <span className={styles.left}>{g.nome || g.title || 'Gasto'}</span>

            <div className={styles.value}>R$ {Number(g.valor || g.value || 0).toFixed(2)}</div>

            <div className={styles.date}>{formatDate(g.createdAt || g.data || g.date)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

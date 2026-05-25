'use client'

import Link from 'next/link';
import styles from './list.module.css';

export default function ClientesList({ clients, onDelete }) {
  const lista = clients || [];

  const gridStyle = {
    gridTemplateColumns: 'minmax(0, 1fr) 180px 100px',
  };

  return (
    <div className={styles.container}>
      <div className={styles.table}>

        <div className={`${styles.rowHeader} ${styles.clientGrid}`} style={gridStyle}>
          <div className={styles.left}>Cliente</div>
          <div className={styles.right}>Total (R$)</div>
          <div></div>
        </div>

        {lista.map((c) => (
          <div key={c.id} className={`${styles.row} ${styles.clientGrid}`} style={gridStyle}>
            <Link href={`/clientes/${c.id}`} className={styles.clientLink}>
              <span className={styles.left}>
                {c.nome}
              </span>

              <span className={styles.right}>
                R$ {Number(c.valor || 0).toFixed(2)}
              </span>
            </Link>

            <div className={styles.actionCell}>
              <button
                onClick={() => onDelete(c.id)}
                className={styles.deleteButton}
              >
                Excluir
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

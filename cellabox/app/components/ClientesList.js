'use client'

import Link from 'next/link';

import styles from './list.module.css';

export default function ClientesList({ clients }) {

  const lista = clients || [];

  return (

    <div className={styles.container}>

      <div className={styles.table}>

        <div className={styles.rowHeader}>

          <div>Cliente</div>

          <div style={{ textAlign: 'right' }}>
            Total (R$)
          </div>

        </div>

        {lista.map((c) => (

          <Link
            key={c.id}
            href={`/clientes/${c.id}`}
            className={`${styles.row} ${styles.rowData}`}
          >

            <span className={styles.left}>
              {c.nome}
            </span>

            <span className={styles.right}>
              R$ {Number(c.valor || 0).toFixed(2)}
            </span>

          </Link>

        ))}

      </div>

    </div>
  );
}
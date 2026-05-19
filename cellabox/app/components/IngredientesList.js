'use client';

import styles from './list.module.css';

export default function IngredientesList({ initial, onChange }) {
  const items = initial || [];

  function handleChange(id, value) {
    const num = parseFloat(value || 0);
    const updated = items.map((it) => (it.id === id ? { ...it, valor: num } : it));
    onChange?.(updated);
  }

  return (
    <div className={styles.container}>
      <div className={styles.table}>
        <div className={styles.rowHeader}>
          <div>Ingrediente</div>
          <div style={{ textAlign: 'right' }}>Valor / kg</div>
        </div>

        {items.map((it) => (
          <div key={it.id} className={`${styles.row} ${styles.rowData}`}>
            <span className={styles.left}>{it.nome}</span>

            <div className={styles.rightInput}>
              <input
                className={styles.input}
                type="number"
                step="0.01"
                value={it.valor}
                onChange={(e) => handleChange(it.id, e.target.value)}
              />
              <span className={styles.unit}>R$ /kg</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

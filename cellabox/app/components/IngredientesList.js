'use client'

import { useState } from 'react';
import styles from './list.module.css';

export default function IngredientesList({ initial }) {
    const initialData = initial || [
    { id: 'i1', nome: 'Chocolate Belga', valor: 68.9 },
    { id: 'i2', nome: 'Leite Condensado', valor: 14.5 },
    { id: 'i3', nome: 'Creme de Leite', valor: 11.2 },
    { id: 'i4', nome: 'Morango', valor: 24.9 },
    { id: 'i5', nome: 'Nutella', valor: 79.99 },
    { id: 'i6', nome: 'Granulado', valor: 18.75 },
    { id: 'i7', nome: 'Leite em Pó', valor: 32.4 },
    { id: 'i8', nome: 'Massa de Brownie', valor: 27.9 },
    { id: 'i9', nome: 'Doce de Leite', valor: 29.5 },
    { id: 'i10', nome: 'Ovomaltine', valor: 41.0 },
    { id: 'i11', nome: 'Paçoca', valor: 22.8 },
    { id: 'i12', nome: 'Marshmallow', valor: 16.3 },
    ];

    const [items, setItems] = useState(initialData);

    function handleChange(id, value) {
        const num = parseFloat(value || 0);
        setItems((prev) => prev.map((it) => (it.id === id ? { ...it, valor: num } : it)));
    }

    return (
    <div className={styles.container}>
      <div className={styles.table}>
        <div className={styles.rowHeader}>
          <div>Ingrediente</div>
          <div style={{textAlign:'right'}}>Valor / kg</div>
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

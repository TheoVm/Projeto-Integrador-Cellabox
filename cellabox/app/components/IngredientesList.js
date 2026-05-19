'use client';

import styles from './list.module.css';

export default function IngredientesList({ initial, onChange, onSave, onDelete }) {
  const items = initial || [];

  function handleChange(id, value) {
    const num = parseFloat(value || 0);
    const updated = items.map((it) => (it.id === id ? { ...it, valor: num } : it));
    onChange?.(updated);
  }

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: '1fr 180px 100px',
    alignItems: 'center',
  };

  return (
    <div className={styles.container}>
      <div className={styles.table}>
        
        <div className={styles.rowHeader} style={gridStyle}>
          <div>Ingrediente</div>
          <div style={{ textAlign: 'right' }}>Valor / kg</div>
          <div></div> 
        </div>

        {items.map((it) => (
          <div key={it.id} className={`${styles.row} ${styles.rowData}`} style={gridStyle}>
            <span className={styles.left}>{it.nome}</span>

            <div className={styles.rightInput} style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '5px' }}>
              <input
                className={styles.input}
                type="number"
                step="0.01"
                value={it.valor}
                onChange={(e) => handleChange(it.id, e.target.value)}
                onBlur={(e) => onSave?.(it.id, e.target.value)} 
                style={{ width: '80px' }}
              />
              <span className={styles.unit}>R$ /kg</span>
            </div>

            <div style={{ textAlign: 'right', paddingRight: '10px' }}>
              <button
                onClick={() => onDelete?.(it.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#ff4d4d',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  whiteSpace: 'nowrap'
                }}
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
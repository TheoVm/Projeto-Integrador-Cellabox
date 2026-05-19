'use client'

import styles from './finance.module.css';

export default function FinancialCard({ title, value, subtitle, format = 'currency' }) {
  const displayValue = format === 'number'
    ? Number(value || 0).toLocaleString('pt-BR')
    : `R$ ${Number(value || 0).toFixed(2)}`;

  return (
    <div className={styles.card}>
      <div className={styles.cardTitle}>{title}</div>
      <div className={styles.cardValue}>{displayValue}</div>
      {subtitle && <div className={styles.cardSubtitle}>{subtitle}</div>}
    </div>
  );
}

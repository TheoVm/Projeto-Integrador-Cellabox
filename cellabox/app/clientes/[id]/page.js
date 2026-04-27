import styles from './page.module.css';

export default function ClienteIndividual({ params }) {
  return (
    <main className={styles.mainContainer}>
      <h2>Cliente Individual</h2>
      <p>ID do Cliente: {params.id}</p>
      <p>Detalhes do cliente aqui.</p>
    </main>
  );
}
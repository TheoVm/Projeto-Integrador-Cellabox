import styles from './page.module.css';

export default function ProdutoIndividual({ params }) {
  return (
    <main className={styles.mainContainer}>
      <h2>Produto Individual</h2>
      <p>ID do Produto: {params.id}</p>
      <p>Detalhes do produto aqui.</p>
    </main>
  );
}
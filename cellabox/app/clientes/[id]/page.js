import styles from './page.module.css';

export default function ClienteIndividual({ params }) {
  const cliente = {
    id: params.id,
    nome: 'João Silva',
    idade: 25,
    aniversario: '10/05',
    pedidoMaisRecente: 'Box Premium',
    pedidoMaisRealizado: 'Combo Tradicional',
    receitaGerada: 0.0,
    totalPedidos: 12,
    notas: 'Cliente frequente, prefere embalagens grandes.'
  };

  return (
    <main className={styles.mainContainer}>
      <div className={styles.card}>
        <div className={styles.topSection}>
          <div className={styles.info}>
            <h1>{cliente.nome}</h1>
            <hr />
            <p>{cliente.notas}</p>
          </div>
        </div>

        <div className={styles.metrics}>
          <div>
            <span>Receita gerada</span>
            <strong>R$ {cliente.receitaGerada.toFixed(2)}</strong>
          </div>

          <div>
            <span>Total de pedidos</span>
            <strong>{cliente.totalPedidos}</strong>
          </div>
        </div>

        <div className={styles.bottomRow}>
          <div className={styles.sectionWrapper}>
            <h3 className={styles.sectionTitle}>Histórico</h3>
            <div className={styles.section}>
              <div><strong>Pedido mais recente</strong><div>{cliente.pedidoMaisRecente}</div></div>
              <div style={{marginTop:'0.5rem'}}><strong>Pedido mais realizado</strong><div>{cliente.pedidoMaisRealizado}</div></div>
            </div>
          </div>

          <div className={styles.sectionWrapperSmall}>
            <h3 className={styles.sectionTitle}>Detalhes</h3>
            <div className={styles.sectionSmall}>
              <div><strong>Idade</strong><div>{cliente.idade} anos</div></div>
              <div style={{marginTop:'0.5rem'}}><strong>Aniversário</strong><div>{cliente.aniversario}</div></div>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
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
  };

  return (
    <main className={styles.mainContainer}>
      <div className={styles.card}>
        <div className={styles.topSection}>
          <div className={styles.info}>
            <h1>{cliente.nome}</h1>
            <hr/>
          </div>
        </div>

        <div className={styles.bottomRow}>
          <div className={styles.sectionWrapper}>

            <h3 className={styles.sectionTitle}>Histórico</h3>

            <div className={styles.section}>
              <div className={styles.table2}>

                <div className={styles.rowHeader2}>
                  <span>Informação</span>
                  <span>Valor</span>
                </div>

                <div className={styles.row2}>
                  <span>Pedido mais recente</span>
                  <span>{cliente.pedidoMaisRecente}</span>
                </div>

                <div className={styles.row2}>
                  <span>Pedido mais realizado</span>
                  <span>{cliente.pedidoMaisRealizado}</span>
                </div>

                <div className={styles.row2}>
                  <span>Total de pedidos</span>
                  <span>{cliente.totalPedidos}</span>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.sectionWrapperSmall}>
            <h3 className={styles.sectionTitle}>Detalhes</h3>

            <div className={styles.sectionSmall}>
              <div className={styles.table2}>

                <div className={styles.rowHeader2}>
                  <span>Campo</span>
                  <span>Valor</span>
                </div>

                <div className={styles.row2}>
                  <span>Idade</span>
                  <span>{cliente.idade} anos</span>
                </div>

                <div className={styles.row2}>
                  <span>Aniversário</span>
                  <span>{cliente.aniversario}</span>
                </div>

                <div className={styles.row2}>
                  <span>Receita gerada</span>
                  <span>
                    R$ {cliente.receitaGerada.toFixed(2)}
                  </span>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
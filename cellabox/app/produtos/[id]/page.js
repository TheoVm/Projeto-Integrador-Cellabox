import styles from "./page.module.css";

export default function ProdutoIndividual({ params }) {
  const produto = {
    nome: "Quattro Sapori",
    descricao:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    custo: 67.34,
    lucro: 67.34,
    ingredientes: [
      { nome: "Alface", qtd: "50g", valor: "R$2,50" },
      { nome: "Tomate", qtd: "65g", valor: "R$6,15" },
      { nome: "Sal", qtd: "200g", valor: "R$4,00" },
      { nome: "Farinha", qtd: "150g", valor: "R$15,00" },
    ],
    embalagens: [
      { nome: "Pequena", valor: "R$5,00" },
      { nome: "Média", valor: "R$10,00" },
      { nome: "Grande", valor: "R$15,00" },
    ],
  };

  return (
    <main className={styles.mainContainer}>
      <div className={styles.card}>
        
        <div className={styles.topSection}>
          <img
            src="https://picsum.photos/200"
            alt="produto"
            className={styles.image}
          />

          <div className={styles.info}>
            <h1>{produto.nome}</h1>
            <hr />
            <p>{produto.descricao}</p>
          </div>
        </div>

        <div className={styles.metrics}>
          <div>
            <span>Custo médio</span>
            <strong>R$ {produto.custo.toFixed(2)}</strong>
          </div>

          <div>
            <span>Lucro médio</span>
            <strong>R$ {produto.lucro.toFixed(2)}</strong>
          </div>
        </div>

        <div className={styles.bottomRow}>
          
          <div className={styles.sectionWrapper}>
            <h3 className={styles.sectionTitle}>Ingredientes</h3>

            <div className={styles.section}>
              <div className={styles.table3}>
                <div className={styles.rowHeader3}>
                  <span>Ingrediente</span>
                  <span>Qtd</span>
                  <span>Valor</span>
                </div>

                {produto.ingredientes.map((i, index) => (
                  <div key={index} className={styles.row3}>
                    <span>{i.nome}</span>
                    <span>{i.qtd}</span>
                    <span>{i.valor}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.sectionWrapperSmall}>
            <h3 className={styles.sectionTitle}>Embalagens</h3>

            <div className={styles.sectionSmall}>
              <div className={styles.table2}>
                <div className={styles.rowHeader2}>
                  <span>Tipo</span>
                  <span>Valor</span>
                </div>

                {produto.embalagens.map((e, index) => (
                  <div key={index} className={styles.row2}>
                    <span>{e.nome}</span>
                    <span>{e.valor}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
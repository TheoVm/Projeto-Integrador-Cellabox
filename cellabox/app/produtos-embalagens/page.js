"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

export default function ProdutosEmbalagens() {
  const [view, setView] = useState("produtos");
  const [showModal, setShowModal] = useState(false);
  const [ingredientes, setIngredientes] = useState([
    { nome: "", quantidade: "" }
  ]);
  const router = useRouter();

  const produtos = [
    { id: 1, nome: "Exemplo 1" },
    { id: 2, nome: "Exemplo 2" },
    { id: 3, nome: "Exemplo 3" },
    { id: 4, nome: "Exemplo 4" },
    { id: 5, nome: "Exemplo 5" },
    { id: 6, nome: "Exemplo 6" },
    { id: 7, nome: "Exemplo 7" },
    { id: 8, nome: "Exemplo 8" },
    
  ];

  const lista = produtos;


  function addIngrediente() {
    setIngredientes([...ingredientes, { nome: "", quantidade: "" }]);
  }

  function updateIngrediente(index, field, value) {
    const novos = [...ingredientes];
    novos[index][field] = value;
    setIngredientes(novos);
  }

  return (
    <main className={styles.mainContainer}>
      <h2>Produtos e Embalagens</h2>

      {/* TOP BAR */}
      <div className={styles.topBar}>
        <div className={styles.topButtons}>
          <button
            className={view === "produtos" ? styles.active : ""}
            onClick={() => setView("produtos")}
          >
            Produtos
          </button>

          <button
            className={view === "embalagens" ? styles.active : ""}
            onClick={() => setView("embalagens")}
          >
            Embalagens
          </button>
        </div>

        <button
          className={styles.addButton}
          onClick={() => setShowModal(true)}
        >
          + Adicionar
        </button>
      </div>

      <div className={styles.grid}>
        {lista.map((item) => (
          <div
            key={item.id}
            className={styles.card}
            onClick={() => router.push(`/${view}/${item.id}`)}
          >
            <h3>{item.nome}</h3>
          </div>
        ))}
      </div>

      {showModal && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <h3>Novo Produto</h3>
            <input placeholder="Nome" />
            <textarea placeholder="Descrição" />

            <div className={styles.rowInputs}>
              <div className={styles.inputGroup}>
                <span>R$</span>
                <input placeholder="Custo de Produção" type="number" />
              </div>

              <div className={styles.inputGroup}>
                <span>R$</span>
                <input placeholder="Preço de Venda" type="number" />
              </div>
            </div>

            <input type="file" />

            <div className={styles.ingredientes}>
              <span>Ingredientes</span>

              {ingredientes.map((ing, index) => (
                <div key={index} className={styles.ingredienteRow}>
                  
                  <input
                    className={styles.ingredienteNome}
                    value={ing.nome}
                    onChange={(e) =>
                      updateIngrediente(index, "nome", e.target.value)
                    }
                    placeholder="Nome do ingrediente"
                  />

                  <div className={styles.inputGroupSmall}>
                    <input
                      type="number"
                      value={ing.quantidade}
                      onChange={(e) =>
                        updateIngrediente(index, "quantidade", e.target.value)
                      }
                      placeholder="Qtd"
                    />
                    <span>g</span>
                  </div>

                </div>
              ))}

              <button
                type="button"
                onClick={addIngrediente}
                className={styles.addIngrediente}
              >
                + Adicionar ingrediente
              </button>
            </div>
            <div className={styles.modalActions}>
              <button onClick={() => setShowModal(false)}>
                Cancelar
              </button>

              <button className={styles.saveButton}>
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
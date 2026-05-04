"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

export default function ProdutosEmbalagens() {
  const [view, setView] = useState("produtos");
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

  const embalagens = [
    { id: 1, nome: "Embalagem 1" },
    { id: 2, nome: "Embalagem 2" },
    { id: 3, nome: "Embalagem 3" },
    { id: 4, nome: "Embalagem 4" },
  ];

  const lista = view === "produtos" ? produtos : embalagens;

  return (
    <main className={styles.mainContainer}>
      <h2>Produtos e Embalagens</h2>

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
    </main>
  );
}
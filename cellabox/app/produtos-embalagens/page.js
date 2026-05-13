"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

import {
  createProduto,
  getProdutos,
} from "@/services/back4app";

export default function ProdutosEmbalagens() {

  const router = useRouter();

  const [view, setView] = useState("produtos");

  const [showModal, setShowModal] = useState(false);

  const [produtos, setProdutos] = useState([]);

  const [nome, setNome] = useState("");

  const [descricao, setDescricao] = useState("");

  const [custo, setCusto] = useState("");

  const [preco, setPreco] = useState("");

  const [ingredientes, setIngredientes] = useState([
    { nome: "", quantidade: "" }
  ]);

  useEffect(() => {
    carregarProdutos();
  }, []);

  async function carregarProdutos() {

    const dados = await getProdutos();

    setProdutos(dados);
  }

  function addIngrediente() {

    setIngredientes([
      ...ingredientes,
      { nome: "", quantidade: "" }
    ]);
  }

  function updateIngrediente(index, field, value) {

    const novos = [...ingredientes];

    novos[index][field] = value;

    setIngredientes(novos);
  }

  async function salvarProduto() {

    if (!nome || !descricao) {

      alert("Preencha os campos!");

      return;
    }

    const novoProduto = {
      nome,
      descricao,
      custoProducao: Number(custo),
      precoVenda: Number(preco),
      ingredientes,
    };

    try {

      await createProduto(novoProduto);

      alert("Produto salvo com sucesso!");

      setNome("");
      setDescricao("");
      setCusto("");
      setPreco("");

      setIngredientes([
        { nome: "", quantidade: "" }
      ]);

      setShowModal(false);

      carregarProdutos();

    } catch (error) {

      console.error(error);

      alert("Erro ao salvar produto");
    }
  }

  return (

    <main className={styles.mainContainer}>

      <h2>Produtos e Embalagens</h2>

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

        {produtos.map((item) => (

          <div
            key={item.objectId}
            className={styles.card}
            onClick={() =>
              router.push(`/${view}/${item.objectId}`)
            }
          >

            <h3>{item.nome}</h3>

          </div>

        ))}

      </div>

      {showModal && (

        <div className={styles.overlay}>

          <div className={styles.modal}>

            <h3>Novo Produto</h3>

            <input
              placeholder="Nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />

            <textarea
              placeholder="Descrição"
              value={descricao}
              onChange={(e) =>
                setDescricao(e.target.value)
              }
            />

            <div className={styles.rowInputs}>

              <div className={styles.inputGroup}>

                <span>R$</span>

                <input
                  placeholder="Custo de Produção"
                  type="number"
                  value={custo}
                  onChange={(e) =>
                    setCusto(e.target.value)
                  }
                />

              </div>

              <div className={styles.inputGroup}>

                <span>R$</span>

                <input
                  placeholder="Preço de Venda"
                  type="number"
                  value={preco}
                  onChange={(e) =>
                    setPreco(e.target.value)
                  }
                />

              </div>

            </div>

            <input type="file" />

            <div className={styles.ingredientes}>

              <span>Ingredientes</span>

              {ingredientes.map((ing, index) => (

                <div
                  key={index}
                  className={styles.ingredienteRow}
                >

                  <input
                    className={styles.ingredienteNome}
                    value={ing.nome}
                    onChange={(e) =>
                      updateIngrediente(
                        index,
                        "nome",
                        e.target.value
                      )
                    }
                    placeholder="Nome do ingrediente"
                  />

                  <div className={styles.inputGroupSmall}>

                    <input
                      type="number"
                      value={ing.quantidade}
                      onChange={(e) =>
                        updateIngrediente(
                          index,
                          "quantidade",
                          e.target.value
                        )
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

              <button
                onClick={() => setShowModal(false)}
              >
                Cancelar
              </button>

              <button
                className={styles.saveButton}
                onClick={salvarProduto}
              >
                Salvar
              </button>

            </div>

          </div>

        </div>

      )}

    </main>
  );
}
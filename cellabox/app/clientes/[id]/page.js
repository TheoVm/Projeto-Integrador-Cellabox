"use client";

import { useEffect, useState } from "react";

import { useParams } from "next/navigation";

import styles from "./page.module.css";

import {
  getClientes,
  updateCliente
} from "@/services/back4app";

export default function ClienteDetalhes() {

  const params = useParams();

  const { id } = params;

  const [cliente, setCliente] = useState(null);

  const [editando, setEditando] = useState(false);

  const [nome, setNome] = useState("");

  const [idade, setIdade] = useState("");

  const [aniversario, setAniversario] = useState("");

  const [pedidoRecente, setPedidoRecente] = useState("");

  const [pedidoMaisRealizado, setPedidoMaisRealizado] = useState("");

  const [receita, setReceita] = useState("");

  const [numeroPedidos, setNumeroPedidos] = useState("");


  useEffect(() => {

    carregarCliente();

  }, []);


  async function carregarCliente() {

    try {

      const clientes = await getClientes();

      const encontrado = clientes.find(
        (c) => c.objectId === id
      );

      if (!encontrado) return;

      setCliente(encontrado);

      setNome(encontrado.nome || "");

      setIdade(encontrado.idade || "");

      setAniversario(encontrado.aniversario || "");

      setPedidoRecente(
        encontrado.pedidoRecente || ""
      );

      setPedidoMaisRealizado(
        encontrado.pedidoMaisRealizado || ""
      );

      setReceita(encontrado.receita || "");

      setNumeroPedidos(
        encontrado.numeroPedidos || ""
      );

    } catch (error) {

      console.error(error);
    }
  }


  async function salvarAlteracoes() {

    try {

      const dadosAtualizados = {
        nome,
        idade: Number(idade || 0),
        aniversario,
        pedidoRecente,
        pedidoMaisRealizado,
        receita: Number(receita || 0),
        numeroPedidos: Number(numeroPedidos || 0),
      };

      await updateCliente(id, dadosAtualizados);

      alert("Cliente atualizado!");

      setEditando(false);

      carregarCliente();

    } catch (error) {

      console.error(error);

      alert("Erro ao atualizar cliente");
    }
  }

  if (!cliente) {

    return (

      <main className={styles.mainContainer}>

        <h2>Carregando...</h2>

      </main>
    );
  }

  return (

    <main className={styles.mainContainer}>

      <div className={styles.card}>

        <div className={styles.topSection}>

          <div className={styles.info}>

            {editando ? (

              <input
                className={styles.inputTitle}
                value={nome}
                onChange={(e) =>
                  setNome(e.target.value)
                }
              />

            ) : (

              <h1>{nome}</h1>

            )}

            <hr />

            {editando ? (

              <textarea
                className={styles.textarea}
                value={pedidoRecente}
                onChange={(e) =>
                  setPedidoRecente(e.target.value)
                }
              />

            ) : (

              <p>
                Último pedido: {pedidoRecente}
              </p>

            )}

          </div>

        </div>

        <div className={styles.metrics}>

          <div>

            <span>Receita Total</span>

            {editando ? (

              <input
                type="number"
                className={styles.input}
                value={receita}
                onChange={(e) =>
                  setReceita(e.target.value)
                }
              />

            ) : (

              <strong>
                R$ {Number(receita || 0).toFixed(2)}
              </strong>

            )}

          </div>

          <div>

            <span>Total de Pedidos</span>

            {editando ? (

              <input
                type="number"
                className={styles.input}
                value={numeroPedidos}
                onChange={(e) =>
                  setNumeroPedidos(e.target.value)
                }
              />

            ) : (

              <strong>{numeroPedidos}</strong>

            )}

          </div>

          <div>

            <span>Idade</span>

            {editando ? (

              <input
                type="number"
                className={styles.input}
                value={idade}
                onChange={(e) =>
                  setIdade(e.target.value)
                }
              />

            ) : (

              <strong>{idade}</strong>

            )}

          </div>

        </div>

        <div className={styles.bottomRow}>

          <div className={styles.sectionWrapper}>

            <div className={styles.sectionTitle}>
              Informações
            </div>

            <div className={styles.section}>

              <div className={styles.table2}>

                <div className={styles.row2}>

                  <span>Aniversário</span>

                  {editando ? (

                    <input
                      className={styles.input}
                      value={aniversario}
                      onChange={(e) =>
                        setAniversario(e.target.value)
                      }
                    />

                  ) : (

                    <span>{aniversario}</span>

                  )}

                </div>

                <div className={styles.row2}>

                  <span>Pedido favorito</span>

                  {editando ? (

                    <input
                      className={styles.input}
                      value={pedidoMaisRealizado}
                      onChange={(e) =>
                        setPedidoMaisRealizado(
                          e.target.value
                        )
                      }
                    />

                  ) : (

                    <span>
                      {pedidoMaisRealizado}
                    </span>

                  )}

                </div>

              </div>

            </div>

          </div>

        </div>

        <div className={styles.actions}>

          {!editando ? (

            <button
              className={styles.editButton}
              onClick={() => setEditando(true)}
            >
              Editar
            </button>

          ) : (

            <button
              className={styles.saveButton}
              onClick={salvarAlteracoes}
            >
              Salvar Alterações
            </button>

          )}

        </div>

      </div>

    </main>
  );
}
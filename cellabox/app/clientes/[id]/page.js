"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import styles from "./page.module.css";
import {
  getClientes,
  getPedidos,
  updateCliente,
} from "@/services/back4app";

export default function ClienteDetalhes() {
  const { id } = useParams();
  const [cliente, setCliente] = useState(null);
  const [pedidos, setPedidos] = useState([]);
  const [editando, setEditando] = useState(false);
  const [nome, setNome] = useState("");
  const [idade, setIdade] = useState("");
  const [aniversario, setAniversario] = useState("");
  const [endereco, setEndereco] = useState("");

  useEffect(() => {
    carregarCliente();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function carregarCliente() {
    try {
      const [clientes, pedidosData] = await Promise.all([getClientes(), getPedidos()]);
      const encontrado = clientes.find((c) => c.objectId === id || c.id === id);

      if (!encontrado) return;

      setCliente(encontrado);
      setPedidos((pedidosData || []).filter((pedido) => pedido.clienteId === id));
      setNome(encontrado.nome || "");
      setIdade(encontrado.idade || "");
      setAniversario(encontrado.aniversario || "");
      setEndereco(encontrado.endereco || "");
    } catch (error) {
      console.error(error);
    }
  }

  const receita = useMemo(() => {
    return pedidos.reduce((sum, pedido) => sum + Number(pedido.total || pedido.valorTotal || 0), 0);
  }, [pedidos]);

  async function salvarAlteracoes() {
    try {
      await updateCliente(id, {
        nome,
        idade: Number(idade || 0),
        aniversario,
        endereco,
      });

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
                onChange={(e) => setNome(e.target.value)}
              />
            ) : (
              <h1>{nome}</h1>
            )}
            <hr />
            <p>{endereco || "Endereço não cadastrado."}</p>
          </div>
        </div>

        <div className={styles.metrics}>
          <div>
            <span>Receita gerada</span>
            <strong>R$ {receita.toFixed(2)}</strong>
          </div>

          <div>
            <span>Total de pedidos</span>
            <strong>{pedidos.length}</strong>
          </div>

          <div>
            <span>Idade</span>
            {editando ? (
              <input
                type="number"
                className={styles.input}
                value={idade}
                onChange={(e) => setIdade(e.target.value)}
              />
            ) : (
              <strong>{idade || "-"}</strong>
            )}
          </div>
        </div>

        <div className={styles.bottomRow}>
          <div className={styles.sectionWrapper}>
            <div className={styles.sectionTitle}>Informações</div>
            <div className={styles.section}>
              <div className={styles.table2}>
                <div className={styles.row2}>
                  <span>Aniversário</span>
                  {editando ? (
                    <input
                      className={styles.input}
                      value={aniversario}
                      onChange={(e) => setAniversario(e.target.value)}
                    />
                  ) : (
                    <span>{aniversario || "-"}</span>
                  )}
                </div>

                <div className={styles.row2}>
                  <span>Endereço</span>
                  {editando ? (
                    <input
                      className={styles.input}
                      value={endereco}
                      onChange={(e) => setEndereco(e.target.value)}
                    />
                  ) : (
                    <span>{endereco || "-"}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.sectionWrapperFull}>
          <div className={styles.sectionTitle}>Últimos pedidos</div>
          <div className={styles.ordersTable}>
            <div className={styles.orderHeader}>
              <span>Pedido</span>
              <span>Data</span>
              <span>Total</span>
            </div>

            {pedidos.length === 0 ? (
              <div className={styles.empty}>Nenhum pedido registrado para este cliente.</div>
            ) : pedidos.map((pedido) => (
              <div key={pedido.objectId || pedido.id} className={styles.orderRow}>
                <span>{(pedido.items || []).map((item) => item.nome).filter(Boolean).join(", ") || "Pedido"}</span>
                <span>{pedido.createdAt ? new Date(pedido.createdAt).toLocaleDateString("pt-BR") : "-"}</span>
                <strong>R$ {Number(pedido.total || 0).toFixed(2)}</strong>
              </div>
            ))}
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

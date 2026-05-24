"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

import {
  createProduto,
  getProdutos,
  deletarProduto 
} from "@/services/back4app";
import { calculateIngredientCost, calculateProductCost, getStoredIngredients } from "../utils/ingredients";
import { getPackagingId, getStoredPackaging, saveStoredPackaging } from "../utils/packaging";
import { useToast } from "../components/ToastProvider";

export default function ProdutosEmbalagens() {
  const toast = useToast();

  const router = useRouter();

  const [view, setView] = useState("produtos");

  const [showModal, setShowModal] = useState(false);

  const [produtos, setProdutos] = useState([]);
  const [ingredientesBase] = useState(() => getStoredIngredients());
  const [embalagens, setEmbalagens] = useState(() => getStoredPackaging());
  const [embalagensSelecionadas, setEmbalagensSelecionadas] = useState([]);

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
    setCusto(calculateProductCost(novos, ingredientesBase).toFixed(2));
  }

  function toggleEmbalagem(embalagem) {
    const id = getPackagingId(embalagem);
    setEmbalagensSelecionadas((atuais) => (
      atuais.some((item) => getPackagingId(item) === id)
        ? atuais.filter((item) => getPackagingId(item) !== id)
        : [...atuais, embalagem]
    ));
  }

  async function salvarProduto() {
    if (!nome || !descricao) {
      toast.error("Preencha nome e descrição.", "Validação");
      return;
    }

    const ingredientesCalculados = ingredientes
      .filter((ingrediente) => ingrediente.nome && Number(ingrediente.quantidade || 0) > 0)
      .map((ingrediente) => {
        const calculo = calculateIngredientCost(ingrediente, ingredientesBase);
        return {
          ...ingrediente,
          quantidade: Number(ingrediente.quantidade || 0),
          valorKg: calculo.valorKg,
          custo: calculo.custo,
        };
      });

    const custoCalculado = calculateProductCost(ingredientesCalculados, ingredientesBase);

    const novoProduto = {
      nome,
      descricao,
      custoProducao: custoCalculado,
      precoVenda: Number(preco),
      ingredientes: ingredientesCalculados,
      embalagens: embalagensSelecionadas,
    };

    try {
      await createProduto(novoProduto);
      toast.success("Produto salvo com sucesso!");

      setNome("");
      setDescricao("");
      setCusto("");
      setPreco("");
      setIngredientes([{ nome: "", quantidade: "" }]);
      setEmbalagensSelecionadas([]);
      setShowModal(false);

      carregarProdutos();
    } catch (error) {
      console.error(error);
      toast.error("Erro ao salvar produto");
    }
  }

  function salvarEmbalagem() {
    if (!nome) {
      toast.error("Preencha o nome da embalagem.", "Validação");
      return;
    }

    const novaEmbalagem = {
        id: String(Date.now()),
        nome,
        descricao,
        custoProducao: Number(custo || 0),
        precoVenda: Number(preco || 0),
      };
      
    const atualizadas = [novaEmbalagem, ...embalagens];
    setEmbalagens(atualizadas);
    saveStoredPackaging(atualizadas);
    toast.success("Embalagem salva com sucesso!");

    setNome("");
    setDescricao("");
    setCusto("");
    setPreco("");
    setShowModal(false);
  }

  async function removerItem(item) {
    if (view === "produtos") {
      try {
        await deletarProduto(item.objectId);
        toast.success("Produto excluído com sucesso!");
        carregarProdutos();
      } catch (error) {
        console.error(error);
        toast.error("Erro ao excluir o produto.");
      }
    } else {
      const idEmbalagem = item.id || item.objectId;
      const novasEmbalagens = embalagens.filter(e => (e.id || e.objectId) !== idEmbalagem);
      setEmbalagens(novasEmbalagens);
      saveStoredPackaging(novasEmbalagens);
      toast.success("Embalagem excluída com sucesso!");
    }
  }

  const items = view === "produtos" ? produtos : embalagens;

  return (
    <main className={styles.mainContainer}>
      <div className={styles.pageHeader}>
        <div>
          <h2>Produtos e Embalagens</h2>
          <p>Organize produtos vendidos e materiais usados na entrega.</p>
        </div>
      </div>

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
        <button className={styles.addButton} onClick={() => setShowModal(true)}>
          + Adicionar
        </button>
      </div>

      <div className={styles.grid}>
        {items.map((item) => (
          <div
            key={item.objectId || item.id}
            className={styles.card}
            onClick={() => {
              if (view === "produtos") router.push(`/produtos/${item.objectId}`);
            }}
            style={{ cursor: view === "produtos" ? "pointer" : "default" }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3>{item.nome}</h3>
                <p>{item.descricao || (view === "produtos" ? "Produto cadastrado" : "Embalagem cadastrada")}</p>
              </div>
              
              <button
                onClick={(e) => {
                  e.stopPropagation(); 
                  removerItem(item);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#ff4d4d',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  padding: '5px'
                }}
              >
                Excluir
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <h3>{view === "produtos" ? "Novo Produto" : "Nova Embalagem"}</h3>

            <input placeholder="Nome" value={nome} onChange={(e) => setNome(e.target.value)} />

            <textarea
              placeholder="Descrição"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
            />

            <div className={styles.rowInputs}>
              <div className={styles.inputGroup}>
                <span>R$</span>
                <input
                  placeholder="Custo calculado"
                  type="number"
                  value={custo}
                  readOnly={view === "produtos"}
                  onChange={(e) => setCusto(e.target.value)}
                />
              </div>

              <div className={styles.inputGroup}>
                <span>R$</span>
                <input
                  placeholder="Preço de Venda"
                  type="number"
                  value={preco}
                  onChange={(e) => setPreco(e.target.value)}
                />
              </div>
            </div>

            {view === "produtos" && <input type="file" />}

            {view === "produtos" && <div className={styles.ingredientes}>
              <span>Ingredientes</span>
              {ingredientes.map((ing, index) => (
                <div key={index} className={styles.ingredienteRow}>
                  <input
                    list="ingredientes-cadastrados"
                    className={styles.ingredienteNome}
                    value={ing.nome}
                    onChange={(e) => updateIngrediente(index, "nome", e.target.value)}
                    placeholder="Nome do ingrediente"
                  />
                  <datalist id="ingredientes-cadastrados">
                    {ingredientesBase.map((item) => (
                      <option key={item.id || item.nome} value={item.nome} />
                    ))}
                  </datalist>

                  <div className={styles.inputGroupSmall}>
                    <input
                      type="number"
                      value={ing.quantidade}
                      onChange={(e) => updateIngrediente(index, "quantidade", e.target.value)}
                      placeholder="Qtd"
                    />
                    <span>g</span>
                  </div>
                </div>
              ))}

              <button type="button" onClick={addIngrediente} className={styles.addIngrediente}>
                + Adicionar ingrediente
              </button>
            </div>}

            {view === "produtos" && (
              <div className={styles.embalagensPicker}>
                <span>Embalagens disponíveis</span>
                <div className={styles.optionGrid}>
                  {embalagens.map((embalagem) => {
                    const id = getPackagingId(embalagem);
                    const checked = embalagensSelecionadas.some((item) => getPackagingId(item) === id);

                    return (
                      <label key={id} className={checked ? styles.optionActive : styles.option}>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleEmbalagem(embalagem)}
                        />
                        <span>{embalagem.nome}</span>
                        <small>R$ {Number(embalagem.custoProducao || 0).toFixed(2)}</small>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            <div className={styles.modalActions}>
              <button onClick={() => setShowModal(false)}>Cancelar</button>
              <button
                className={styles.saveButton}
                onClick={view === "produtos" ? salvarProduto : salvarEmbalagem}
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

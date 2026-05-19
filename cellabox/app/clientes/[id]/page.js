'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css';

import { getClientes, updateCliente } from '@/services/back4app';

export default function ClienteDetalhe() {
  const params = useParams();
  const idCliente = params.id;

  const [cliente, setCliente] = useState(null);
  const [emEdicao, setEmEdicao] = useState(false);
  const [carregando, setCarregando] = useState(true);

  const [nome, setNome] = useState('');
  const [lucroBruto, setLucroBruto] = useState('');
  const [endereco, setEndereco] = useState('');
  const [aniversario, setAniversario] = useState('');
  const [historicoCliente, setHistoricoCliente] = useState('');
  const [produtoMaisPedido, setProdutoMaisPedido] = useState('');

  useEffect(() => {
    if (idCliente) {
      carregarDadosDoCliente();
    }
  }, [idCliente]);

  async function carregarDadosDoCliente() {
    setCarregando(true);
    try {
      const lista = await getClientes();
      const encontrado = lista.find((c) => (c.objectId || c.id) === idCliente);

      if (encontrado) {
        setCliente(encontrado);
        setNome(encontrado.nome || '');
        setLucroBruto(encontrado.lucroBruto || '');
        setEndereco(encontrado.endereco || '');
        setAniversario(encontrado.aniversario || '');
        setHistoricoCliente(encontrado.historicoCliente || '');
        setProdutoMaisPedido(encontrado.produtoMaisPedido || '');
      }
    } catch (erro) {
      console.error("Erro ao buscar detalhes do cliente:", erro);
    } finally {
      setCarregando(false);
    }
  }

  async function salvarAlteracoes(e) {
    e.preventDefault();
    try {
      const dadosAtualizados = {
        nome,
        lucroBruto,
        endereco,
        aniversario,
        historicoCliente,
        produtoMaisPedido
      };

      await updateCliente(idCliente, dadosAtualizados);
      alert("Alterações salvas com sucesso!");
      setEmEdicao(false);
      carregarDadosDoCliente(); 
    } catch (erro) {
      console.error("Erro ao salvar alterações do cliente:", erro);
      alert("Ocorreu um erro ao tentar salvar as modificações.");
    }
  }

  if (carregando) {
    return (
      <main className={styles.mainContainer}>
        <div className={styles.detailCard}>
          <h2>Carregando informações do cliente...</h2>
        </div>
      </main>
    );
  }

  if (!cliente) {
    return (
      <main className={styles.mainContainer}>
        <div className={styles.backButton}>
          <Link href="/clientes">← Voltar</Link>
        </div>
        <div className={styles.detailCard}>
          <h2>Cliente não encontrado no sistema.</h2>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.mainContainer}>
      <div className={styles.backButton}>
        <Link href="/clientes">← Voltar</Link>
      </div>

      <div className={styles.detailCard}>
        <div className={styles.cardHeader}>
          {emEdicao ? (
            <input 
              type="text" 
              value={nome} 
              onChange={(e) => setNome(e.target.value)}
              style={{ fontSize: '24px', fontWeight: 'bold', width: '70%', padding: '5px' }}
            />
          ) : (
            <h2>{nome}</h2>
          )}
          
          <button 
            className={styles.editButton} 
            onClick={() => setEmEdicao(!emEdicao)}
            style={{ cursor: 'pointer' }}
          >
            {emEdicao ? ' Cancelar' : ' Editar'}
          </button>
        </div>

        <form onSubmit={salvarAlteracoes}>
          <div className={styles.detailRow}>
            <div className={styles.labelColumn}>Lucro gerado:</div>
            <div className={styles.valueColumn}>
              {emEdicao ? (
                <input 
                  type="text" 
                  value={lucroBruto} 
                  onChange={(e) => setLucroBruto(e.target.value)} 
                />
              ) : (
                <span className={styles.lucroValue}>{lucroBruto || 'R$ 0,00'}</span>
              )}
            </div>
          </div>

          <div className={styles.detailRow}>
            <div className={styles.labelColumn}>Endereço:</div>
            <div className={styles.valueColumn}>
              {emEdicao ? (
                <input 
                  type="text" 
                  value={endereco} 
                  onChange={(e) => setEndereco(e.target.value)} 
                />
              ) : (
                endereco || 'Não informado'
              )}
            </div>
          </div>

          <div className={styles.detailRow}>
            <div className={styles.labelColumn}>Aniversário:</div>
            <div className={styles.valueColumn}>
              {emEdicao ? (
                <input 
                  type="text" 
                  value={aniversario} 
                  onChange={(e) => setAniversario(e.target.value)} 
                />
              ) : (
                aniversario || 'Não informado'
              )}
            </div>
          </div>

          <div className={styles.detailRow}>
            <div className={styles.labelColumn}>Histórico do cliente:</div>
            <div className={styles.valueColumn}>
              {emEdicao ? (
                <input 
                  type="text" 
                  value={historicoCliente} 
                  onChange={(e) => setHistoricoCliente(e.target.value)} 
                />
              ) : (
                historicoCliente || 'Nenhum histórico registrado'
              )}
            </div>
          </div>

          <div className={styles.detailRow}>
            <div className={styles.labelColumn}>Produto mais pedido:</div>
            <div className={styles.valueColumn}>
              {emEdicao ? (
                <input 
                  type="text" 
                  value={produtoMaisPedido} 
                  onChange={(e) => setProdutoMaisPedido(e.target.value)} 
                />
              ) : (
                produtoMaisPedido || 'Nenhum pedido realizado'
              )}
            </div>
          </div>

          {emEdicao && (
            <div className={styles.formButtons} style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className={styles.submitBtn}>
                Salvar Alterações
              </button>
            </div>
          )}
        </form>
      </div>
    </main>
  );
}
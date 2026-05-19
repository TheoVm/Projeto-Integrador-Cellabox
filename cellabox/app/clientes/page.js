import styles from './page.module.css';
import ClientesListClient from './ClientesListClient';

export default function Clientes() {
  const clientes = [
    { id: 1, nome: 'Felipe De Azevedo Augusto', lucroBruto: 'R$322,44', endereco: 'Avenida JJ Apolinário, 123', aniversario: '17/03/2004', historicoCliente: 'Último pedido: Quattro Sapori', produtoMaisPedido: 'Quattro Sapori' },
    { id: 2, nome: 'Paula Cristiane de Souza', lucroBruto: 'R$134,07', endereco: 'Rua das Flores, 456', aniversario: '22/05/1995', historicoCliente: 'Última compra há 2 semanas', produtoMaisPedido: 'Pesto Classico' },
    { id: 3, nome: 'Regina Nobrega da Silva', lucroBruto: 'R$240,67', endereco: 'Avenida Principal, 789', aniversario: '10/11/1988', historicoCliente: 'Cliente há 3 anos', produtoMaisPedido: 'Tomate Seco' },
  ];

  return (
    <ClientesListClient clientes={clientes} />
  );
}
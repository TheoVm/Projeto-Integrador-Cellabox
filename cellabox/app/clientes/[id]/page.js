import ClienteDetalheClient from '../ClienteDetalheClient';

const clientes = {
  '1': {
    id: 1,
    nome: 'Felipe De Azevedo Augusto',
    lucroBruto: 'R$ 245,02',
    endereco: 'Avenida JJ Apolinário, 123',
    aniversario: '17/03/2004',
    historicoCliente: 'Último pedido: Quattro Sapori',
    produtoMaisPedido: 'Quattro Sapori',
  },
  '2': {
    id: 2,
    nome: 'Paula Cristiane de Souza',
    lucroBruto: 'R$134,07',
    endereco: 'Rua das Flores, 456',
    aniversario: '22/05/1995',
    historicoCliente: 'Última compra há 2 semanas',
    produtoMaisPedido: 'Pesto Classico',
  },
  '3': {
    id: 3,
    nome: 'Regina Nobrega da Silva',
    lucroBruto: 'R$240,67',
    endereco: 'Avenida Principal, 789',
    aniversario: '10/11/1988',
    historicoCliente: 'Cliente há 3 anos',
    produtoMaisPedido: 'Tomate Seco',
  },
};

export default function ClienteDetalhe({ params }) {
  const cliente = clientes[params.id] || clientes['1'];

  return <ClienteDetalheClient cliente={cliente} />;
}
import ClienteDetalheClient from '../ClienteDetalheClient';

export default async function ClienteDetalhe({ params }) {
  const { id } = await params;
  return <ClienteDetalheClient clienteId={id} />;
}

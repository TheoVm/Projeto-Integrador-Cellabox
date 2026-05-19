export const DEFAULT_PACKAGING = [
  {
    id: 'emb-1',
    nome: 'Caixa pequena',
    descricao: 'Embalagem individual',
    custoProducao: 0,
    precoVenda: 0,
  },
  {
    id: 'emb-2',
    nome: 'Caixa presente',
    descricao: 'Embalagem para kits',
    custoProducao: 0,
    precoVenda: 0,
  },
];

const STORAGE_KEY = 'cellabox_embalagens';

export function getStoredPackaging() {
  if (typeof window === 'undefined') return DEFAULT_PACKAGING;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : DEFAULT_PACKAGING;
  } catch (error) {
    console.error('Erro ao ler embalagens locais:', error);
    return DEFAULT_PACKAGING;
  }
}

export function saveStoredPackaging(items) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function getPackagingId(packaging) {
  return packaging?.objectId || packaging?.id || packaging?.nome || '';
}

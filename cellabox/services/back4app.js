const APP_ID = 'wlSs5vD2gYW8oB9aDhQnMKn7Kk7EAha0dKuenyCR';
const REST_API_KEY = 'aCKmWhaRelefAmU4tp8pZp7FltPTyz3yzW8TGBzM';

const PRODUTOS_URL = 'https://parseapi.back4app.com/classes/Produtos';
const CLIENTES_URL = 'https://parseapi.back4app.com/classes/Clientes';
const PEDIDOS_URL = 'https://parseapi.back4app.com/classes/Pedidos';
const GASTOS_URL = 'https://parseapi.back4app.com/classes/Gastos';
const INGREDIENTES_URL = 'https://parseapi.back4app.com/classes/Ingredientes'; 

const headers = {
  'X-Parse-Application-Id': APP_ID,
  'X-Parse-REST-API-Key': REST_API_KEY,
  'Content-Type': 'application/json',
};

// ==================== PRODUTOS ====================
export const createProduto = async (data) => {
  try {
    const response = await fetch(PRODUTOS_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(`Erro ao salvar: ${await response.text()}`);
    return await response.json();
  } catch (error) { throw error; }
};

export const getProdutos = async () => {
  try {
    const response = await fetch(`${PRODUTOS_URL}?order=-createdAt`, { method: 'GET', headers });
    if (!response.ok) throw new Error('Erro ao buscar produtos');
    const json = await response.json();
    return json.results || [];
  } catch (error) { return []; }
};

export const getProduto = async (id) => {
  try {
    const response = await fetch(`${PRODUTOS_URL}/${id}`, { method: 'GET', headers });
    if (!response.ok) throw new Error('Erro ao buscar produto');
    return await response.json();
  } catch (error) { return null; }
};

export const updateProduto = async (id, data) => {
  try {
    const response = await fetch(`${PRODUTOS_URL}/${id}`, {
      method: 'PUT', headers, body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(await response.text());
    return await response.json();
  } catch (error) { throw error; }
};

export const deletarProduto = async (id) => {
  try {
    const response = await fetch(`${PRODUTOS_URL}/${id}`, { method: 'DELETE', headers });
    if (!response.ok) throw new Error(await response.text());
    return await response.json();
  } catch (error) { throw error; }
};

// ==================== CLIENTES ====================
export const createCliente = async (data) => {
  try {
    const response = await fetch(CLIENTES_URL, { method: 'POST', headers, body: JSON.stringify(data) });
    const result = await response.json();
    if (!response.ok) throw new Error(JSON.stringify(result));
    return result;
  } catch (error) { throw error; }
};

export const getClientes = async () => {
  try {
    const response = await fetch(`${CLIENTES_URL}?order=-createdAt`, { method: 'GET', headers });
    const json = await response.json();
    return json.results || [];
  } catch (error) { return []; }
};

export const updateCliente = async (id, data) => {
  try {
    const response = await fetch(`${CLIENTES_URL}/${id}`, { method: 'PUT', headers, body: JSON.stringify(data) });
    if (!response.ok) throw new Error(await response.text());
    return await response.json();
  } catch (error) { throw error; }
};

export const deleteCliente = async (id) => {
  try {
    const response = await fetch(`${CLIENTES_URL}/${id}`, { method: 'DELETE', headers });
    if (!response.ok) throw new Error(`Erro ao deletar: ${await response.text()}`);
    return await response.json();
  } catch (error) { throw error; }
};

// ==================== PEDIDOS ====================
export const createPedido = async (data) => {
  try {
    const response = await fetch(PEDIDOS_URL, { method: 'POST', headers, body: JSON.stringify(data) });
    if (!response.ok) throw new Error(`Erro ao salvar pedido: ${await response.text()}`);
    return await response.json();
  } catch (error) { throw error; }
};

export const getPedidos = async () => {
  try {
    const response = await fetch(`${PEDIDOS_URL}?order=-createdAt`, { method: 'GET', headers });
    const json = await response.json();
    return json.results || [];
  } catch (error) { return []; }
};

// ==================== GASTOS ====================
export const createGasto = async (data) => {
  try {
    const response = await fetch(GASTOS_URL, { method: 'POST', headers, body: JSON.stringify(data) });
    if (!response.ok) throw new Error(`Erro ao salvar gasto: ${await response.text()}`);
    return await response.json();
  } catch (error) { throw error; }
};

export const getGastos = async () => {
  try {
    const response = await fetch(`${GASTOS_URL}?order=-createdAt`, { method: 'GET', headers });
    const json = await response.json();
    return json.results || [];
  } catch (error) { return []; }
};

// ==================== INGREDIENTES ====================
export const createIngrediente = async (data) => {
  try {
    const response = await fetch(INGREDIENTES_URL, { method: 'POST', headers, body: JSON.stringify(data) });
    if (!response.ok) throw new Error(await response.text());
    return await response.json();
  } catch (error) { throw error; }
};

export const getIngredientes = async () => {
  try {
    const response = await fetch(`${INGREDIENTES_URL}?order=-createdAt`, { method: 'GET', headers });
    const json = await response.json();
    return json.results || [];
  } catch (error) { return []; }
};

export const updateIngrediente = async (id, data) => {
  try {
    const response = await fetch(`${INGREDIENTES_URL}/${id}`, { method: 'PUT', headers, body: JSON.stringify(data) });
    if (!response.ok) throw new Error(await response.text());
    return await response.json();
  } catch (error) { throw error; }
};

export const deleteIngrediente = async (id) => {
  try {
    const response = await fetch(`${INGREDIENTES_URL}/${id}`, { method: 'DELETE', headers });
    if (!response.ok) throw new Error(await response.text());
    return await response.json();
  } catch (error) { throw error; }
};
const APP_ID = 'wlSs5vD2gYW8oB9aDhQnMKn7Kk7EAha0dKuenyCR';
const REST_API_KEY = 'aCKmWhaRelefAmU4tp8pZp7FltPTyz3yzW8TGBzM';

const PRODUTOS_URL = 'https://parseapi.back4app.com/classes/Produtos';
const CLIENTES_URL = 'https://parseapi.back4app.com/classes/Clientes';
const PEDIDOS_URL = 'https://parseapi.back4app.com/classes/Pedidos';
const GASTOS_URL = 'https://parseapi.back4app.com/classes/Gastos';

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

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erro ao salvar: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getProdutos = async () => {
  try {
    const response = await fetch(`${PRODUTOS_URL}?order=-createdAt`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error('Erro ao buscar produtos');
    }

    const json = await response.json();
    return json.results || [];
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const getProduto = async (id) => {
  try {
    const response = await fetch(`${PRODUTOS_URL}/${id}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error('Erro ao buscar produto');
    }

    return await response.json();
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const updateProduto = async (id, data) => {
  try {
    const response = await fetch(`${PRODUTOS_URL}/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText);
    }

    return await response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// ==================== CLIENTES ====================

export const createCliente = async (data) => {
  try {
    const response = await fetch(CLIENTES_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(JSON.stringify(result));
    }

    return result;
  } catch (error) {
    console.error('Erro createCliente:', error);
    throw error;
  }
};

export const getClientes = async () => {
  try {
    const response = await fetch(`${CLIENTES_URL}?order=-createdAt`, {
      method: 'GET',
      headers,
    });

    const json = await response.json();
    return json.results || [];
  } catch (error) {
    console.error('Erro getClientes:', error);
    return [];
  }
};

export const updateCliente = async (id, data) => {
  try {
    const response = await fetch(`${CLIENTES_URL}/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText);
    }

    return await response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const deleteCliente = async (id) => {
  try {
    const response = await fetch(`${CLIENTES_URL}/${id}`, {
      method: 'DELETE',
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erro ao deletar: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Erro deleteCliente:', error);
    throw error;
  }
};

// ==================== PEDIDOS ====================

export const createPedido = async (data) => {
  try {
    const response = await fetch(PEDIDOS_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erro ao salvar pedido: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getPedidos = async () => {
  try {
    const response = await fetch(`${PEDIDOS_URL}?order=-createdAt`, {
      method: 'GET',
      headers,
    });
    const json = await response.json();
    return json.results || [];
  } catch (error) {
    console.error('Erro getPedidos:', error);
    return [];
  }
};

// ==================== GASTOS ====================

export const createGasto = async (data) => {
  try {
    const response = await fetch(GASTOS_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erro ao salvar gasto: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getGastos = async () => {
  try {
    const response = await fetch(`${GASTOS_URL}?order=-createdAt`, {
      method: 'GET',
      headers,
    });
    const json = await response.json();
    return json.results || [];
  } catch (error) {
    console.error('Erro getGastos:', error);
    return [];
  }
};

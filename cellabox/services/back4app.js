const APP_ID = 'wlSs5vD2gYW8oB9aDhQnMKn7Kk7EAha0dKuenyCR';

const REST_API_KEY = 'aCKmWhaRelefAmU4tp8pZp7FltPTyz3yzW8TGBzM';

const PRODUTOS_URL =
  'https://parseapi.back4app.com/classes/Produtos';

const CLIENTES_URL =
  'https://parseapi.back4app.com/classes/Clientes';

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

    const response = await fetch(
      `${PRODUTOS_URL}?order=-createdAt`,
      {
        method: 'GET',
        headers,
      }
    );

    if (!response.ok) {
      throw new Error('Erro ao buscar produtos');
    }

    const json = await response.json();

    return json.results;

  } catch (error) {

    console.error(error);

    return [];
  }
};



// ==================== CLIENTES ====================

export const createCliente = async (data) => {

  try {

    console.log("Enviando cliente:", data);

    const response = await fetch(CLIENTES_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });

    const result = await response.json();

    console.log("Resposta Back4App:", result);

    if (!response.ok) {

      throw new Error(JSON.stringify(result));
    }

    return result;

  } catch (error) {

    console.error("Erro createCliente:", error);

    throw error;
  }
};

export const getClientes = async () => {

  try {

    const response = await fetch(
      `${CLIENTES_URL}?order=-createdAt`,
      {
        method: 'GET',
        headers,
      }
    );

    const json = await response.json();

    console.log("Clientes encontrados:", json);

    return json.results || [];

  } catch (error) {

    console.error("Erro getClientes:", error);

    return [];
  }
};




export const updateCliente = async (id, data) => {

  try {

    const response = await fetch(
      `${CLIENTES_URL}/${id}`,
      {
        method: 'PUT',
        headers,
        body: JSON.stringify(data),
      }
    );

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
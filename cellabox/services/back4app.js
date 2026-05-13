const APP_ID = 'wlSs5vD2gYW8oB9aDhQnMKn7Kk7EAha0dKuenyCR';
const REST_API_KEY = 'aCKmWhaRelefAmU4tp8pZp7FltPTyz3yzW8TGBzM';

const PRODUTOS_URL = 'https://parseapi.back4app.com/classes/Produtos';

const headers = {
  'X-Parse-Application-Id': APP_ID,
  'X-Parse-REST-API-Key': REST_API_KEY,
  'Content-Type': 'application/json',
};

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
const API_ENDPOINT = "https://api.thecatapi.com/v1";

const request = async (url) => {
  try {
    const res = await fetch(url);
    const data = res.json();
    return data;
  } catch (e) {
    throw {
      message: e.message,
      status: e.status,
    };
  }
};

const api = {
  getCats: async () => {
    try {
      const breeds = await request(`${API_ENDPOINT}/breeds/search?q=cat`);
      const requests = breeds.map(async (breed) => {
        return await request(
          `${API_ENDPOINT}/images/search?limit=20&breed_ids=${breed.id}`
        );
      });
      const responses = await Promise.all(requests);
      const result = responses.reduce((acc, val) => {
        return acc.concat(val);
      }, []);
      return {
        isError: false,
        data: result,
      };
    } catch (e) {
      return {
        isError: true,
        data: e,
      };
    }
  },
};

export default api;

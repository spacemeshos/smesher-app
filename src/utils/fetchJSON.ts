function fetchJSON(url: string, options?: RequestInit) {
  return fetch(url, options).then((r) => {
    if (r.ok) {
      return r.json();
    }
    throw new Error(`Cannot fetch JSON data from ${url}. Got ${r.status}`);
  });
}

export default fetchJSON;

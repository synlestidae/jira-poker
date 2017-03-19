function request(method, url, body) {
  return fetch(url, {
      method: method, 
      headers: {
        'Content-Type': 'application/json', 
        'Accept': 'application/json', 
      }, 
      body: JSON.stringify(body)
  }).then(resp => resp.json());
}

module.exports.request = request;

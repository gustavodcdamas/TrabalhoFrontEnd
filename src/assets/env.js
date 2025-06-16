(function (window) {
  window.env = window.env || {};

  // Configurações que podem ser alteradas em runtime
  window.env.apiUrl = '/api'; // Proxy através do nginx
  window.env.production = true;
})(this);
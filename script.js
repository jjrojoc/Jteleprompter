body, html {
    height: 100%;
    margin: 0;
    background-color: black;
    color: white;
  }
  
  #teleprompter {
    width: 100%;
    height: 90%;
    overflow: scroll;
    cursor: pointer;
    background-color: black;
    color: white;
    padding: 20px;
    box-sizing: border-box;
    font-size: 36px; /* Initial font size, adjustable via slider */
    font-family: Helvetica;
  }
  
  .control-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    background-color: rgba(0, 0, 0, 0.8); /* Fondo semitransparente */
    color: white;
    padding: 5px;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: space-around;
    z-index: 1000; /* Asegura que la barra esté siempre encima */
  }
  
  .controls-container {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    gap: 5px; /* Espacio reducido entre los elementos */
  }
  
  .menu-items {
    display: none; /* Oculto por defecto */
    flex-direction: column; /* Elementos en columna */
    background-color: #222;
    padding: 5px;
    position: absolute;
    bottom: 50px; /* Ajuste de posición según necesidades */
    left: 10px; /* Mantiene el menú cerca del botón de menú */
  }
  
  button, input[type="range"], select {
    padding: 10px; /* Aumento del padding para un área de toque mayor */
    min-width: 60px; /* Ancho mínimo para mayor accesibilidad */
    min-height: 44px; /* Altura mínima recomendada */
    border: none;
    background-color: #333;
    color: white;
    border-radius: 5px;
    margin: 5px; /* Espacio entre botones */
    cursor: pointer;
    font-size: 16px; /* Tamaño de fuente legible */
  }
  
  input[type="color"] {
    padding: 0;
    border: none;
    width: 44px; /* Ajuste para tamaño táctil */
    height: 44px;
    cursor: pointer;
  }
  
  /* Efecto de hover cambiado por un efecto de focus más adecuado para táctil */
  button:focus, input[type="range"]:focus, select:focus {
    background-color: #555;
    outline: none; /* Elimina el contorno por defecto de los navegadores */
  }
  
  /* Responsividad ajustada */
  @media (max-width: 768px) {
    .controls-container {
        flex-wrap: nowrap; /* Evita que los controles se apilen */
    }
  }
  
  
  
  #textColorControl option {
    color: black; /* Asegura que el texto sea visible en colores claros */
    background-color: #FFFFFF;
  }
  
  #textColorControl option[value="lightyellow"] { background-color: lightyellow; }
  #textColorControl option[value="lightgreen"] { background-color: lightgreen; }
  #textColorControl option[value="lightblue"] { background-color: lightblue; }
  #textColorControl option[value="lightgray"] { background-color: lightgray; }
  
  
  #controls button {
    background: none;
    border: none;
    color: white;
    font-size: 24px; /* Ajusta según sea necesario */
    padding: 10px;
    cursor: pointer;
  }
  
  #controls button:hover {
    background-color: rgba(255, 255, 255, 0.2);
  }
  
  #controls .menu-items {
    display: none; /* asegura que el menú esté oculto inicialmente */
  }
  
  #controls .menu-container:hover .menu-items {
    display: block; /* muestra el menú cuando se pasa el mouse sobre el contenedor */
  }
  
  
  #controls button {
    background: none;
    border: none;
    color: white;
    font-size: 24px;  /* Asegúrate de que el ícono es suficientemente grande para ser tocado fácilmente */
    padding: 10px;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
  
  #controls button:hover {
    background-color: rgba(255, 255, 255, 0.2);
  }
  
  button#toggleScroll {
    background-color: #007BFF; /* Bootstrap blue */
  }
  
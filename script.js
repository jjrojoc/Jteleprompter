// if ('serviceWorker' in navigator) {
//     window.addEventListener('load', function() {
//       navigator.serviceWorker.register('./service-worker.js')
//         .then(function(registration) {
//           console.log('ServiceWorker registration successful with scope: ', registration.scope);
//         }, function(err) {
//           console.log('ServiceWorker registration failed: ', err);
//         });
//     });
//   }

function invokeServiceWorkerUpdateFlow(registration) {
    // TODO implement your own UI notification element
    if (confirm("New version of the app is available. Refresh now?")) {
        if (registration.waiting) {
            // let waiting Service Worker know it should became active
            registration.waiting.postMessage('SKIP_WAITING')
        }
    }
};

// check if the browser supports serviceWorker at all
if ('serviceWorker' in navigator) {
    // wait for the page to load
    window.addEventListener('load', async () => {
        // register the service worker from the file specified
        const registration = await navigator.serviceWorker.register('./service-worker.js')

        // ensure the case when the updatefound event was missed is also handled
        // by re-invoking the prompt when there's a waiting Service Worker
        if (registration.waiting) {
            invokeServiceWorkerUpdateFlow(registration)
        }

        // detect Service Worker update available and wait for it to become installed
        registration.addEventListener('updatefound', () => {
            if (registration.installing) {
                // wait until the new Service worker is actually installed (ready to take over)
                registration.installing.addEventListener('statechange', () => {
                    if (registration.waiting) {
                        // if there's an existing controller (previous Service Worker), show the prompt
                        if (navigator.serviceWorker.controller) {
                            invokeServiceWorkerUpdateFlow(registration)
                        } else {
                            // otherwise it's the first install, nothing to do
                            console.log('Service Worker initialized for the first time')
                        }
                    }
                })
            }
        })

        let refreshing = false;

        // detect controller change and refresh the page
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            if (!refreshing) {
                window.location.reload()
                refreshing = true
            }
        })
    })
};

let isAutoScrolling = false;
let scrollInterval;
let lastScrollTop = 0;

const teleprompter = document.getElementById('teleprompter');
const speedControl = document.getElementById('speedControl');
// Existing variables and toggleAutoScroll function remain the same

const textSizeControl = document.getElementById('textSizeControl');
const textColorControl = document.getElementById('textColorControl');

document.getElementById('toggleScroll').addEventListener('click', toggleAutoScroll);

document.getElementById('loadText').style.display = 'none';

textSizeControl.addEventListener('input', () => {
    const newSize = textSizeControl.value + 'px';
    teleprompter.style.fontSize = newSize;
});

textColorControl.addEventListener('change', () => {
    // const newColor = document.getElementById('textColorPicker').value; // toma el color del colorpicker
    const newColor = textColorControl.value;
    teleprompter.style.color = newColor;
});

function toggleAutoScroll() {
    var button = this;
    var icon = button.querySelector('i');

    if (!isAutoScrolling) {
        icon.className = "fas fa-stop"; // Cambia el ícono a "stop"
        document.getElementById('toggleScroll').style.backgroundColor = "#ff0000";
        isAutoScrolling = true; // Actualiza el estado
        // Iniciar el autoscroll aquí
        const speed = 100 - speedControl.value;
        scrollInterval = setInterval(() => {
            teleprompter.scrollBy(0, 1);
        }, speed);
    } else {
        icon.className = "fas fa-play"; // Cambia el ícono a "play"
        // document.getElementById('toggleScroll').style.backgroundColor = "#007BFF";
        document.getElementById('toggleScroll').style.backgroundColor = "#555555";
        isAutoScrolling = false; // Actualiza el estado
        // Detener el autoscroll aquí
        clearInterval(scrollInterval);
    }
}


speedControl.addEventListener('input', () => {
    if (isAutoScrolling) {
        clearInterval(scrollInterval);
        const speed = 100 - speedControl.value;
        scrollInterval = setInterval(() => {
            teleprompter.scrollBy(0, 1);
        }, speed);
    }
    
});

document.getElementById('saveText').addEventListener('click', function() {
    const scriptText = document.getElementById('teleprompter').innerHTML;
    localStorage.setItem('savedScript', scriptText);
    alert('Texto guardado!');
});

document.getElementById('loadText').addEventListener('click', function() {
    const savedText = localStorage.getItem('savedScript');
    if (savedText) {
        document.getElementById('teleprompter').innerHTML = savedText;
        alert('Text loaded!');
    } else {
        alert('No saved text found.');
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const savedText = localStorage.getItem('savedScript');
    if (savedText) {
        document.getElementById('teleprompter').innerHTML = savedText;
    }
});

document.getElementById('changeTextColor').addEventListener('click', function() {
    const color = document.getElementById('textColorPicker').value;
    const selection = window.getSelection();

    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    const span = document.createElement('span');
    span.style.color = color;
    span.appendChild(range.extractContents());
    range.insertNode(span);
    selection.removeAllRanges();
    selection.addRange(range);
});


// document.getElementById('editToggle').addEventListener('click', function() {
//     const teleprompter = document.getElementById('teleprompter');
//     const isEditable = teleprompter.contentEditable === "true";
//     teleprompter.contentEditable = !isEditable;  // Toggle the state
//     this.textContent = isEditable ? 'Editar' : 'Parar Editar'; // Update button text
//     if (isEditable){
//         const scriptText = document.getElementById('teleprompter').innerHTML;
//         localStorage.setItem('savedScript', scriptText);
//         alert('Text edited saved!');
//     }
// });

// document.getElementById('editToggle').addEventListener('click', function() {
//     const teleprompter = document.getElementById('teleprompter');
//     const isEditable = teleprompter.contentEditable === "true";
//     teleprompter.contentEditable = !isEditable;  // Toggle the state
//     const icon = this.querySelector('i'); // Selecciona el icono dentro del botón
    
//     if (isEditable) {
//         icon.className = 'fas fa-edit'; // Cambia el icono a editar
//         const scriptText = document.getElementById('teleprompter').innerHTML;
//         localStorage.setItem('savedScript', scriptText);
//         alert('Text edited saved!');
//     } else {
//         icon.className = 'fas fa-stop-circle'; // Cambia el icono a parar editar
//     }
// });

// // document.getElementById('editToggle').addEventListener('click', function() {
// //     const teleprompter = document.getElementById('teleprompter');
// //     const isEditable = teleprompter.contentEditable === "true";
// //     teleprompter.contentEditable = !isEditable;  // Alternar el estado de edición
// //     const icon = this.querySelector('i'); // Selecciona el icono dentro del botón

// //     // Verifica si el contenido debe ser borrado
// //     if (!isEditable && teleprompter.innerText.includes("click en Start para iniciar teleprompt")) {
// //         teleprompter.innerHTML = '';  // Borra el texto
// //         icon.className = 'fas fa-stop-circle'; // Cambia el icono a parar editar
// //         window.setTimeout(function() {
// //             const range = document.createRange();
// //             const sel = window.getSelection();
// //             range.setStart(teleprompter, 0);
// //             range.collapse(true);
// //             sel.removeAllRanges();
// //             sel.addRange(range);
// //             teleprompter.focus();  // enfoca el elemento para que el cursor aparezca
// //         }, 1);
// //     }

// //     // this.textContent = isEditable ? 'Editar' : 'Parar Editar'; // Actualiza el texto del botón

// //     if (isEditable){
// //         icon.className = 'fas fa-edit'; // Cambia el icono a editar
// //         let textoVacio = teleprompter.innerText.trim();
// //         if (textoVacio === '') {
// //             teleprompter.innerHTML = '1º Click en Menú --> Editar \
// //                          <br>2º Copia y pega aquí el texto que desees, edítalo o escribe tu propio texto \
// //                          <br>3º Click en Menú --> Parar Editar \
// //                          <br>Listo, click en Start para iniciar teleprompt'; // Establece texto predeterminado si está vacío
// //         }
// //         const  scriptText = document.getElementById('teleprompter').innerHTML;
// //         localStorage.setItem('savedScript', scriptText);
// //         alert('Texto editado guardado!');
// //     }
// // });

document.getElementById('editToggle').addEventListener('click', function() {
    const teleprompter = document.getElementById('teleprompter');
    const isEditable = teleprompter.contentEditable === "true";
    const icon = this.querySelector('i'); // Selecciona el icono dentro del botón

    // Alternar el estado de edición
    teleprompter.contentEditable = !isEditable;

    // Verifica si el contenido debe ser borrado
    if (!isEditable && teleprompter.innerText.includes("click en Start para iniciar teleprompt")) {
        teleprompter.innerHTML = '';  // Borra el texto
        teleprompter.focus();  // enfoca el elemento para que el cursor aparezca
        window.setTimeout(function() {
            const range = document.createRange();
            const sel = window.getSelection();
            range.setStart(teleprompter, 0);
            range.collapse(true);
            sel.removeAllRanges();
            sel.addRange(range);
        }, 1);
    }

    if (!isEditable) {
        icon.className = 'fas fa-stop-circle'; // Cambia el icono a 'parar editar' cuando es editable
    } else {
        icon.className = 'fas fa-edit'; // Cambia el icono a 'editar' cuando deja de ser editable
        const scriptText = document.getElementById('teleprompter').innerHTML;
        if (scriptText.trim() === '') {
            teleprompter.innerHTML = '1º Click en Menú --> Editar \
                         <br>2º Copia y pega aquí el texto que desees, edítalo o escribe tu propio texto \
                         <br>3º Click en Menú --> Parar Editar \
                         <br>Listo, click en Start para iniciar teleprompt'; // Establece texto predeterminado si está vacío
        }
        localStorage.setItem('savedScript', scriptText);
        alert('Texto editado guardado!');
    }
});




document.getElementById('speedControl').addEventListener('input', function() {
    const speedValueSpan = document.getElementById('scrollSpeedValue');
    speedValueSpan.textContent = this.value;
});

document.getElementById('textSizeControl').addEventListener('input', function() {
    const sizeValueSpan = document.getElementById('textSizeValue');
    sizeValueSpan.textContent = this.value + 'px';
});

document.getElementById('menuButton').addEventListener('click', function() {
    var menuItems = document.getElementById("menuItems");
    if (menuItems.style.display === "none") {
        menuItems.style.display = "block";
    } else {
        menuItems.style.display = "none";
    }
});

// Opcional: Cerrar el menú si se hace clic fuera de él
window.onclick = function(event) {
    if (!event.target.matches('#menuButton')) {
        var dropdowns = document.getElementsByClassName("menu-items");
        for (var i = 0; i < dropdowns.length; i++) {
            var openDropdown = dropdowns[i];
            if (openDropdown.style.display === "block") {
                openDropdown.style.display = "none";
            }
        }
    }
}



document.getElementById('resetButton').addEventListener('click', function() {
    const teleprompter = document.getElementById('teleprompter');
    const editButton = document.getElementById('editToggle');
    const editIcon = editButton.querySelector('i'); // Asumiendo que el botón tiene un elemento <i> para el ícono

    if (confirm('¿Quieres resetear el contenido del teleprompter? \nEsta acción no se puede deshacer.')) {
        // Verifica y ajusta el estado editable si es necesario
        if (teleprompter.contentEditable === "true") {
            teleprompter.contentEditable = "false"; // Asegúrate de que el teleprompter no esté editable
            editIcon.className = 'fas fa-edit'; // Cambia el ícono a editar
        }

        // Restablece el contenido a un mensaje predeterminado
        let scriptText = '1º Click en Menú --> Editar \
                        <br>2º Copia y pega aquí el texto que desees, edítalo o escribe tu propio texto \
                        <br>3º Click en Menú --> Parar Editar \
                        <br>Listo, click en Start para iniciar teleprompt'; // Texto predeterminado

        teleprompter.innerHTML = scriptText; // Establece el nuevo contenido HTML
        localStorage.setItem('savedScript', scriptText); // Guarda en localStorage
        alert('Teleprompter contenido ha sido reseteado.'); // Muestra mensaje de confirmación
    }
});

// document.getElementById('teleprompter').addEventListener('paste', function(e) {
//     e.preventDefault();
//     var text = (e.originalEvent || e).clipboardData.getData('text/plain');

//     const formattedText = text.replace(/\n/g, '<br>');

//     // Inserta el texto manteniendo el foco y la posición del cursor
//     const selection = window.getSelection();
//     if (!selection.rangeCount) return false;
//     selection.deleteFromDocument();

//     // Inserta HTML directamente, respetando saltos de línea
//     const div = document.createElement('div');
//     div.innerHTML = formattedText;
//     const fragment = document.createDocumentFragment();
//     let child;
//     while ((child = div.firstChild)) {
//         fragment.appendChild(child);
//     }
//     selection.getRangeAt(0).insertNode(fragment);

//     // Mueve el cursor al final del texto insertado
//     selection.collapseToEnd();
// });

document.getElementById('teleprompter').addEventListener('paste', function(e) {
    e.preventDefault(); // Previene el comportamiento de pegado predeterminado.

    // Accede al contenido HTML pegado desde el portapapeles.
    var htmlContent = e.clipboardData.getData('text/html');

    // Si no hay contenido HTML, intenta obtener el texto plano.
    if (!htmlContent) {
        htmlContent = e.clipboardData.getData('text/plain');
        htmlContent = htmlContent.replace(/(?:\r\n|\r|\n)/g, '<br>'); // Reemplaza saltos de línea por <br>
    }

    // Crear un contenedor temporal para el contenido HTML.
    var tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent; // Inserta el texto como HTML.

    // Elimina todos los estilos excepto los de color de texto y normaliza saltos de línea.
    stripStylesExceptColor(tempDiv);
    normalizeLineBreaks(tempDiv);

    // Inserta el HTML filtrado en el contenido editable.
    document.execCommand('insertHTML', false, tempDiv.innerHTML);
});

// Función para eliminar todos los estilos excepto el color del texto.
function stripStylesExceptColor(element) {
    if (element.style) {
        const textColor = element.style.color;
        element.removeAttribute('style');
        if (textColor) element.style.color = textColor;
    }
    Array.from(element.children).forEach(stripStylesExceptColor);
}

// Función para normalizar los saltos de línea eliminando <div> y <p>, reemplazándolos por <br>
function normalizeLineBreaks(element) {
    var children = Array.from(element.childNodes);
    for (var child of children) {
        normalizeLineBreaks(child); // Primero normaliza recursivamente
    }

    if (element.nodeType === Node.ELEMENT_NODE && (element.tagName === 'DIV' || element.tagName === 'P')) {
        var replacementHtml = element.innerHTML + '<br>'; // Prepara el contenido con un <br>
        if (element.parentNode) {
            element.outerHTML = replacementHtml; // Solo reemplaza si tiene un nodo padre
        }
    }
}

function applySettings() {
  const fontSize = document.getElementById('fontSizeInput').value;
  const scrollSpeed = document.getElementById('scrollSpeedInput').value;

  // Aplicar configuración al teleprompter
  const teleprompter = document.getElementById('teleprompter');
  teleprompter.style.fontSize = fontSize + 'px';
  // Asume que tienes una función que ajusta la velocidad de desplazamiento
  setScrollSpeed(scrollSpeed);

  // Guardar configuración en localStorage
  localStorage.setItem('teleprompterFontSize', fontSize);
  localStorage.setItem('teleprompterScrollSpeed', scrollSpeed);
}

// Función para cargar configuraciones al iniciar la página
function loadSettings() {
  const storedFontSize = localStorage.getItem('teleprompterFontSize');
  const storedScrollSpeed = localStorage.getItem('teleprompterScrollSpeed');

  if (storedFontSize) {
    document.getElementById('fontSizeInput').value = storedFontSize;
    document.getElementById('teleprompter').style.fontSize = storedFontSize + 'px';
  }
  if (storedScrollSpeed) {
    document.getElementById('scrollSpeedInput').value = storedScrollSpeed;
    setScrollSpeed(storedScrollSpeed);
  }
}

document.addEventListener('DOMContentLoaded', loadSettings);

function setScrollSpeed(speed) {
  // Implementa esta función según cómo manejes el scroll en tu teleprompter
  console.log('Scroll speed set to', speed);
}

function applySettings() {
    const fontSize = document.getElementById('fontSizeSlider').value;
    const scrollSpeed = document.getElementById('scrollSpeedSlider').value;
  
    // Actualizar los controles del teleprompter
    updateTeleprompterControls(fontSize, scrollSpeed);
  
    // Guardar configuración en localStorage
    localStorage.setItem('teleprompterFontSize', fontSize);
    localStorage.setItem('teleprompterScrollSpeed', scrollSpeed);
  }
  
  function loadSettings() {
    const storedFontSize = localStorage.getItem('teleprompterFontSize') || '24';
    const storedScrollSpeed = localStorage.getItem('teleprompterScrollSpeed') || '50';
  
    document.getElementById('fontSizeSlider').value = storedFontSize;
    document.getElementById('scrollSpeedSlider').value = storedScrollSpeed;
  
    updateTeleprompterControls(storedFontSize, storedScrollSpeed);
  }
  
  function updateTeleprompterControls(fontSize, scrollSpeed) {
    document.getElementById('fontSizeValue').textContent = fontSize + 'px';
    document.getElementById('scrollSpeedValue').textContent = scrollSpeed;
  
    const teleprompter = document.getElementById('teleprompter');
    teleprompter.style.fontSize = fontSize + 'px';
    // Asume que 'setScrollSpeed' es una función existente para ajustar la velocidad del scroll
    setScrollSpeed(scrollSpeed);
  }
  
  document.addEventListener('DOMContentLoaded', loadSettings);
  
  function setScrollSpeed(speed) {
    // Aquí deberías ajustar la velocidad real de desplazamiento del teleprompter
    console.log('Scroll speed set to', speed);
  }
  
  // Event listeners para actualizar instantáneamente los valores mostrados al usuario
  document.getElementById('fontSizeSlider').addEventListener('input', function() {
    document.getElementById('fontSizeValue').textContent = this.value + 'px';
  });
  
  document.getElementById('scrollSpeedSlider').addEventListener('input', function() {
    document.getElementById('scrollSpeedValue').textContent = this.value;
  });
  
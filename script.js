///// REGISTRA PWA /////

function invokeServiceWorkerUpdateFlow(registration) {
    // TODO implement your own UI notification element
    if (confirm("Hay una nueva versión de la aplicación. Actualizar ahora?")) {
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





// Inicializar IndexedDB
var db;
const request = indexedDB.open('teleprompterDB', 1);

request.onerror = function(event) {
    console.error('Database error:', event.target.errorCode);
};

request.onsuccess = function(event) {
    db = event.target.result;
    loadScriptsList();
};

request.onupgradeneeded = function(event) {
    db = event.target.result;
    const objectStore = db.createObjectStore('scripts', { keyPath: 'id', autoIncrement: true });
    objectStore.createIndex('name', 'name', { unique: false });
    objectStore.createIndex('text', 'text', { unique: false });
};

// Función para obtener el store de scripts
function getScriptsStore(mode) {
    const transaction = db.transaction(['scripts'], mode);
    return transaction.objectStore('scripts');
}

// Función para guardar un script
function saveScript(id, name, text) {
    const store = getScriptsStore('readwrite');
    const script = { name: name, text: text };
    if (id) {
        script.id = id;
    }
    const request = store.put(script);

    request.onsuccess = function() {
        //alert('Script guardado con éxito');
        loadScriptsList();
        hideEditor();
    };

    request.onerror = function(event) {
        alert('Error al guardar el script: ' + event.target.errorCode);
    };
}

// Función para cargar un script
function loadScript(id) {
    const store = getScriptsStore('readonly');
    const request = store.get(id);

    request.onsuccess = function(event) {
        const result = event.target.result;
        if (result) {
            document.getElementById('teleprompter').innerHTML = result.text;
            document.getElementById('scriptName').value = result.name;
            document.getElementById('scriptId').value = result.id;
            showEditor();
        } else {
            alert('Script no encontrado');
        }
    };

    request.onerror = function(event) {
        alert('Error al cargar el script: ' + event.target.errorCode);
    };
}

// Función para eliminar un script
function deleteScript(id) {
    const store = getScriptsStore('readwrite');
    const request = store.delete(id);

    request.onsuccess = function() {
        // alert('Script eliminado con éxito');
        loadScriptsList();
    };

    request.onerror = function(event) {
        alert('Error al eliminar el script: ' + event.target.errorCode);
    };
}

// Función para cargar la lista de scripts
function loadScriptsList() {
    const store = getScriptsStore('readonly');
    if (!store) return;
    const request = store.getAll();

    request.onsuccess = function(event) {
        const scripts = event.target.result;
        const scriptsList = document.getElementById('scriptsList');
        scriptsList.innerHTML = '';

        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.id = 'search';
        searchInput.placeholder = 'Buscar scripts...';
        searchInput.style = 'border-radius: 20px; width: 100%; padding: 10px; margin-bottom: 10px;';
        scriptsList.appendChild(searchInput);
        

        scripts.forEach(script => {
            const scriptItem = document.createElement('div');
            scriptItem.className = 'script-item';
            // scriptItem.style.width = 'calc(40% - 20px)';
            
            // // const textSni = document.createElement('div');
            // // textSni.innerHTML = script.text;
            // // var clone = textSni.cloneNode(true);
            // // strip(clone, 200, 14);
            // textSnippet.innerHTML = script.text;
            // textSnippet.innerHTML = textSnippet.innerHTML.slice(0, 200) + '...';
            // // const textSnippet = document.createElement('div');
            // // textSnippet.innerHTML = clone.innerHTML;
            
            const textSnippet = document.createElement('div');
            // textSnippet.innerHTML = script.text.replace(/<div>/g, '').replace(/<\/div>/g, '').replace(/<br>/g, '\n').replace(/<p>/g, '\n').replace(/<\/p>/g, '');
            
            textSnippet.append(new DOMParser().parseFromString(script.text
                .replace(/<div>/g, '\n')
                .replace(/<br>/g, '\n')
                , 'text/html')
                .body.textContent.slice(0, 100) + '...');
            textSnippet.className = 'text-snippet';

            console.log(textSnippet);

            const scriptName = document.createElement('textarea');
            //scriptName.rows = 2;
            //scriptName.type = 'text';
            scriptName.textContent = script.name;
            scriptName.className = 'script-name';
            scriptName.dataset.id = script.id;
            scriptName.contentEditable = false;

            const loadButton = document.createElement('button');
            loadButton.className = 'load-script-button';
            loadButton.innerHTML = '<i class="fas fa-play"></i>';
            loadButton.onclick = (e) => {
                e.stopPropagation();
                loadScript(script.id);
                console.log('Script cargado');
            };
            scriptItem.appendChild(scriptName);
            scriptItem.appendChild(textSnippet);
            
            scriptItem.appendChild(loadButton);

            scriptItem.onclick = () => {
                // const edit = confirm(`¿Deseas editar el script "${script.name}"?`);
                // if (edit) {
                    loadScript(script.id);
                //} else {
            }
            scriptItem.oncontextmenu = (e) => {
                e.preventDefault();
                const del = confirm(`¿Deseas eliminar el script "${script.name}"?`);
                    if (del) {
                        deleteScript(script.id);
                    }
                }

            scriptsList.appendChild(scriptItem);
        });

        // Forzar el recálculo del diseño para el contenedor de scripts
        scriptsList.style.display = 'none';
        scriptsList.offsetHeight; // Forzar reflow
        scriptsList.style.display = 'flex';

        const newScriptButton = document.createElement('button');
        newScriptButton.id = 'newScriptButton';
        newScriptButton.className = 'new-script-button';
        newScriptButton.style = 'width:60px;height:60px;position: fixed;background-color:green;border-radius: 50%;z-index: 1050;';
        // newScriptButton.textContent = 'Nuevo Script';
        newScriptButton.innerHTML = '<i class="fa-solid fa-plus"></i>';
        newScriptButton.onclick = createNewScript;
        newScriptButton.style.display = 'block';
        scriptsList.appendChild(newScriptButton);

        var scriptElements = document.querySelectorAll('.script-item'); // Select all elements with class 'script-item'
        searchInput.oninput = () => {
            const filter = searchInput.value.toLowerCase(); // Use searchInput.value instead of search.value
            scriptElements.forEach(script => {
            const scriptName = script.querySelector('.script-name'); // Get the script name element
            const scriptText = script.querySelector('.text-snippet'); // Get the script text element
            if (scriptName.value.toLowerCase().includes(filter) || scriptText.textContent.toLowerCase().includes(filter)) {
                script.style.display = 'flex'; // Show the script item
            } else {
                script.style.display = 'none'; // Hide the script item
            }
            });
        };

    };

    request.onerror = function(event) {
        alert('Error al cargar la lista de scripts: ' + event.target.errorCode);
    };
}

// Función para crear un nuevo script
function createNewScript() {
    document.getElementById('teleprompter').innerHTML = '';
    // parrafo = document.createElement('p');
    // parrafo.textContent = 'Escribe aquí tu texto...';
    // document.getElementById('teleprompter').appendChild(parrafo);
    document.getElementById('scriptName').value = '';
    document.getElementById('scriptId').value = '';
    showEditor();
}

// Mostrar y ocultar el editor
function showEditor() {
    document.getElementById('teleprompterContainer').style.display = 'block';
    document.getElementById('scriptsList').style.display = 'none';
    document.getElementById('newScriptButton').style.display = 'none';
}

function hideEditor() {
    document.getElementById('teleprompterContainer').style.display = 'none';
    document.getElementById('scriptsList').style.display = 'block';
    // document.getElementById('newScriptButton').style.display = 'block';
}


// Funciones del teleprompter
document.getElementById('saveText').addEventListener('click', () => {
    const name = document.getElementById('scriptName').value;
    const text = document.getElementById('teleprompter').innerHTML;
    const id = document.getElementById('scriptId').value;
    if (name) {
        saveScript(id ? parseInt(id) : null, name, text);
    } else {
        alert('El nombre del script no puede estar vacío.');
    }
});


document.getElementById('resetButton').addEventListener('click', () => {
    if (confirm('¿Estás seguro de que quieres resetear el teleprompter? Esto eliminará todo el contenido.')) {
        document.getElementById('teleprompter').innerHTML = '';
        document.getElementById('scriptName').value = '';
        document.getElementById('scriptId').value = '';
    }
});


// adapta dinámicamente según la orientación de la pantalla el tamaño de script item para que entren dos en una fila y centrados


// window.addEventListener('orientationchange', () => {
//     const scriptElements = document.querySelectorAll('.script-item');
//     scriptElements.forEach(script => {
//         // script.style.width = 'calc(40% - 20px)';
//     });
// });

// window.addEventListener('resize', () => {
//     const scriptElements = document.querySelectorAll('.script-item');
//     scriptElements.forEach(script => {
//         // script.style.width = 'calc(40% - 20px)';
//     });
// });

// Función para recortar el texto
// function strip(el, max) {
//     var children = Array.prototype.slice.call(el.childNodes);
//     children.forEach((node) => {
//         if (node instanceof Text) {
//             var newCount = count + node.textContent.length;
//             var diff = newCount - max;
//             if (diff > 0)
//                 node.textContent = node.textContent.substring(0, node.textContent.length - diff);
//             count += node.textContent.length;
//         } else if (node instanceof HTMLElement) {
//             if (count >= max)
//                 node.remove();
//             else
//                 strip(node, max);
//         }
//     });
// }


// var count = 0;

// function strip(el, max, fontSize) {
//   var children = Array.prototype.slice.call(el.childNodes);
//   children.forEach((node) => {
//     if (node instanceof Text) {
//       var newCount = count + node.textContent.length;
//       var diff = newCount - max;
//       if (diff > 0)
//         node.textContent = node.textContent.substring(0, node.textContent.length - diff);
//         node.parentNode.style.fontSize = `${fontSize}px`; // set font size for text node's parent element
//       count += node.textContent.length;
//     } else if (node instanceof HTMLElement) {
//       if (count >= max)
//         node.remove(); // remove unnecessary tags
//       else
//         strip(node, max, fontSize); // do recursively
//     }
//   })
//   count = 0; // reset count for next element
// }


// function extractContent(s, space) {
//     var span= document.createElement('span');
//     span.innerHTML= s;
//     if(space) {
//       var children= span.querySelectorAll('*');
//       for(var i = 0 ; i < children.length ; i++) {
//         if(children[i].textContent)
//           children[i].textContent+= ' ';
//         else
//           children[i].innerText+= ' ';
//       }
//     }
//     return [span.textContent || span.innerText].toString().replace(/ +/g,' ');
//   };



// teleprompter.addEventListener('keyup', onKeyDown);

// function onKeyDown() {
//     var selection = window.getSelection();
//     if (!selection.rangeCount) return; // Verifica si hay una selección válida

//     var node = selection.focusNode;
//     if (node.nodeType !== Node.TEXT_NODE) return; // Asegúrate de que el nodo sea un nodo de texto

//     node = node.parentNode; // Obtén el nodo padre, asumiendo que es un elemento HTML
//     var input = node.textContent;

//     if (node.hasAttribute('data-processed')) {
//         return; // Salta si el nodo ya ha sido procesado
//     }

//     if (input.trim().length > 0) { // Ejecuta si el nodo tiene texto escrito
//         var keyShortcut = /^[^\S\r\n]{3}/gm; // Patrón para encontrar tres espacios en blanco
//         if (input.match(keyShortcut) && node.tagName.toLowerCase() === 'p') {
//             input = input.replace(/\s{3,}/gm, ' '); // Reemplaza los espacios en blanco
//             node.textContent = input; // Actualiza el contenido del nodo
//             node.style.color = 'red'; // Cambia el color del texto a rojo
//             console.log('Código');
//             node.setAttribute('data-processed', true); // Marca el nodo como procesado
//         }
//     }
// }



// function truncateText(el, max, fontSize) {
//     let count = 0;
  
//     function traverse(node) {
//       if (count >= max) {
//         node.remove(); // Si ya hemos alcanzado el límite, eliminamos el nodo
//         return;
//       }
  
//       if (node.nodeType === Node.TEXT_NODE) {
//         // Si es un nodo de texto, ajustamos su contenido
//         const diff = count + node.textContent.length - max;
//         if (diff > 0) {
//           node.textContent = node.textContent.slice(0, -diff);
//           node.parentNode.style.fontSize = `${fontSize}px`; // Ajustamos el tamaño de fuente
//         }
//         count += node.textContent.length;
//       } else if (node.nodeType === Node.ELEMENT_NODE) {
//         // Si es un elemento, lo recorremos recursivamente
//         Array.from(node.childNodes).forEach(traverse);
//       }
//     }
  
//     traverse(el); // Comenzamos la traversía desde el elemento dado
//   }

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





// // Inicializar IndexedDB
// var db;
// const request = indexedDB.open('teleprompterDB', 1);

// request.onerror = function(event) {
//     console.error('Database error:', event.target.errorCode);
// };

// request.onsuccess = function(event) {
//     db = event.target.result;
//     loadScriptsList();
// };

// request.onupgradeneeded = function(event) {
//     db = event.target.result;
//     const objectStore = db.createObjectStore('scripts', { keyPath: 'id', autoIncrement: true });
//     objectStore.createIndex('name', 'name', { unique: false });
//     objectStore.createIndex('text', 'text', { unique: false });
// };

// // Función para obtener el store de scripts
// function getScriptsStore(mode) {
//     const transaction = db.transaction(['scripts'], mode);
//     return transaction.objectStore('scripts');
// }

// // Función para guardar un script
// function saveScript(id, name, text) {
//     const store = getScriptsStore('readwrite');
//     const script = { name: name, text: text };
//     if (id) {
//         script.id = id;
//     }
//     const request = store.put(script);

//     request.onsuccess = function() {
//         alert('Script guardado con éxito');
//         loadScriptsList();
//         hideEditor();
//     };

//     request.onerror = function(event) {
//         alert('Error al guardar el script: ' + event.target.errorCode);
//     };
// }

// // Función para cargar un script
// function loadScript(id) {
//     const store = getScriptsStore('readonly');
//     const request = store.get(id);

//     request.onsuccess = function(event) {
//         const result = event.target.result;
//         if (result) {
//             document.getElementById('teleprompter').innerHTML = result.text;
//             document.getElementById('scriptName').value = result.name;
//             document.getElementById('scriptId').value = result.id;
//             showEditor();
//         } else {
//             alert('Script no encontrado');
//         }
//     };

//     request.onerror = function(event) {
//         alert('Error al cargar el script: ' + event.target.errorCode);
//     };
// }

// // Función para eliminar un script
// function deleteScript(id) {
//     const store = getScriptsStore('readwrite');
//     const request = store.delete(id);

//     request.onsuccess = function() {
//         alert('Script eliminado con éxito');
//         loadScriptsList();
//     };

//     request.onerror = function(event) {
//         alert('Error al eliminar el script: ' + event.target.errorCode);
//     };
// }

// // Función para cargar la lista de scripts
// function loadScriptsList() {
//     const store = getScriptsStore('readonly');
//     if (!store) return;
//     const request = store.getAll();

//     request.onsuccess = function(event) {
//         const scripts = event.target.result;
//         const scriptsList = document.getElementById('scriptsList');
//         scriptsList.innerHTML = '';

//         scripts.forEach(script => {
//             const scriptItem = document.createElement('div');
//             scriptItem.className = 'script-item';
//             const textSnippet = document.createElement('div');
//             textSnippet.textContent = script.text.replace(/<[^>]+>/g, '').substring(0, 200) + '...'; // Extraer texto sin HTML
//             const scriptName = document.createElement('input');
//             scriptName.type = 'text';
//             scriptName.value = script.name;
//             scriptName.className = 'script-name';
//             scriptName.dataset.id = script.id;

//             scriptItem.appendChild(textSnippet);
//             scriptItem.appendChild(scriptName);

//             scriptItem.onclick = () => {
//                 const edit = confirm(`¿Deseas editar el script "${script.name}"?`);
//                 if (edit) {
//                     loadScript(script.id);
//                 } else {
//                     const del = confirm(`¿Deseas eliminar el script "${script.name}"?`);
//                     if (del) {
//                         deleteScript(script.id);
//                     }
//                 }
//             };

//             scriptsList.appendChild(scriptItem);
//         });

//         // Forzar el recálculo del diseño para el contenedor de scripts
//         scriptsList.style.display = 'none';
//         scriptsList.offsetHeight; // Forzar reflow
//         scriptsList.style.display = 'flex';

//         const newScriptButton = document.createElement('button');
//         newScriptButton.id = 'newScriptButton';
//         newScriptButton.className = 'new-script-button';
//         newScriptButton.style = 'width:60px;height:60px;position: fixed;background-color:green;border-radius: 50%;z-index: 1050;';
//         // newScriptButton.textContent = 'Nuevo Script';
//         newScriptButton.innerHTML = '<i class="fa-solid fa-plus"></i>';
//         newScriptButton.onclick = createNewScript;
//         newScriptButton.style.display = 'block';
//         scriptsList.appendChild(newScriptButton);

//     };

//     request.onerror = function(event) {
//         alert('Error al cargar la lista de scripts: ' + event.target.errorCode);
//     };
// }

// // Función para crear un nuevo script
// function createNewScript() {
//     document.getElementById('teleprompter').innerHTML = '';
//     document.getElementById('scriptName').value = '';
//     document.getElementById('scriptId').value = '';
//     showEditor();
// }

// // Mostrar y ocultar el editor
// function showEditor() {
//     document.getElementById('teleprompterContainer').style.display = 'block';
//     document.getElementById('scriptsList').style.display = 'none';
//     document.getElementById('newScriptButton').style.display = 'none';
// }

// function hideEditor() {
//     document.getElementById('teleprompterContainer').style.display = 'none';
//     document.getElementById('scriptsList').style.display = 'block';
//     // document.getElementById('newScriptButton').style.display = 'block';
// }


// // Funciones del teleprompter
// document.getElementById('saveText').addEventListener('click', () => {
//     const name = document.getElementById('scriptName').value;
//     const text = document.getElementById('teleprompter').innerHTML;
//     const id = document.getElementById('scriptId').value;
//     if (name) {
//         saveScript(id ? parseInt(id) : null, name, text);
//     } else {
//         alert('El nombre del script no puede estar vacío.');
//     }
// });


// document.getElementById('resetButton').addEventListener('click', () => {
//     if (confirm('¿Estás seguro de que quieres resetear el teleprompter? Esto eliminará todo el contenido.')) {
//         document.getElementById('teleprompter').innerHTML = '';
//         document.getElementById('scriptName').value = '';
//         document.getElementById('scriptId').value = '';
//     }
// });


let db;

document.addEventListener("DOMContentLoaded", () => {
    initDatabase();
});

function initDatabase() {
    const request = indexedDB.open("teleprompterDB", 1);

    request.onerror = (event) => {
        console.error("Database error:", event.target.errorCode);
    };

    request.onsuccess = (event) => {
        db = event.target.result;
        loadScripts();
    };

    request.onupgradeneeded = (event) => {
        db = event.target.result;
        const objectStore = db.createObjectStore("scripts", { keyPath: "id", autoIncrement: true });
        objectStore.createIndex("name", "name", { unique: false });
        objectStore.createIndex("text", "text", { unique: false });
    };
}

function createScriptElement(script) {
    const scriptItem = document.createElement("div");
    scriptItem.classList.add("script-item");
    scriptItem.dataset.id = script.id;

    const name = document.createElement("div");
    name.classList.add("script-name");
    name.contentEditable = false;
    name.innerText = script.name;

    const content = document.createElement("div");
    content.classList.add("script-content");
    content.innerText = script.content.substring(0, 100);

    const loadButton = document.createElement("button");
    loadButton.classList.add("load-script-button");
    loadButton.innerText = "Cargar";
    loadButton.addEventListener("click", (e) => {
        e.stopPropagation();
        loadScript(script.id);
        startAutoScroll();
    });

    scriptItem.appendChild(name);
    scriptItem.appendChild(content);
    scriptItem.appendChild(loadButton);

    scriptItem.addEventListener("click", () => {
        name.contentEditable = true;
        name.focus();
        name.addEventListener("blur", () => {
            name.contentEditable = false;
            updateScriptName(script.id, name.innerText);
        });
    });

    return scriptItem;
}

function updateScriptName(id, newName) {
    const transaction = db.transaction(["scripts"], "readwrite");
    const store = transaction.objectStore("scripts");
    const request = store.get(id);

    request.onsuccess = () => {
        const script = request.result;
        script.name = newName;
        store.put(script);
    };
}

function loadScripts() {
    const transaction = db.transaction(["scripts"], "readonly");
    const store = transaction.objectStore("scripts");
    const request = store.getAll();

    request.onsuccess = (event) => {
        const scripts = event.target.result;
        const scriptsList = document.getElementById("scriptsList");
        scriptsList.innerHTML = "";
        scripts.forEach((script) => {
            const scriptElement = createScriptElement(script);
            scriptsList.appendChild(scriptElement);
        });
        // Forzar el recálculo del diseño para el contenedor de scripts
        scriptsList.style.display = 'none';
        scriptsList.offsetHeight; // Forzar reflow
        scriptsList.style.display = 'flex';
    };
}

function loadScript(id) {
    const transaction = db.transaction(["scripts"], "readonly");
    const store = transaction.objectStore("scripts");
    const request = store.get(id);

    request.onsuccess = (event) => {
        const script = event.target.result;
        const teleprompter = document.getElementById("teleprompter");
        teleprompter.innerHTML = script.content;
        teleprompter.dataset.id = script.id;
        toggleView("teleprompter");
    };
}

function saveScript() {
    const teleprompter = document.getElementById("teleprompter");
    const content = teleprompter.innerHTML;
    const id = teleprompter.dataset.id;

    const transaction = db.transaction(["scripts"], "readwrite");
    const store = transaction.objectStore("scripts");

    if (id) {
        const request = store.get(Number(id));
        request.onsuccess = (event) => {
            const script = event.target.result;
            script.content = content;
            store.put(script);
        };
    } else {
        const script = { name: "Nuevo Script", content };
        store.add(script);
    }
}

function addNewScript() {
    const teleprompter = document.getElementById("teleprompter");
    teleprompter.innerHTML = "";
    delete teleprompter.dataset.id;
    toggleView("teleprompter");
}

function toggleView(view) {
    const teleprompterContainer = document.getElementById("teleprompterContainer");
    const scriptsList = document.getElementById("scriptsList");
    const addScriptButton = document.getElementById("addScriptButton");

    if (view === "teleprompter") {
        teleprompterContainer.style.display = "block";
        scriptsList.style.display = "none";
        addScriptButton.style.display = "none";
    } else {
        teleprompterContainer.style.display = "none";
        scriptsList.style.display = "flex";
        addScriptButton.style.display = "flex";
        loadScripts();
    }
}

document.getElementById("addScriptButton").addEventListener("click", addNewScript);
document.getElementById("saveText").addEventListener("click", saveScript);
document.getElementById("resetButton").addEventListener("click", () => {
    document.getElementById("teleprompter").innerHTML = "";
});
document.getElementById("toggleScroll").addEventListener("click", toggleAutoScroll);

function toggleAutoScroll() {
    const teleprompter = document.getElementById('teleprompter');

    if (!teleprompter) {
        console.error('El elemento teleprompter no se encuentra en el DOM.');
        return;
    }

    const button = document.getElementById('toggleScroll');

    if (button.classList.contains('active')) {
        stopAutoScroll();
        button.classList.remove('active');
    } else {
        if (!teleprompter.hasAttribute('data-original-content')) {
            prepareTeleprompter();
        }
        startAutoScroll();
        button.classList.add('active');
    }
}

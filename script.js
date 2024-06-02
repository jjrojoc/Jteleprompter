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



///// CRONOMETRO /////

document.getElementById('timer').textContent = '00:00';

// Clase Cronometro modificada para incluir la capacidad de pausa
class Cronometro {
    constructor(displayElement) {
        this.displayElement = displayElement;
        this.startTime = 0;
        this.timerInterval = null;
        this.isRunning = false;
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.startTime = Date.now();
        this.timerInterval = setInterval(() => this.updateDisplay(), 1000);
    }

    stop() {
        if (!this.isRunning) return;
        clearInterval(this.timerInterval);
        this.updateDisplay();  // Aseguramos que la última visualización sea precisa
        this.isRunning = false;
    }

    reset() {
        this.displayElement.textContent = "00:00";
        this.isRunning = false;
        if (this.timerInterval) clearInterval(this.timerInterval);
    }

    // updateDisplay() {
    //     const elapsedTime = Date.now() - this.startTime;
    //     const hours = Math.floor(elapsedTime / 3600000);
    //     const minutes = Math.floor((elapsedTime % 3600000) / 60000);
    //     const seconds = Math.floor((elapsedTime % 60000) / 1000);
    //     this.displayElement.textContent = `${this.pad(hours)}:${this.pad(minutes)}:${this.pad(seconds)}`;
    // }

    updateDisplay() {
        const elapsedTime = Date.now() - this.startTime;
        const hours = Math.floor(elapsedTime / 3600000);
        const minutes = Math.floor((elapsedTime % 3600000) / 60000);
        const seconds = Math.floor((elapsedTime % 60000) / 1000);
    
        // Construir la visualización condicionalmente
        let displayTime = '';
        if (hours > 0) {
            displayTime += `${this.pad(hours)}:`;  // Incluir horas solo si es mayor que 0
        }
        displayTime += `${this.pad(minutes)}:${this.pad(seconds)}`;
    
        this.displayElement.textContent = displayTime;
    }
    
    pad(num) {
        return num.toString().padStart(2, '0');
    }
}



///// Inicializar IndexedDB /////
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
    };

    request.onerror = function(event) {
        alert('Error al guardar el script: ' + event.target.errorCode);
    };
}





// // Datos iniciales de ejemplo
// const scripts = [
//     { id: 1, name: "Script 1", text: "Este es el contenido del Script 1" },
//     { id: 2, name: "Script 2", text: "Este es el contenido del Script 2" }
// ];

// let currentScriptId = null;

// // Mostrar la lista de scripts al cargar la página
// document.getElementById('scriptList').style.display = 'block';

// // Renderizar la lista de scripts
// const scriptsContainer = document.getElementById('scriptsContainer');
// scripts.forEach(script => {
//     const li = document.createElement('li');
//     li.innerHTML = `
//         <span>${script.name}</span>
//         <button onclick="editScript(${script.id})">Editar</button>
//         <button onclick="startTeleprompter(${script.id})">Iniciar Teleprompter</button>
//     `;
//     scriptsContainer.appendChild(li);
// });



// Eliminamos los datos de ejemplo
// const scripts = [
//     { id: 1, name: "Script 1", text: "Este es el contenido del Script 1" },
//     { id: 2, name: "Script 2", text: "Este es el contenido del Script 2" }
// ];

// Eliminamos la variable currentScriptId

// Eliminamos el código que muestra la lista de scripts al cargar la página

// Definimos la función para cargar la lista de scripts
function loadScriptsList() {
    document.getElementById('scriptList').style.display = 'block';
    console.log('Cargando lista de scripts...');
    const store = getScriptsStore('readonly');
    if (!store) return;

    const scriptsList = document.getElementById('scriptList');
    scriptsList.innerHTML = '';

    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.id = 'search';
    searchInput.placeholder = 'Buscar scripts...';
    searchInput.style = 'border-radius: 20px; width: 100%; padding: 10px; margin-bottom: 10px;';
    scriptsList.appendChild(searchInput);

    const request = store.openCursor(null, 'prev');

    request.onsuccess = function(event) {
        const cursor = event.target.result;
        if (cursor) {
            const script = cursor.value;

            const scriptItem = document.createElement('div');
            scriptItem.className = 'script-item';

            const scriptName = document.createElement('div');
            scriptName.textContent = script.name;
            scriptName.className = 'script-name';
            scriptName.dataset.id = script.id;

            const textSnippet = document.createElement('div');
            textSnippet.className = 'text-snippet';
            textSnippet.append(new DOMParser().parseFromString(script.text
                .replace(/<div>/g, '\n')
                .replace(/<br>/g, '\n')
                , 'text/html')
                .body.textContent.slice(0, 100) + '...');

            const loadButton = document.createElement('button');
            loadButton.className = 'load-script-button';
            loadButton.innerHTML = '<i class="fas fa-play"></i>';
            loadButton.onclick = (e) => {
                e.stopPropagation();
                startTeleprompter(script.id);
            };

            scriptItem.appendChild(scriptName);
            scriptItem.appendChild(textSnippet);
            scriptItem.appendChild(loadButton);

            scriptItem.onclick = () => {
                loadScript(script.id);
            }

            scriptItem.oncontextmenu = (e) => {
                e.preventDefault();
                const del = confirm(`¿Deseas eliminar el script "${script.name}"?`);
                if (del) {
                    deleteScript(script.id);
                }
            }

            scriptsList.appendChild(scriptItem);

            cursor.continue();
        } else {

            reflow();

            const newScriptButton = document.createElement('button');
            newScriptButton.id = 'newScriptButton';
            newScriptButton.className = 'new-script-button';
            newScriptButton.style = 'width:60px;height:60px;position: fixed;background-color:green;border-radius: 50%;z-index: 1050;';
            newScriptButton.innerHTML = '<i class="fa-solid fa-plus"></i>';
            newScriptButton.onclick = createNewScript;
            newScriptButton.style.display = 'block';
            scriptsList.appendChild(newScriptButton);

            var scriptElements = document.querySelectorAll('.script-item');
            searchInput.oninput = () => {
                const filter = searchInput.value.toLowerCase();
                scriptElements.forEach(script => {
                    const scriptName = script.querySelector('.script-name');
                    const scriptText = script.querySelector('.text-snippet'); // Get the script text element
                    if (scriptName.textContent.toLowerCase().includes(filter) || scriptText.textContent.toLowerCase().includes(filter)) {
                        script.style.display = 'flex';
                    } else {
                        script.style.display = 'none';
                    }
                });
            };
        }
    };

    request.onerror = function(event) {
        alert('Error al cargar la lista de scripts: ' + event.target.errorCode);
    };
}



// Forzar el recálculo del diseño para el contenedor de scripts
function reflow() {
    const scriptsList = document.getElementById('scriptList');
    scriptsList.style.display = 'none';
    scriptsList.offsetHeight; // Forzar reflow
    scriptsList.style.display = 'flex';
}



// Función para crear un nuevo script
function createNewScript() {
    // Limpiar el contenido del editor
    document.getElementById('editor').innerHTML = '';
    // Limpiar el nombre y el ID del script
    document.getElementById('scriptName').value = '';
    document.getElementById('scriptId').value = '';
    // Mostrar el editor
    document.getElementById('scriptList').style.display = 'none';
    document.getElementById('editorSection').style.display = 'block';
}



// Funciones del teleprompter
document.getElementById('saveAndBackButton').addEventListener('click', () => {
    var name = document.getElementById('scriptName').value;
    var text = document.getElementById('editor').innerHTML;
    const id = document.getElementById('scriptId').value;
    if (name) {
        saveScript(id ? parseInt(id) : null, name, text);
    } else {
        var textExtract = document.getElementById('editor').textContent;
        if (textExtract) {
            var name = textExtract.substring(0, 30) + '...';
            saveScript(id ? parseInt(id) : null, name, text);
        }   else {
            loadScriptsList();
            document.getElementById('editorSection').style.display = 'none';
        }
        // var name = textExtract.substring(0, 30) + '...';
        // console.log(name);
        // saveScript(id ? parseInt(id) : null, name, text);
        // alert('El nombre del script no puede estar vacío.');
    }
});

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
        document.getElementById('editorSection').style.display = 'none'; // Ocultar el editor después de guardar
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
            document.getElementById('editor').innerHTML = result.text; // Cambiar 'teleprompter' por 'editor'
            document.getElementById('scriptName').value = result.name;
            document.getElementById('scriptId').value = result.id;
            document.getElementById('scriptList').style.display = 'none';
            document.getElementById('editorSection').style.display = 'block'; // Mostrar el editor
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



// Función para iniciar el teleprompter
function startTeleprompter(id) {
    const store = getScriptsStore('readonly');
    const request = store.get(id);

    request.onsuccess = function(event) {
        const result = event.target.result;
        if (result) {
            const script = result.text;
            const teleprompter = document.getElementById('teleprompter');
            teleprompter.innerHTML = script;
            document.getElementById('scriptList').style.display = 'none';
            document.getElementById('teleprompterSection').style.display = 'block';
            document.getElementById('stopResumeScroll').innerHTML = '<i class="fa-solid fa-pause"></i>';
            resetScrollPosition();
            requestAnimationFrame(() => startAutoScroll());
        }
    }
};


// Volver a la lista desde el teleprompter
document.getElementById('backToListFromTeleprompter').onclick = function() {
    document.getElementById('teleprompterSection').style.display = 'none';
    document.getElementById('scriptList').style.display = 'block';
    cronometro.stop();
    cronometro.reset();
    reflow();
    stopAutoScroll();
};



// Instancia del cronómetro
const timer = document.getElementById('timer');
const duration = document.getElementById('duration');
const cronometro = new Cronometro(timer);



let isAutoScrolling = false;
let scrollAnimation;
let translateYValue = 0;
let pixelsPerSecond = 0;
let hasReachedEnd = false;

function resetScrollPosition() {
    translateYValue = window.innerHeight;
    const teleprompter = document.getElementById('teleprompter');
    teleprompter.style.transform = `translateY(${translateYValue}px)`;
    hasReachedEnd = false;
}

function startAutoScroll() {
    const teleprompter = document.getElementById('teleprompter');
    let lastTime = null;

    if (hasReachedEnd) {
        resetScrollPosition();
    }

    if (!isAutoScrolling) {
        isAutoScrolling = true;
        document.getElementById('stopResumeScroll').style.display = 'block';

        cronometro.start();

        function animateScroll(timestamp) {
            if (!lastTime) lastTime = timestamp;
            const deltaTime = timestamp - lastTime;
            lastTime = timestamp;

            translateYValue -= (pixelsPerSecond * deltaTime) / 1000;
            teleprompter.style.transform = `translateY(${translateYValue}px)`;

            if (translateYValue <= -teleprompter.scrollHeight + window.innerHeight / 2) {
                stopAutoScroll();
                document.getElementById('backToListFromTeleprompter').style.display = 'block';
                document.querySelector('.control-speed').style.display = 'flex';
                document.querySelector('.control-text').style.display = 'flex';
                document.getElementById('stopResumeScroll').innerHTML = '<i class="fa-solid fa-play"></i>';
                document.getElementById('stopResumeScroll').style.backgroundColor = '#007BFF';

                cronometro.stop();
                hasReachedEnd = true;
            } else {
                scrollAnimation = requestAnimationFrame(animateScroll);
            }
        }
        scrollAnimation = requestAnimationFrame(animateScroll);
        startEstimatedTimeCountdown();
    }
}

function stopAutoScroll() {
    isAutoScrolling = false;
    cancelAnimationFrame(scrollAnimation);
    stopEstimatedTimeCountdown(); // Asegura detener el tiempo estimado
    // document.getElementById('stopResumeScroll').innerHTML = '<i class="fa-solid fa-play"></i>';
}



document.getElementById('stopResumeScroll').onclick = function() {
    if (isAutoScrolling) {
        stopAutoScroll();
        this.innerHTML = '<i class="fa-solid fa-play"></i>';
        this.style.backgroundColor = '#007BFF';
        document.getElementById('backToListFromTeleprompter').style.display = 'block';
        document.querySelector('.control-speed').style.display = 'flex';
        document.querySelector('.control-text').style.display = 'flex';
    } else {
        startAutoScroll();
        this.innerHTML = '<i class="fa-solid fa-pause"></i>';
        this.style.backgroundColor = 'red';
        document.getElementById('backToListFromTeleprompter').style.display = 'none';
        document.querySelector('.control-speed').style.display = 'none';
        document.querySelector('.control-text').style.display = 'none';
    }
};



///// Paste /////
document.addEventListener('DOMContentLoaded', function() {

    const speedControl = document.getElementById('speedControl');
    const scrollSpeedValue = document.getElementById('scrollSpeedValue');
    const textSizeControl = document.getElementById('textSizeControl');
    const textSizeValue = document.getElementById('textSizeValue');

    // Cargar valores guardados al iniciar
    const savedSpeed = localStorage.getItem('speed') || '42';  // Valor por defecto
    const savedTextSize = localStorage.getItem('textSize') || '36';  // Valor por defecto

    // Ajustar los sliders y mostrar los valores actuales
    speedControl.value = savedSpeed;
    scrollSpeedValue.textContent = savedSpeed;
    textSizeControl.value = savedTextSize;
    textSizeValue.textContent = `${savedTextSize}px`;

    // Aplicar los valores iniciales al teleprompter
    teleprompter.style.fontSize = `${savedTextSize}px`;
    pixelsPerSecond = savedSpeed;



    // funcionalidad de pegado
    document.getElementById('editor').addEventListener('paste', function(e) {
        e.preventDefault(); // Previene el comportamiento predeterminado del pegado.

        const clipboardData = e.clipboardData || window.clipboardData;
        const pastedData = clipboardData.getData('text/html') || clipboardData.getData('text/plain');

        // Crear un contenedor temporal donde se insertará el HTML para manipulación
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = pastedData;

        // Convertir &nbsp; a espacios normales y colapsar múltiples espacios a uno solo
        let htmlString = tempDiv.innerHTML.replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ');
        
        // Asignar de nuevo el HTML procesado
        tempDiv.innerHTML = htmlString;

        // Filtrar y modificar el contenido para ajustar los colores
        Array.from(tempDiv.querySelectorAll('*')).forEach(node => {
            const textColor = node.style.color; // Guardar el color del texto original
            node.removeAttribute('style'); // Eliminar todos los estilos para resetear

            // Aplicar lógica condicional basada en el color
            if (textColor && textColor !== 'white' && textColor !== 'rgb(255, 255, 255)' &&
                textColor !== 'black' && textColor !== 'rgb(0, 0, 0)' &&
                textColor !== 'rgb(41, 41, 41)') {
                // Si el color no es blanco, negro o gris, entonces reasigna el color
                node.style.color = textColor;
            }

            // Eliminar elementos que no contribuyen al texto visible
            if (node.tagName === 'SCRIPT' || node.tagName === 'META') {
                node.parentNode.removeChild(node);
            }
            // Si el color es blanco, negro o gris, no asignamos ningún color,
            // permitiendo que el texto herede el color por defecto del 'teleprompter'
        });

        // Insertar el contenido modificado en el elemento
        const selection = window.getSelection();
        if (!selection.rangeCount) return; // No hay nada seleccionado, no se puede insertar
        const range = selection.getRangeAt(0);
        range.deleteContents(); // Eliminar el contenido actual en la selección

        const fragment = document.createRange().createContextualFragment(tempDiv.innerHTML);
        range.insertNode(fragment);

        range.collapse(false);
        selection.removeAllRanges(); // Limpiar selecciones anteriores
        selection.addRange(range); // Establecer la nueva selección

        // updateTeleprompterHeight();
        // autoguardado();
    });
});


// Evento para cuando el valor del control de velocidad cambia
speedControl.addEventListener('input', function() {
    localStorage.setItem('speed', speedControl.value);
    scrollSpeedValue.textContent = speedControl.value;
    pixelsPerSecond = speedControl.value;
    console.log('Adjusting scroll speed to:', speedControl.value);
});



// Evento para cuando el valor del control de tamaño de texto cambia
textSizeControl.addEventListener('input', function() {
    localStorage.setItem('textSize', textSizeControl.value);
    textSizeValue.textContent = textSizeControl.value + 'px';
    console.log('Adjusting text size to:', textSizeControl.value + 'px');
    teleprompter.style.fontSize = textSizeControl.value + 'px'; // Ajustar el tamaño de texto en el teleprompter
    //updateTeleprompterHeight(); // Actualiza la altura del teleprompter para asegurar que se acomoda al nuevo tamaño del texto
});



///// Duracin estimada /////
let estimatedTimeInterval;

function startEstimatedTimeCountdown() {
    if (estimatedTimeInterval) clearInterval(estimatedTimeInterval);
    let remainingDistance = teleprompter.scrollHeight - (window.innerHeight / 2) + translateYValue;
    let estimatedTimeSeconds = remainingDistance / pixelsPerSecond;

    // Añadir 2 segundos al tiempo estimado
    //estimatedTimeSeconds += 2;

    estimatedTimeInterval = setInterval(() => {
        if (estimatedTimeSeconds <= 0) {
            clearInterval(estimatedTimeInterval);
            displayTime(0);
        } else {
            estimatedTimeSeconds -= 1;
            displayTime(estimatedTimeSeconds);
        }
    }, 1000);
}



function stopEstimatedTimeCountdown() {
    if (estimatedTimeInterval) {
        clearInterval(estimatedTimeInterval);
        estimatedTimeInterval = null; // Asegúrate de limpiar la referencia al intervalo
        console.log("Cuenta regresiva del tiempo estimado detenida.");
    }
    displayTime(0); // Resetea el tiempo mostrado a 00:00
}



function displayTime(seconds) {
    const duration = document.getElementById('duration');
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    let timeString = '';

    if (hours > 0) {
        timeString += `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    } else {
        timeString += `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    duration.textContent = timeString;
    console.log("Mostrando tiempo: ", seconds);
}



teleprompter = document.getElementById('teleprompter');
// Evento para manejar el auto-scrolling
teleprompter.addEventListener('touchstart', function(event) {
    // if (!isAutoScrolling) return;
    isTouching = true;
    startY = event.touches[0].clientY;
    //event.preventDefault();
}, { passive: false });



teleprompter.addEventListener('touchmove', function(event) {
    let touchY = event.touches[0].clientY;
    let deltaY = touchY - startY;

    // Calcula el nuevo valor de translateY, pero no lo asignes aún
    let newTranslateYValue = translateYValue + deltaY;

    // Limita el nuevo valor para que el contenido no se desplace más allá de sus límites
    newTranslateYValue = Math.min(0, newTranslateYValue); // Evita que se mueva hacia arriba más allá del inicio
    newTranslateYValue = Math.max(window.innerHeight - teleprompter.scrollHeight, newTranslateYValue); // Evita que se mueva hacia abajo más allá del final

    // Asigna el valor ajustado de translateYValue y actualiza la transformación
    translateYValue = newTranslateYValue;
    teleprompter.style.transform = `translateY(${translateYValue}px)`;

    startY = touchY;
    event.preventDefault();
}, { passive: false });



teleprompter.addEventListener('touchend', function(event) {
    // if (!isAutoScrolling) return;
    isTouching = false;
    if (isAutoScrolling) {
    startEstimatedTimeCountdown();
    }
});



function handleScrollEvent() {
    if (!isAutoScrolling) {
        const teleprompter = document.getElementById('teleprompter');
        const scrolledPosition = -teleprompter.scrollTop;
        teleprompter.style.transform = `translateY(${scrolledPosition}px)`;
    }
}



// Añadir evento de scroll para manejar cuando se hace scroll manual
teleprompter.addEventListener('scroll', handleScrollEvent);


///// Estilo de texto /////
// document.getElementById('colorPicker').addEventListener('change', function() {
//     var color = this.value;
//     const selection = window.getSelection();

//     if (!selection.rangeCount) return;

//     if (color === '#ffffff' || color === 'rgb(255, 255, 255)') {
//         removeColorFromSelection(selection);
//     } else {
//         applyColorToSelection(color, selection);
//     }
// });



// function removeColorFromSelection(selection) {
//     if (selection.rangeCount === 0) return;

//     const range = selection.getRangeAt(0);
//     let startNode = range.startContainer;
//     let endNode = range.endContainer;

//     // Expand the start of the range to the beginning of the span
//     while (startNode !== null && startNode.nodeType !== Node.ELEMENT_NODE || (startNode.tagName !== 'SPAN' && startNode.parentNode)) {
//         startNode = startNode.parentNode;
//     }

//     // Expand the end of the range to the end of the span
//     while (endNode !== null && endNode.nodeType !== Node.ELEMENT_NODE || (endNode.tagName !== 'SPAN' && endNode.parentNode)) {
//         endNode = endNode.parentNode;
//     }

//     // Check if we're actually inside a span and adjust if so
//     if (startNode.tagName === 'SPAN') {
//         range.setStartBefore(startNode);
//     }
//     if (endNode.tagName === 'SPAN') {
//         range.setEndAfter(endNode);
//     }

//     // Update the selection with the new range
//     selection.removeAllRanges();
//     selection.addRange(range);


//     const fragment = range.extractContents();

//     // Function to recursively remove all span elements
//     function flattenSpans(node) {
//         if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'SPAN') {
//             // Replace span with a text node containing its content
//             const textNode = document.createTextNode(node.textContent);
//             node.parentNode.insertBefore(textNode, node);
//             node.parentNode.removeChild(node);
//         } else {
//             // Process all child nodes
//             Array.from(node.childNodes).forEach(child => flattenSpans(child));
//         }
//     }

//     flattenSpans(fragment);

//     // Reinsert the cleaned fragment back into the document
//     range.insertNode(fragment);
//     range.collapse(false);

//     // Update the selection to reflect the change
//     selection.removeAllRanges();
//     selection.addRange(range);
// };
    


// function applyColorToSelection(color, selection) {
//     const range = selection.getRangeAt(0);
//     const span = document.createElement('span');
//     span.style.color = color;
//     span.appendChild(range.extractContents());
//     range.insertNode(span);

//     // Re-seleccionar el contenido del nuevo span
//     selection.removeAllRanges();
//     const newRange = document.createRange();
//     newRange.selectNodeContents(span);
//     selection.addRange(newRange);
// }



// document.addEventListener('selectionchange', function() {
//     const selection = window.getSelection();
//     if (!selection.rangeCount) return;

//     const range = selection.getRangeAt(0);
//     const node = range.startContainer.parentNode; // Obtiene el nodo donde comienza la selección

//     // Asume que el color puede estar en un elemento span; ajusta según sea necesario
//     if (node.nodeType === Node.ELEMENT_NODE && node.tagName === "SPAN") {
//         const color = window.getComputedStyle(node).color;
//         document.getElementById('colorPicker').value = rgbToHex(color); // Actualiza el selector de color
//     } else {
//         // Si el nodo seleccionado no es un <span>, se podría establecer un color por defecto o mantener el actual
//         const color = window.getComputedStyle(node).color;
//         document.getElementById('colorPicker').value = rgbToHex(color);
//     }
// });

// // Función para convertir color RGB a Hex
// function rgbToHex(rgb) {
//     const rgbArr = rgb.match(/\d+/g);
//     return rgbArr ? "#" + rgbArr.map(x => parseInt(x).toString(16).padStart(2, '0')).join('') : '#000000';
// }


// Función para alternar entre negrita y normal
document.querySelector('#boldButton').addEventListener('click', () => {
    let selection = document.getSelection();
    
    const isAllowedContainer = selection.baseNode.parentElement?.closest?.('#editor');
    
    // do not continue if no text selection or this is not the desired element container
    if( selection.rangeCount < 1 || !isAllowedContainer ) return;
    
    const range = selection.getRangeAt(0);
    const selParent = selection.anchorNode?.parentElement;
    const selectedElem = selParent?.nodeType == 1 && selParent?.children.length < 2 && selParent;
    
    // un-wrap
    if(selectedElem.tagName === 'B') {
        selectedElem.replaceWith(...selectedElem.childNodes)
    }
 
    // wrap with <i>
    else {
        let parent = selectedElem;
        while (parent && parent.tagName !== 'B') {
            parent = parent.parentElement;
        }
        if (parent) {
            parent.replaceWith(...parent.childNodes);
        }
        const fragment = range.extractContents();
        const iElement = document.createElement("b");
        iElement.appendChild(fragment);
        range.insertNode(iElement);
        selection.removeAllRanges();
        selection.addRange(range);
        range.collapse(); // removes selected and places caret at the end of the injected node
    }
})



// Función para alternar entre italic y normal
document.querySelector('#italicButton').addEventListener('click', () => {
    let selection = document.getSelection();
    
    const isAllowedContainer = selection.baseNode.parentElement?.closest?.('#editor');
    
    // do not continue if no text selection or this is not the desired element container
    if( selection.rangeCount < 1 || !isAllowedContainer ) return;
    
    const range = selection.getRangeAt(0);
    const selParent = selection.anchorNode?.parentElement;
    const selectedElem = selParent?.nodeType == 1 && selParent?.children.length < 2 && selParent;
    
    // un-wrap
    if(selectedElem.tagName === 'I') {
        selectedElem.replaceWith(...selectedElem.childNodes)
    }
 
    // wrap with <i>
    else {
        let parent = selectedElem;
        while (parent && parent.tagName !== 'I') {
            parent = parent.parentElement;
        }
        if (parent) {
            parent.replaceWith(...parent.childNodes);
        }
        const fragment = range.extractContents();
        const iElement = document.createElement("i");
        iElement.appendChild(fragment);
        range.insertNode(iElement);
        selection.removeAllRanges();
        selection.addRange(range);
        range.collapse(); // removes selected and places caret at the end of the injected node
    }
})



// Función para actualizar el estado de los botones
function updateButtonStates() {
    const selection = document.getSelection();
    const boldButton = document.querySelector('#boldButton');
    const italicButton = document.querySelector('#italicButton');

    if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const selParent = selection.anchorNode?.parentElement;

        if (selParent) {
            let parent = selParent;
            let isBold = false;
            let isItalic = false;

            while (parent && parent.tagName !== 'DIV') {
                if (parent.tagName === 'B') {
                    isBold = true;
                }
                if (parent.tagName === 'I') {
                    isItalic = true;
                }
                parent = parent.parentElement;
            }

            if (isBold) {
                boldButton.classList.add('active');
            } else {
                boldButton.classList.remove('active');
            }

            if (isItalic) {
                italicButton.classList.add('active');
            } else {
                italicButton.classList.remove('active');
            }
        }
    }
}



// Event listener para el evento selectionchange
document.addEventListener('selectionchange', updateButtonStates);



// Función para alternar el color del texto
document.querySelectorAll('.colorButton').forEach(button => {
    button.addEventListener('click', (e) => {
        const color = e.target.dataset.color;
        toggleColor(color);
    });
});

function toggleColor(color) {
    let selection = document.getSelection();
    const isAllowedContainer = selection.baseNode.parentElement?.closest?.('#editor');
    
    if (selection.rangeCount < 1 || !isAllowedContainer) return;
    
    const range = selection.getRangeAt(0);
    const selParent = selection.anchorNode?.parentElement;
    const selectedElem = selParent?.nodeType === 1 && selParent?.children.length < 2 && selParent;
    
    if (selectedElem && selectedElem.style.color === color) {
        selectedElem.replaceWith(...selectedElem.childNodes);
    } else {
        let parent = selectedElem;
        while (parent && parent.style.color !== color) {
            parent = parent.parentElement;
        }
        if (parent) {
            parent.replaceWith(...parent.childNodes);
        }
        const fragment = range.extractContents();
        const spanElement = document.createElement("span");
        spanElement.style.color = color;
        spanElement.appendChild(fragment);
        range.insertNode(spanElement);
        selection.removeAllRanges();
        selection.addRange(range);
        range.collapse();
    }
    updateButtonStates();
}


document.querySelector('#removeColorButton').addEventListener('click', () => {
    let selection = document.getSelection();
    const isAllowedContainer = selection.baseNode.parentElement?.closest?.('#editor');
    
    if (selection.rangeCount < 1 || !isAllowedContainer) return;
    
    const range = selection.getRangeAt(0);
    removeColorSpans(range);
    selection.removeAllRanges();
});

function removeColorSpans(range) {
    const iterator = document.createNodeIterator(range.commonAncestorContainer, NodeFilter.SHOW_ELEMENT, {
        acceptNode: (node) => {
            return node.tagName === 'SPAN' && node.style.color ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
        }
    });
    
    let node;
    while ((node = iterator.nextNode())) {
        if (range.intersectsNode(node)) {
            node.replaceWith(...node.childNodes);
        }
    }
}
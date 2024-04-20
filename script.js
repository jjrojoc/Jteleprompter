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
        document.getElementById('toggleScroll').style.backgroundColor = "#007BFF";
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
    alert('Text saved!');
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

document.getElementById('editToggle').addEventListener('click', function() {
    const teleprompter = document.getElementById('teleprompter');
    const isEditable = teleprompter.contentEditable === "true";
    teleprompter.contentEditable = !isEditable;  // Alternar el estado de edición
    const icon = this.querySelector('i'); // Selecciona el icono dentro del botón

    // Verifica si el contenido debe ser borrado
    if (!isEditable && teleprompter.innerText.includes("click en Start para iniciar teleprompt")) {
        teleprompter.innerText = '';  // Borra el texto
        icon.className = 'fas fa-stop-circle'; // Cambia el icono a parar editar
        window.setTimeout(function() {
            const range = document.createRange();
            const sel = window.getSelection();
            range.setStart(teleprompter, 0);
            range.collapse(true);
            sel.removeAllRanges();
            sel.addRange(range);
            teleprompter.focus();  // enfoca el elemento para que el cursor aparezca
        }, 1);
    }

    // this.textContent = isEditable ? 'Editar' : 'Parar Editar'; // Actualiza el texto del botón

    if (isEditable){
        icon.className = 'fas fa-edit'; // Cambia el icono a editar
        let scriptText = teleprompter.innerText.trim();
        if (scriptText === '') {
            scriptText = '1º Click en Menú --> Editar <br>2º Copia y pega aquí el texto que desees, edítalo o escribe tu propio texto <br>3º Click en Menú --> Parar Editar <br>Listo, click en Start para iniciar teleprompt'; // Establece texto predeterminado si está vacío
        }
        teleprompter.innerHTML = scriptText;
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
    if (confirm('Are you sure you want to reset the teleprompter content? This action cannot be undone.')) {
        // Borra específicamente el contenido del párrafo con ID 'script'
        document.getElementById('teleprompter').innerHTML = ''; // Restablece el contenido a vacío
        alert('Teleprompter content has been reset.'); // Opcional: Muestra un mensaje de confirmación
        localStorage.setItem('savedScript', scriptText); // guarda datos
    }
});

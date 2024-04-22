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
let scrollInterval = null;
let lastScrollTop = 0;

const teleprompter = document.getElementById('teleprompter');
const speedControl = document.getElementById('speedControl');
// Existing variables and toggleAutoScroll function remain the same

const textSizeControl = document.getElementById('textSizeControl');
const textColorControl = document.getElementById('textColorControl');

document.getElementById('toggleScroll').addEventListener('click', toggleAutoScroll);

document.getElementById('loadText').style.display = 'none';

textColorControl.addEventListener('change', () => {
    // const newColor = document.getElementById('textColorPicker').value; // toma el color del colorpicker
    const newColor = textColorControl.value;
    teleprompter.style.color = newColor;
});

// Clase Cronometro modificada para incluir la capacidad de pausa
class Cronometro {
    constructor(displayElement) {
        this.displayElement = displayElement;
        this.elapsedTime = 0;
        this.startTime = 0;
        this.timerInterval = null;
        this.paused = true;
        this.displayPausedTime = false;
    }

    start() {
        if (!this.paused) return;
        this.paused = false;
        this.displayPausedTime = false;
        this.startTime = Date.now() - this.elapsedTime;
        this.timerInterval = setInterval(() => this.updateDisplay(), 1000);
    }

    pause() {
        if (this.paused) return;
        this.paused = true;
        clearInterval(this.timerInterval);
        this.elapsedTime = Date.now() - this.startTime;  // Capture el tiempo transcurrido antes de pausar
        this.displayPausedTime = true;
        this.updateDisplay(); // Update to show paused time
    }

    continue() {
        if (!this.displayPausedTime) return;
        this.paused = false;
        this.displayPausedTime = false;
        this.startTime = Date.now() - this.elapsedTime;
        this.timerInterval = setInterval(() => this.updateDisplay(), 1000);
    }

    stop() {
        if (this.paused) return;
        clearInterval(this.timerInterval);
        this.elapsedTime = Date.now() - this.startTime;
        this.paused = true;
    }

    reset() {
        if (!this.paused) return;
        this.elapsedTime = 0;
        this.updateDisplay();
    }

    updateDisplay() {
        let currentTime = this.elapsedTime;
        if (!this.paused && !this.displayPausedTime) {
            currentTime = Date.now() - this.startTime;
        }
        const hours = Math.floor(currentTime / 3600000);
        const minutes = Math.floor((currentTime % 3600000) / 60000);
        const seconds = Math.floor((currentTime % 60000) / 1000);
        this.displayElement.textContent = `${this.pad(hours)}:${this.pad(minutes)}:${this.pad(seconds)}`;
    }

    pad(num) {
        return num.toString().padStart(2, '0');
    }
}










// Instancia del cronómetro
const timerDisplay = document.getElementById("timer");
const cronometro = new Cronometro(timerDisplay);

document.getElementById('timer').addEventListener('click', function() {
    if (!isAutoScrolling) {  // Solo permite resetear si el auto-scroll no está activo
      //accumulatedTime = 0;  // Resetea el tiempo acumulado
      cronometro.reset();  // Actualiza el display a 00:00:00
      console.log('Timer reset to 00:00:00');
    }
});

function toggleAutoScroll() {
    // Get the button
    let mybutton = document.getElementById("myBtn");
    var button = this;
    var icon = button.querySelector('i');
  
    // Verifica si el contenido es más alto que el contenedor
    if (teleprompter.scrollHeight > teleprompter.clientHeight) {
    const controls = document.querySelectorAll('.control'); // Obtiene todos los elementos con la clase 'control'
    const isScrolling = this.classList.toggle('active'); // Alterna la clase 'active'
  
    controls.forEach(control => {
    control.style.display = isScrolling ? 'none' : 'block'; // Cambia la visibilidad de los controles
  });
  

  if (!isAutoScrolling) {
    icon.className = "fas fa-stop"; // Cambia el ícono a "stop"
    document.getElementById('toggleScroll').style.backgroundColor = "#ff0000";
    isAutoScrolling = true;
    if (teleprompter.scrollTop === 0) {  // Si el teleprompter está al inicio, reinicia el timer
        cronometro.reset();
        console.log("reset en el inicio");
        cronometro.start();
        console.log("start en inicio");
    } else {
        cronometro.continue();  // Continúa el temporizador sin resetear
        console.log("continue");
    }
    // Iniciar el auto-scroll aquí
    const speed = 100 - speedControl.value;
    scrollInterval = setInterval(() => {
        teleprompter.scrollBy(0, 1);
        if (teleprompter.scrollTop + teleprompter.clientHeight >= teleprompter.scrollHeight) {
            console.log('Reached End, stopping autoscroll.');
            toggleAutoScroll.call(button);
            cronometro.stop();
            if (teleprompter.scrollTop != 0) {
                mybutton.style.display = "block";
            }
            } else {
                mybutton.style.display = "none";
            }
    }, speed);
  } else {
    icon.className = "fas fa-play"; // Cambia el ícono a "play"
    document.getElementById('toggleScroll').style.backgroundColor = "#555555";
    isAutoScrolling = false;
    cronometro.pause();
    console.log("stop");
    clearInterval(scrollInterval);  // Detiene el auto-scroll
  }
} else {
    // Si no hay suficiente contenido para scrollear, simplemente desactiva el botón
    alert('No hay suficiente contenido para hacer scroll.');
}
}


function topFunction() {
    let mybutton = document.getElementById("myBtn");
    teleprompter.scrollTop = 0;
    document.documentElement.scrollTop = 0;
    mybutton.style.display = 'none';
  }
// function toggleAutoScroll() {
//     const controls = document.querySelectorAll('.control'); // Obtiene todos los elementos con la clase 'control'
//     const isScrolling = this.classList.toggle('active'); // Alterna la clase 'active'
    
//     controls.forEach(control => {
//         control.style.display = isScrolling ? 'none' : 'block'; // Cambia la vi
//     });
//     var button = this;
//     var icon = button.querySelector('i');

//     if (!isAutoScrolling) {
//         // Verificar si el teleprompter está al principio del contenido
//         if (teleprompter.scrollTop === 0) {
//             console.log("scrollTop");
//             resetTimer();  // Reinicia el cronómetro si está al principio
//         }
//         icon.className = "fas fa-stop"; // Cambia el ícono a "stop"
//         document.getElementById('toggleScroll').style.backgroundColor = "#ff0000";
//         isAutoScrolling = true; // Actualiza el estado
//         startTimer();

//         // Iniciar el autoscroll aquí
//         const speed = 100 - speedControl.value;
//         scrollInterval = setInterval(() => {
//             teleprompter.scrollBy(0, 1);
//         }, speed);
//     } else {
//         icon.className = "fas fa-play"; // Cambia el ícono a "play"
//         // document.getElementById('toggleScroll').style.backgroundColor = "#007BFF";
//         document.getElementById('toggleScroll').style.backgroundColor = "#555555";
//         isAutoScrolling = false; // Actualiza el estado
//         stopTimer();
    
//         // Detener el autoscroll aquí
//         clearInterval(scrollInterval);
//     }
// }



function resetTimer() {
    stopTimer();
    startTimer();
}



// function resetTimer() {
//     if (timerInterval) {
//         clearInterval(timerInterval);
//         timerInterval = null;
//     }
//     startTime = Date.now(); // Restablece la hora de inicio
//     updateTimer(); // Actualizar el cronómetro de inmediato
//     timerInterval = setInterval(updateTimer, 1000); // Continuar actualizando cada segundo
//}

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


document.addEventListener('DOMContentLoaded', function() {
    // Obtener referencias a los elementos de la interfaz
    const speedControl = document.getElementById('speedControl');
    const scrollSpeedValue = document.getElementById('scrollSpeedValue');
    const textSizeControl = document.getElementById('textSizeControl');
    const textSizeValue = document.getElementById('textSizeValue');
    const teleprompter = document.getElementById('teleprompter'); // Asegúrate de que este ID exista

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
    adjustSpeed(speedControl.value);  // Ajustar la velocidad inicial

    // Evento para cuando el valor del control de velocidad cambia
    speedControl.addEventListener('input', function() {
        localStorage.setItem('speed', speedControl.value);
        scrollSpeedValue.textContent = speedControl.value;
        adjustSpeed(speedControl.value);  // Ajustar la velocidad en la aplicación
    });

    // Evento para cuando el valor del control de tamaño de texto cambia
    textSizeControl.addEventListener('input', function() {
        localStorage.setItem('textSize', textSizeControl.value);
        textSizeValue.textContent = textSizeControl.value + 'px';
        console.log('Adjusting text size to:', textSizeControl.value + 'px');
        teleprompter.style.fontSize = textSizeControl.value + 'px'; // Ajustar el tamaño de texto en el teleprompter
    });
});

function adjustSpeed(speed) {
    // Aquí puedes ajustar la velocidad del scroll en tu aplicación
    console.log('Adjusting speed to:', speed);
    // Asigna una lógica adecuada para ajustar la velocidad de scroll aquí.
    // Esto podría implicar ajustar intervalos de tiempo, modificar CSS, etc.
    if (isAutoScrolling) {
        clearInterval(scrollInterval);
        const speedscroll = 100 - speed;
        scrollInterval = setInterval(() => {
            teleprompter.scrollBy(0, 1);
        }, speedscroll);
    }
}

function prepareTeleprompter() {
    const teleprompter = document.getElementById('teleprompter');
    const content = teleprompter.innerHTML.trim();

    // Asegurarse de que el contenido no comienza ni termina con múltiples <br>
    if (!content.startsWith('<br><br><br><br>') || !content.endsWith('<br><br><br><br>')) {
        const linesToAdd = 4;
        const padding = '<br>'.repeat(linesToAdd);

        // Añadir saltos de línea al principio y al final
        teleprompter.innerHTML = padding + content + padding;
    }
}

// Preparar teleprompter cuando se cargue la página o cuando sea necesario
document.addEventListener('DOMContentLoaded', prepareTeleprompter);

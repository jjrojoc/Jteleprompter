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

let isAutoScrolling = false; // Estado inicial del autoscroll
let scrollInterval = null;
let lastScrollTop = 0;

const teleprompter = document.getElementById('teleprompter');
const speedControl = document.getElementById('speedControl');
// Existing variables and toggleAutoScroll function remain the same

const textSizeControl = document.getElementById('textSizeControl');
const textColorControl = document.getElementById('textColorControl');

document.getElementById('toggleScroll').addEventListener('click', toggleAutoScroll);

document.getElementById('loadText').style.display = 'none';
document.getElementById('saveText').style.display = 'none';

textColorControl.addEventListener('change', () => {
    // const newColor = document.getElementById('textColorPicker').value; // toma el color del colorpicker
    const newColor = textColorControl.value;
    teleprompter.style.color = newColor;
});


 


// test teleprompter scroll evento
// teleprompter.addEventListener('scroll', function() {
//     // Verificar si el teleprompter está en modo edición
//     if (teleprompter.contentEditable === "true") {
//         if (confirm("El contenido está siendo editado. ¿Desea guardar los cambios y continuar?")) {
//             console.log("En modo edición, función de fin de scroll desactivada.");
//             document.getElementById('editToggle').click();
//         }
//         return; // Salir si está en modo edición
//     }

//     // Comprobar si hemos llegado al final del scroll
//     if (teleprompter.scrollHeight - teleprompter.scrollTop === teleprompter.clientHeight) {
//         // Llegamos al final del scroll
//         performEndOfScrollFunction(); // Función que se ejecuta al llegar al final
//     }
// });

// function performEndOfScrollFunction() {
//     // Función que deseas ejecutar al llegar al final del scroll
//     console.log("Función al final del scroll activada.");
    
//     const controls = document.querySelectorAll('.control'); // Obtiene todos los elementos con la clase 'control'
//     const isScrolling = this.classList.toggle('active'); // Alterna la clase 'active'
  
//     controls.forEach(control => {
//     control.style.display = isScrolling ? 'none' : 'block'; // Cambia la visibilidad de los controles
//     }
// };


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


// function toggleAutoScroll() {
//     // Get the button
//     let mybutton = document.getElementById("myBtn");
//     var button = this;
//     var icon = button.querySelector('i');

//     // Verifica si el teleprompter es editable
//     if (teleprompter.contentEditable === "true") {
//         if (confirm("El contenido está siendo editado. ¿Desea guardar los cambios y continuar?")) {
//             // Llama a la función que maneja la edición y el guardado de cambios
//             document.getElementById('editToggle').click();
//         } else {
//             console.log("Cambios no guardados, auto-scroll no activado.");
//             return; // No activar el auto-scroll
//         }
//     }
  
//     // Verifica si el contenido es más alto que el contenedor
//     if (teleprompter.scrollHeight > teleprompter.clientHeight) {
//     const controls = document.querySelectorAll('.control'); // Obtiene todos los elementos con la clase 'control'
//     const isScrolling = this.classList.toggle('active'); // Alterna la clase 'active'
  
//     controls.forEach(control => {
//     control.style.display = isScrolling ? 'none' : 'block'; // Cambia la visibilidad de los controles
//   });
  

//   if (!isAutoScrolling) {
//     icon.className = "fas fa-stop"; // Cambia el ícono a "stop"
//     document.getElementById('toggleScroll').style.backgroundColor = "#ff0000";
//     isAutoScrolling = true;
//     if (teleprompter.scrollTop === 0) {  // Si el teleprompter está al inicio, reinicia el timer
//         cronometro.reset();
//         console.log("reset en el inicio");
//         cronometro.start();
//         console.log("start en inicio");
//     } else {
//         cronometro.start();  // Continúa el temporizador sin resetear
//         console.log("continue");
//     }
//     // Iniciar el auto-scroll aquí
//     const speed = 100 - speedControl.value;
//     scrollInterval = setInterval(() => {
//         teleprompter.scrollBy(0, 1);
//         if (teleprompter.scrollTop + teleprompter.clientHeight >= teleprompter.scrollHeight) {
//             console.log('Reached End, stopping autoscroll.');
//             toggleAutoScroll.call(button);
//             cronometro.stop();
//             if (teleprompter.scrollTop != 0) {
//                 mybutton.style.display = "block";
//             }
//             } else {
//                 mybutton.style.display = "none";
//             }
//     }, speed);
//   } else {
//     icon.className = "fas fa-play"; // Cambia el ícono a "play"
//     document.getElementById('toggleScroll').style.backgroundColor = "#555555";
//     isAutoScrolling = false;
//     //cronometro.stop();
//     //console.log("stop");
//     clearInterval(scrollInterval);  // Detiene el auto-scroll
//   }
// } else {
//     // Si no hay suficiente contenido para scrollear, simplemente desactiva el botón
//     alert('No hay suficiente contenido para hacer scroll.');
// }
// }


const toggleButton = document.getElementById('toggleScroll');
const countdownDisplay = document.getElementById('countdownDisplay');
let holdTimeout;
let visualTimer;
let countdownIntervalo; // Asegúrate de que el nombre sea consistente
let countdown = 3; // Duración de la cuenta regresiva en segundos

// Eventos para dispositivos con mouse
toggleButton.addEventListener('mousedown', handlePressDown);
toggleButton.addEventListener('mouseup', handlePressUp);
toggleButton.addEventListener('mouseleave', handlePressUp);

// Eventos para dispositivos táctiles
toggleButton.addEventListener('touchstart', handlePressDown, { passive: true });
toggleButton.addEventListener('touchend', handlePressUp);
toggleButton.addEventListener('touchcancel', handlePressUp);



function handlePressUp() {
    // Limpiar los temporizadores
    clearTimeout(holdTimeout);
    clearTimeout(visualTimer);
    // clearTimeout(pressTimer);

    // Detener la cuenta atrás si está activa
    if (countdownIntervalo) {
        stopCountdownRestart();
    }

    // Restablecer el color del botón solo si auto-scrolling no está activo
    if (!isAutoScrolling) {
        toggleButton.style.backgroundColor = "rgb(255, 255, 255, 0.2)"; // Revertir a color original
    } else {
        toggleButton.style.backgroundColor = "red"; // Mantener rojo si auto-scrolling está activo
    }
}



function handlePressDown() {
    if (isAutoScrolling) {
        console.log('Auto-scroll en ejecución, acción bloqueada.');
        return;  // No hacer nada si el auto-scroll está activo
    }
    
    // Comienza la cuenta atrás si se mantiene presionado por más de 1 segundo
    holdTimeout = setTimeout(countdownRestart, 1000);

    // Cambio visual inmediato
    // toggleButton.style.backgroundColor = "red";

    // Cambio visual después de 1 segundo para indicar acción próxima
    visualTimer = setTimeout(() => {
        toggleButton.style.backgroundColor = "orange";
    }, 1000);
}

function countdownRestart() {
    countdown = 3; // Restablece la cuenta atrás cada vez
    countdownDisplay.textContent = countdown;
    countdownDisplay.style.display = 'block';

    countdownIntervalo = setInterval(function() {
        countdown--;
        countdownDisplay.textContent = countdown;
        if (countdown === 0) {
            clearInterval(countdownIntervalo);
            activateSpecialFunction();  // Ahora activa la función especial aquí
            // toggleButton.style.backgroundColor = "green"; // Indica que la función especial se ha activado
            countdownDisplay.style.display = 'none'; // Oculta el contador
        }
    }, 1000);
}


function stopCountdownRestart() {
    clearInterval(countdownIntervalo);
    countdownIntervalo = null;
    countdownDisplay.style.display = 'none';
}



function activateSpecialFunction() {
    // Acción especial a ejecutar después de mantener presionado 3 segundos
    console.log('Acción especial activada');
    // Puedes agregar cualquier código adicional aquí
    document.documentElement.scrollTop = 0;
    cronometro.stop();
    cronometro.reset();
    stopAutoScroll();  // Asegúrate de detener el auto-scroll si el botón se presiona

    // restaura contenido original
    const teleprompter = document.getElementById('teleprompter');
    const originalContent = teleprompter.getAttribute('data-original-content');
    if (originalContent) {
        teleprompter.innerHTML = originalContent;
        teleprompter.removeAttribute('data-original-content'); // Limpia el atributo una vez restaurado
        teleprompter.scrollTop = 0; // Opcional, resetear el scroll
    } else {
        console.log("No original content found to restore.");
    }
}





function toggleAutoScroll() {
    const teleprompter = document.getElementById('teleprompter');
    const button = document.getElementById('toggleScroll');

    if (teleprompter.contentEditable === "true" && !confirm("El contenido está siendo editado. ¿Desea guardar los cambios y continuar?")) {
        console.log("Cambios no guardados, auto-scroll no activado.");
        return;
    }

    if (teleprompter.scrollHeight <= teleprompter.clientHeight) {
        alert('No hay suficiente contenido para hacer scroll.');
        return;
    }

    // Toggle 'active' class on the button
    if (button.classList.contains('active')) {
        stopAutoScroll();
    } else {
        if (!teleprompter.hasAttribute('data-original-content')) {
            prepareTeleprompter();  // Solo prepara si no se ha preparado antes
        }
        startAutoScroll();
    }
}

function stopAutoScroll() {
    clearInterval(scrollInterval);
    isAutoScrolling = false;
    updateToggleButton(false);
    toggleControlsDisplay(true);
}

// function stopAutoScroll() {
//     clearInterval(scrollInterval);
//     const teleprompter = document.getElementById('teleprompter');
//     if (teleprompter) {
//         // Asegurar que existe el contenido original para restaurar
//         const originalContent = teleprompter.getAttribute('data-original-content');
//         if (originalContent) {
//             teleprompter.innerHTML = originalContent; // Restaurar el contenido
//             teleprompter.removeAttribute('data-original-content'); // Limpiar el atributo
//         } else {
//             console.log("No original content found to restore.");
//         }
        
//         // Reiniciar el scrollTop para visualizar desde el principio
//         teleprompter.scrollTop = 0;
//     }
//     isAutoScrolling = false;
//     updateToggleButton(false);
//     toggleControlsDisplay(true);
// }



function updateToggleButton(isActive) {
    const toggleButton = document.getElementById('toggleScroll');
    const icon = toggleButton.querySelector('i');
    toggleButton.classList.toggle('active', isActive);
    icon.className = isActive ? "fas fa-stop" : "fas fa-play";
    toggleButton.style.backgroundColor = isActive ? "#ff0000" : "#555555";
}

function startAutoScroll() {
    const teleprompter = document.getElementById('teleprompter');
    // const myBtn = document.getElementById("myBtn");
    const speedControl = document.getElementById('speedControl');
    const speed = 100 - speedControl.value;

    isAutoScrolling = true;
    updateToggleButton(true);
    toggleControlsDisplay(false);
    // prepareTeleprompter();

    if (teleprompter.scrollTop === 0) {  // Si el teleprompter está al inicio, reinicia el timer
        cronometro.reset();
        console.log("reset en el inicio");
        cronometro.start();
        console.log("start en inicio");
    } else {
        cronometro.start();  // Continúa el temporizador sin resetear
        console.log("continue");
    }

    scrollInterval = setInterval(() => {
        teleprompter.scrollBy(0, 1);
        /*if (teleprompter.scrollTop + teleprompter.clientHeight >= teleprompter.scrollHeight) {
            console.log('Reached end, stopping autoscroll.');
            stopAutoScroll();
            // myBtn.style.display = "block";
            toggleControlsDisplay(true);
        } */
    }, speed);
}

function toggleControlsDisplay(show) {
    const controls = document.querySelectorAll('.control');
    controls.forEach(control => {
        control.style.display = show ? 'block' : 'none';
    });
}

// function topFunction() {
//     let mybutton = document.getElementById("myBtn");
//     // teleprompter.scrollTop = 0;
//     document.documentElement.scrollTop = 0;
//     cronometro.stop();
//     cronometro.reset();
//     mybutton.style.display = 'none';
//     stopAutoScroll();  // Asegúrate de detener el auto-scroll si el botón se presiona

//     // restaura contenido original
//     const teleprompter = document.getElementById('teleprompter');
//     const originalContent = teleprompter.getAttribute('data-original-content');
//     if (originalContent) {
//         teleprompter.innerHTML = originalContent;
//         teleprompter.removeAttribute('data-original-content'); // Limpia el atributo una vez restaurado
//         teleprompter.scrollTop = 0; // Opcional, resetear el scroll
//     } else {
//         console.log("No original content found to restore.");
//     }
// }


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

/* document.getElementById('menuButton').addEventListener('click', function() {
    var menuItems = document.getElementById("menuItems");
    if (menuItems.style.display === "none") {
        menuItems.style.display = "block";
    } else {
        menuItems.style.display = "none";
    }
}); */


document.getElementById('menuButton').addEventListener('touchstart', function(event) {
    event.preventDefault();  // Previene eventos adicionales como click
    var menu = document.getElementById('menuItems');
    menu.style.display = menu.style.display === 'none' ? 'flex' : 'none'; // Asegura que el menú se muestra en columna
});

// Si quieres que también funcione con click, puedes agregar ambos eventos
document.getElementById('menuButton').addEventListener('click', function() {
    var menu = document.getElementById('menuItems');
    menu.style.display = menu.style.display === 'none' ? 'flex' : 'none'; // Asegura que el menú se muestra en columna
});

// Añadir este evento al window para cerrar el menú cuando se hace clic fuera
window.addEventListener('click', function(event) {
    var menu = document.getElementById('menuItems');
    if (!menu.contains(event.target) && event.target !== document.getElementById('menuButton')) {
        menu.style.display = 'none';
    }
});


// Opcional: Cerrar el menú si se hace clic fuera de él
/*window.onclick = function(event) {
    if (!event.target.matches('#menuButton')) {
        var dropdowns = document.getElementsByClassName("menu-items");
        for (var i = 0; i < dropdowns.length; i++) {
            var openDropdown = dropdowns[i];
            if (openDropdown.style.display === "block") {
                openDropdown.style.display = "none";
            }
        }
    }
}*/



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
//     e.preventDefault(); // Previene el comportamiento de pegado predeterminado.

//     // Accede al contenido HTML pegado desde el portapapeles.
//     var htmlContent = e.clipboardData.getData('text/html');

//     // Si no hay contenido HTML, intenta obtener el texto plano.
//     if (!htmlContent) {
//         htmlContent = e.clipboardData.getData('text/plain');
//         htmlContent = htmlContent.replace(/(?:\r\n|\r|\n)/g, '<br>'); // Reemplaza saltos de línea por <br>
//     }

//     // Crear un contenedor temporal para el contenido HTML.
//     var tempDiv = document.createElement('div');
//     tempDiv.innerHTML = htmlContent; // Inserta el texto como HTML.

//     // Elimina todos los estilos excepto los de color de texto y normaliza saltos de línea.
//     stripStylesExceptColor(tempDiv);
//     normalizeLineBreaks(tempDiv);

//     // Inserta el HTML filtrado en el contenido editable.
//     document.execCommand('insertHTML', false, tempDiv.innerHTML);
// });

// // Función para eliminar todos los estilos excepto el color del texto.
// function stripStylesExceptColor(element) {
//     if (element.style) {
//         const textColor = element.style.color;
//         element.removeAttribute('style');
//         if (textColor) element.style.color = textColor;
//     }
//     Array.from(element.children).forEach(stripStylesExceptColor);
// }

// // Función para normalizar los saltos de línea eliminando <div> y <p>, reemplazándolos por <br>
// function normalizeLineBreaks(element) {
//     var children = Array.from(element.childNodes);
//     for (var child of children) {
//         normalizeLineBreaks(child); // Primero normaliza recursivamente
//     }

//     if (element.nodeType === Node.ELEMENT_NODE && (element.tagName === 'DIV' || element.tagName === 'P')) {
//         var replacementHtml = element.innerHTML + '<br>'; // Prepara el contenido con un <br>
//         if (element.parentNode) {
//             element.outerHTML = replacementHtml; // Solo reemplaza si tiene un nodo padre
//         }
//     }
// }

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
    insertHTMLAtCaret(tempDiv.innerHTML);
});

function insertHTMLAtCaret(html) {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    let range = selection.getRangeAt(0);
    range.deleteContents();

    const el = document.createElement('div');
    el.innerHTML = html;
    let frag = document.createDocumentFragment(), node, lastNode;
    while ((node = el.firstChild)) {
        lastNode = frag.appendChild(node);
    }
    range.insertNode(frag);

    // Preserva la selección
    if (lastNode) {
        range = range.cloneRange();
        range.setStartAfter(lastNode);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
    }
}

function stripStylesExceptColor(element) {
    if (element.style) {
        const textColor = element.style.color;
        element.removeAttribute('style');
        if (textColor) element.style.color = textColor;
    }
    Array.from(element.children).forEach(stripStylesExceptColor);
}

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

    // // prevent contextual menu in app
    // document.addEventListener('contextmenu', function (event) {
    //     event.preventDefault();  // Prevenir la apertura del menú contextual
    // }, false);

    // Permitir el menú contextual solo en el área del teleprompter
    // teleprompter.addEventListener('contextmenu', function (event) {
    //     event.stopPropagation();  // Detiene la propagación del evento para evitar que el manejador global lo capture
    // }, false)
});

document.addEventListener('contextmenu', function(event) {
    let teleprompter = document.getElementById('teleprompter');
    if (teleprompter.getAttribute('contenteditable') === 'true') {
        // Permite el menú contextual solo si teleprompter es editable
        return true;
    } else {
        // Previene el menú contextual en otros elementos
        event.preventDefault();
        return false;
    }
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

// function prepareTeleprompter() {
//     const teleprompter = document.getElementById('teleprompter');
//     const content = teleprompter.innerHTML.trim();

//     // Asegurarse de que el contenido no comienza ni termina con múltiples <br>
//     if (!content.startsWith('<br><br><br><br>') || !content.endsWith('<br><br><br><br>')) {
//         const linesToAdd = 4;
//         const padding = '<br>'.repeat(linesToAdd);

//         // Añadir saltos de línea al principio y al final
//         teleprompter.innerHTML = padding + content + padding;
//     }
// }


//esta de abajo funciona relativamente bien

// function prepareTeleprompter() {
//     const teleprompter = document.getElementById('teleprompter');
//     const lineHeight = parseInt(window.getComputedStyle(teleprompter).lineHeight, 10);
//     const clientHeight = teleprompter.clientHeight;

//     // Calcular cuántos <br> se necesitan para llenar la pantalla
//     const linesNeeded = Math.ceil(clientHeight / lineHeight);
    
//     const paddingHTML = '<br>'.repeat(linesNeeded);

//     // Añadir padding al principio y al final
//     teleprompter.innerHTML = paddingHTML + teleprompter.innerHTML + paddingHTML;
// }


function prepareTeleprompter() {
    const teleprompter = document.getElementById('teleprompter');
    // Almacenar el contenido original para restaurarlo después
    const content = teleprompter.innerHTML.trim(); // Obtener el contenido actual

    // Guardar el contenido actual antes de modificarlo, si aún no se ha guardado
    if (!teleprompter.getAttribute('data-original-content')) {
        teleprompter.setAttribute('data-original-content', content);
    }

    const lineHeight = parseInt(window.getComputedStyle(teleprompter).lineHeight, 10);
    const clientHeight = teleprompter.clientHeight;
    const linesNeeded = Math.ceil(clientHeight / lineHeight);

    const paddingHTML = '<br>'.repeat(linesNeeded - 3);
    teleprompter.innerHTML = paddingHTML + teleprompter.innerHTML + paddingHTML;
    // Al final, añades el marcador del final
    // Suponiendo que ya tienes contenido en 'content', añades el marcador al final.
    teleprompter.innerHTML += '<div id="endMarker" style="font-size: 24px; font-weight: bold; text-align: center; padding: 20px; cursor: pointer;">TOCA AQUÍ PARA FINALIZAR</div>';

    // Añade el manejador de eventos
    const endMarker = document.getElementById("endMarker");
    endMarker.addEventListener('touchstart', handleEndMarkerTouch, { passive: true });
    endMarker.addEventListener('click', handleEndMarkerTouch); // Para dispositivos no táctiles
}



function handleEndMarkerTouch(event) {
    event.preventDefault(); // Evita que se produzcan comportamientos predeterminados indeseados en touch
    console.log("El endMarker ha sido tocado o clickeado.");
    // Aquí ejecutas lo que necesitas hacer al tocar el marcador
    activateSpecialFunction();
}

// function prepareTeleprompter() {
//     const teleprompter = document.getElementById('teleprompter');
//     const content = teleprompter.innerHTML.trim();
//     const containerHeight = teleprompter.clientHeight;

//     // Calcula cuántos <br> son necesarios para cubrir la altura del contenedor y la mitad
//     const brHeight = 24; // Estima la altura de un <br> (puede variar según el estilo)
//     const brsNeededStart = Math.ceil(containerHeight / brHeight);
//     const brsNeededEnd = Math.ceil(containerHeight / (2 * brHeight));

//     // Asegurarse de que el contenido no comienza ni termina con el número de <br> necesario
//     const regexPatternStart = new RegExp(`^(${'<br>'.repeat(brsNeededStart)})`);
//     const regexPatternEnd = new RegExp(`(${'<br>'.repeat(brsNeededEnd)})$`);

//     if (!regexPatternStart.test(content) || !regexPatternEnd.test(content)) {
//         // Añadir saltos de línea al principio y al final
//         const paddingStart = '<br>'.repeat(brsNeededStart);
//         const paddingEnd = '<br>'.repeat(brsNeededEnd);
//         teleprompter.innerHTML = paddingStart + content + paddingEnd;
//     }
// }


// Preparar teleprompter cuando se cargue la página o cuando sea necesario
// document.addEventListener('DOMContentLoaded', prepareTeleprompter);



// Instancia del cronómetro
const timerButton = document.getElementById('timer');
const countdownElement = document.getElementById('countdown');
const cronometro = new Cronometro(timerButton);

let countdownInterval;

timerButton.addEventListener('mousedown', startCountdown);
timerButton.addEventListener('mouseup', stopCountdown);
timerButton.addEventListener('mouseleave', stopCountdown); // Por si el cursor sale del botón sin soltar

// Para dispositivos táctiles
timerButton.addEventListener('touchstart', startCountdown);
timerButton.addEventListener('touchend', stopCountdown);

function startCountdown(event) {
    event.preventDefault(); // Evita comportamientos no deseados como seleccionar texto, etc.
    timerButton.classList.add('active');

    // if (!isAutoScrolling) {
    if (!isAutoScrolling && timerButton.textContent !== "00:00") {
        console.log(timerButton.textContent)
        let countdown = 3; // Debe definirse antes de usarla
        timerButton.style.backgroundColor = 'red'; // Suponiendo que `timerButton` está definido en algún lugar
        countdownElement.textContent = countdown;
        countdownElement.style.display = 'block'; // Asegura que el elemento sea visible

        countdownInterval = setInterval(function() {
            countdown--;
            countdownElement.textContent = countdown;
            if (countdown === 0) {
                stopCountdown();
                console.log("Timer reseteado!");
                if (cronometro) { // Asegura que el cronómetro esté definido
                    cronometro.stop();  // Detiene el cronómetro
                    cronometro.reset(); // Resetea el cronómetro
                }
            }
        }, 1000); // Actualiza el contador cada segundo
    }
}


function stopCountdown() {
    clearInterval(countdownInterval);
    countdownElement.style.display = 'none';
    timerButton.style.backgroundColor = 'black';
    timerButton.classList.remove('active');
}



// // Instancia del cronómetro
// const timerDisplay = document.getElementById("timer");
// const cronometro = new Cronometro(timerDisplay);

// // Desactivar el menú contextual
// timerDisplay.addEventListener('contextmenu', function(event) {
//     event.preventDefault(); // Previene la aparición del menú contextual
// });

// let timer;
// document.getElementById('timer').addEventListener('touchstart', function(e) {
//     if (!isAutoScrolling) { // Asegura que no esté auto desplazándose
//         this.style.backgroundColor = 'red';
//         timer = setTimeout(function() {
//             cronometro.stop();  // Detiene el cronómetro
//             cronometro.reset(); // Resetea el cronómetro
//             console.log('Timer stopped and reset to 00:00:00');
//         }, 3000);  // El usuario debe mantener presionado durante 3 segundos
//     }
// });

// document.getElementById('timer').addEventListener('touchend', function(e) {
//     this.style.backgroundColor = 'black';
//     clearTimeout(timer);  // Cancela el reset si el usuario suelta el botón antes de los 3 segundos
// });

// // Activar la clase 'active' cuando el temporizador es presionado
// timerDisplay.addEventListener('mousedown', function() {
//     this.classList.add('active');
// });

// // También manejar eventos táctiles
// timerDisplay.addEventListener('touchstart', function(e) {
//     this.classList.add('active');
//     e.preventDefault();
// });

// // Remover la clase 'active' cuando el mouse o el toque terminan
// timerDisplay.addEventListener('mouseup', function() {
//     this.classList.remove('active');
// });
// timerDisplay.addEventListener('mouseleave', function() {
//     this.classList.remove('active');
// });
// timerDisplay.addEventListener('touchend', function() {
//     this.classList.remove('active');
// });

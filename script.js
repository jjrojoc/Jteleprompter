///// REGISTRA PWA /////

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
    // Detener la animación de auto-scroll si está activa
    stopAutoScroll();

    // Obtener el elemento teleprompter
    const teleprompter = document.getElementById('teleprompter');

    // Restaurar el contenido original desde un atributo de datos
    const originalContent = teleprompter.getAttribute('data-original-content');
    if (originalContent) {
        // Restaurar el contenido original
        teleprompter.innerHTML = originalContent;

        // Resetear las transformaciones aplicadas para el desplazamiento automático
        teleprompter.style.transform = 'translateY(0px)';
        translateYValue = 0; // Restablece también la variable global usada para la transformación

        // Eliminar el atributo para evitar futuros errores si se resetea nuevamente
        teleprompter.removeAttribute('data-original-content');
        //console.log('Content restored:', originalContent);
    } else {
        console.error("No original content found to restore.");
    }

    // Aquí puedes añadir cualquier otra lógica necesaria para resetear tu aplicación
    // Por ejemplo, detener y resetear un cronómetro si lo estás usando
    if (cronometro) {
        cronometro.stop();
        cronometro.reset();
    }

    // Opcionalmente, restablecer cualquier otro UI o estado de la aplicación
    updateToggleButton(false);
    toggleControlsDisplay(true);
}



function getTeleprompter() {
    return document.getElementById('teleprompter');
}

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
            prepareTeleprompter();  // Solo prepara si no se ha preparado antes o si se requiere resetear
        }
        startAutoScroll();
        button.classList.add('active');
    }
}






function updateToggleButton(isActive) {
    const toggleButton = document.getElementById('toggleScroll');
    const icon = toggleButton.querySelector('i');
    toggleButton.classList.toggle('active', isActive);
    icon.className = isActive ? "fas fa-stop" : "fas fa-play";
    toggleButton.style.backgroundColor = isActive ? "#ff0000" : "#555555";
}




//let updateDurationInterval; // Guarda el ID del intervalo para poder detenerlo más tarde.

// function startAutoScroll() {
//     const teleprompter = document.getElementById('teleprompter');
//     const speedControl = document.getElementById('speedControl');
//     const speed = 100 - speedControl.value;
    
//     isAutoScrolling = true;
//     updateToggleButton(true);
//     toggleControlsDisplay(false);

//     if (teleprompter.scrollTop === 0) {
//         cronometro.reset();
//         cronometro.start();
//     } else {
//         cronometro.start();
//     }

//     scrollInterval = setInterval(() => {
//         teleprompter.scrollBy(0, 1);
//     }, speed);

//     // // Inicia la actualización de la duración estimada cada segundo
//     // if (!updateDurationInterval) {
//     //     updateDurationInterval = setInterval(estimateDuration, 1000);
//     // }
// }





// function stopAutoScroll() {
//     clearInterval(scrollInterval);
//     // clearInterval(updateDurationInterval); // Asegúrate de limpiar este intervalo también
//     // updateDurationInterval = null; // Restablece la variable
//     isAutoScrolling = false;
//     updateToggleButton(false);
//     toggleControlsDisplay(true);
// }


// let scrollAnimation;
// let pixelAccumulator = 0; // Acumulador para las fracciones de píxel

// function startAutoScroll() {
//     const teleprompter = document.getElementById('teleprompter');
//     const speedControl = document.getElementById('speedControl');
//     let speed = parseInt(speedControl.value);
//     adjustSpeed(speed);

//     isAutoScrolling = true;
//     updateToggleButton(true);
//     toggleControlsDisplay(false);

//     if (teleprompter.scrollTop === 0) {
//         cronometro.reset();
//         cronometro.start();
//     } else {
//         cronometro.start();
//     }

//     let lastTime;
//     let totalTranslation = 0; // Acumulador total de desplazamiento

//     function animateScroll(timestamp) {
//         if (!lastTime) lastTime = timestamp;
//         const deltaTime = timestamp - lastTime;
//         lastTime = timestamp;

//         const pixelsToScroll = (pixelsPerSecond * deltaTime) / 1000;
//         totalTranslation += pixelsToScroll;

//         teleprompter.style.transform = `translateY(-${totalTranslation}px)`;

//         if (teleprompter.offsetHeight + totalTranslation < teleprompter.parentNode.offsetHeight) {
//             requestAnimationFrame(animateScroll);
//         }
//     }


//     // let lastTime;
//     // function animateScroll(timestamp) {
//     //     if (!lastTime) {
//     //         lastTime = timestamp;
//     //         scrollAnimation = requestAnimationFrame(animateScroll);
//     //         return;
//     //     }
//     //     const deltaTime = timestamp - lastTime;
//     //     lastTime = timestamp;
//     //     // const minSpeed = 0.5; // Mínimo píxeles por segundo, puede ajustarse
//     //     // const maxSpeed = 100; // Máximo píxeles por segundo
//     //     // const speedRange = maxSpeed - minSpeed;
//     //     // const pixelsPerSecond = minSpeed + (speedRange * speed / 100);
        
//     //     const pixelsToScroll = (pixelsPerSecond * deltaTime) / 1000;

//     //     pixelAccumulator += pixelsToScroll;
//     //     if (pixelAccumulator > 1) {
//     //         teleprompter.scrollTop += (1, Math.floor(pixelAccumulator));
//     //         pixelAccumulator -= Math.floor(pixelAccumulator);
//     //     }

//     //     scrollAnimation = requestAnimationFrame(animateScroll);
//     // }

//     scrollAnimation = requestAnimationFrame(animateScroll);
// }

// function stopAutoScroll() {
//     cancelAnimationFrame(scrollAnimation);
//     scrollAnimation = null;
//     isAutoScrolling = false;
//     updateToggleButton(false);
//     toggleControlsDisplay(true);
//     pixelAccumulator = 0; // Restablecer el acumulador al detener
// }

let scrollAnimation;  // ID de la animación
let translateYValue = 0;
let pixelsPerSecond = 0;  // Define la velocidad inicial
let updateDurationInterval; // intervalo para estimada duracion

function adjustSpeed(speed) {
    const minSpeed = 0.5;
    const maxSpeed = 100;
    const speedRange = maxSpeed - minSpeed;
    pixelsPerSecond = minSpeed + (speedRange * speed / 100);  // Calcula los píxeles por segundo
    console.log('Speed adjusted to:', pixelsPerSecond, 'pixels per second');
}

function startAutoScroll() {
    const teleprompter = document.getElementById('teleprompter');
    const speedControl = document.getElementById('speedControl');
    adjustSpeed(parseInt(speedControl.value));

    if (!isAutoScrolling) {
        isAutoScrolling = true;
        updateToggleButton(true);
        toggleControlsDisplay(false);
        startEstimatedTimeCountdown();

        if (translateYValue === 0) {
            // Ajuste inicial para asegurar que todo el contenido sea visible
            teleprompter.style.height = `${teleprompter.scrollHeight}px`;
            // Coloca inicialmente el contenido justo por debajo de la pantalla
            translateYValue = window.innerHeight;
            teleprompter.style.transform = `translateY(${translateYValue}px)`;

            cronometro.reset();
            cronometro.start();
        }   else {
            cronometro.start();
        }

        let lastTime;
        function animateScroll(timestamp) {
            if (!lastTime) {
                lastTime = timestamp;
            }

            const deltaTime = timestamp - lastTime;
            lastTime = timestamp;

            translateYValue -= (pixelsPerSecond * deltaTime) / 1000;

            const endMarkerRect = document.getElementById("endMarker").getBoundingClientRect();

            // Detiene el desplazamiento si el marcador final ha pasado por completo la parte inferior de la pantalla
            if (endMarkerRect.bottom <= window.innerHeight -100) {
                stopAutoScroll();
            } else {
                teleprompter.style.transform = `translateY(${translateYValue}px)`;
                scrollAnimation = requestAnimationFrame(animateScroll);
            }
        }

        scrollAnimation = requestAnimationFrame(animateScroll);
    } else {
        console.log('Attempt to start auto-scroll but it is already running.');
    }
}

    



function stopAutoScroll() {
    cancelAnimationFrame(scrollAnimation);  // Detiene la animación en curso
    isAutoScrolling = false;  // Actualiza el estado de auto-scroll
    updateToggleButton(false);  // Actualiza el estado del botón de toggle
    toggleControlsDisplay(true);  // Vuelve a mostrar los controles si están ocultos
    stopEstimatedTimeCountdown();
    // No restablezcas el transform aquí, solo detén la animación.
    // La línea a continuación ha sido comentada o eliminada
    // document.getElementById('teleprompter').style.transform = 'translateY(0)';
}















// function estimateDuration() {
//     var teleprompter = document.getElementById('teleprompter');
//     var remainingHeight = teleprompter.scrollHeight - (teleprompter.clientHeight + teleprompter.scrollTop);
//     var speedControl = document.getElementById('speedControl');
//     var speedPerPixel = (100 - speedControl.value) * 1.5; // Ajusta este valor según la realidad del desplazamiento
//     var remainingTime = remainingHeight * speedPerPixel; // tiempo restante en milisegundos

    
//     var date = new Date(remainingTime);
//     var formattedTime = date.toISOString().substr(11, 8);
//     var timenohours = formattedTime.startsWith("00:") ? formattedTime.substr(3) : formattedTime;
//     document.getElementById("durationContainer").innerHTML = timenohours;
//     console.log('Estimated duration is:', timenohours);
//     console.log('Remaining height is:', remainingHeight);
// }



function toggleControlsDisplay(show) {
    const controls = document.querySelectorAll('.control');
    controls.forEach(control => {
        control.style.display = show ? 'block' : 'none';
    });
}



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

document.getElementById('textColorPicker').addEventListener('change', function() {
    var color = this.value;
    //document.getElementById('textSample').style.color = color;
    const selection = window.getSelection();

    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    const span = document.createElement('span');
    span.style.color = color;
    span.appendChild(range.extractContents());
    range.insertNode(span);
    selection.removeAllRanges();
    selection.addRange(range);
    selection.removeAllRanges();

    autoguardado();
});




const btnShowControlBar = document.getElementById('btnShowControlBar');
const btnShowMenuBar = document.getElementById('btnShowMenuBar');

const controlBar = document.getElementById('controlBar');
const menuBar = document.getElementById('menuBar');



function initializeEditable() {
    const teleprompter = document.getElementById('teleprompter');
    let undoStack = [];  // Almacena estados pasados del contenido
    let redoStack = [];  // Almacena estados para la función de rehacer

    teleprompter.addEventListener('input', () => {
        localStorage.setItem('savedScript', teleprompter.innerHTML);
        undoStack.push(teleprompter.innerHTML);
        redoStack = [];  // Limpia el redo stack cada vez que se hace un nuevo cambio
    });

    document.getElementById('undoButton').addEventListener('click', () => {
        if (undoStack.length > 1) {
            redoStack.push(undoStack.pop());  // Mueve el último estado al stack de rehacer
            teleprompter.innerHTML = undoStack[undoStack.length - 1];  // Restaura el último estado
        }
    });

    document.getElementById('redoButton').addEventListener('click', () => {
        if (redoStack.length > 0) {
            const redoState = redoStack.pop();  // Obtiene el último estado guardado para rehacer
            undoStack.push(redoState);  // Mueve el estado de rehacer de vuelta al undo stack
            teleprompter.innerHTML = redoState;  // Aplica el estado de rehacer
        }
    });
}



function showControlBar() {
    menuBar.style.display = 'none';
    controlBar.style.display = 'flex';
    teleprompter.contentEditable = "false";
}

function showMenuBar() {
    controlBar.style.display = 'none';
    menuBar.style.display = 'flex';
    teleprompter.contentEditable = "true";
    initializeEditable();  // Inicializa el editor con autoguardado y deshacer
    //deleteDefaultText();
}

document.getElementById('btnShowControlBar').addEventListener('click', showControlBar);
document.getElementById('btnShowMenuBar').addEventListener('click', showMenuBar);



document.getElementById('resetButton').addEventListener('click', function() {
    const teleprompter = document.getElementById('teleprompter');
    //const editButton = document.getElementById('editToggle');
    //const editIcon = editButton.querySelector('i'); // Asumiendo que el botón tiene un elemento <i> para el ícono

    if (confirm('¿Quieres resetear todo el texto?')) {
        // Verifica y ajusta el estado editable si es necesario
        if (teleprompter.contentEditable === "true") {
            teleprompter.contentEditable = "false"; // Asegúrate de que el teleprompter no esté editable
            //editIcon.className = 'fas fa-edit'; // Cambia el ícono a editar
        }

        // Restablece el contenido a un mensaje predeterminado
        let scriptText = '' // vacía texto, ahora usa placeholder
        teleprompter.innerHTML = scriptText; // Establece el nuevo contenido vacío HTML

        setPlaceholder(); // Establece el placeholder si es necesario
        
        localStorage.setItem('savedScript', scriptText); // Guarda en localStorage
        teleprompter.setAttribute("contentEditable", true);
        // alert('Teleprompter contenido ha sido reseteado.'); // Muestra mensaje de confirmación
    }
    showControlBar();
});




////// Original, este funciona bien /////
document.getElementById('teleprompter').addEventListener('paste', function(e) {
    e.preventDefault(); // Previene el comportamiento de pegado predeterminado

    var htmlContent = e.clipboardData.getData('text/html');
    var plainText = e.clipboardData.getData('text/plain');
    // console.log("HTML Original:", htmlContent);


    const selection = window.getSelection();
    if (!selection.rangeCount) return false;
    const range = selection.getRangeAt(0);
    range.deleteContents();

    if (htmlContent) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlContent;
        processHTML(tempDiv);
    
        // Inserta cada nodo en el orden en que aparece.
        Array.from(tempDiv.childNodes).forEach(node => {
            range.insertNode(node.cloneNode(true));
            range.collapse(false); // Mueve el rango al final del nodo insertado
        });
        
        
    } else if (plainText) {
        // Insertar texto plano respetando los saltos de línea
        const lines = plainText.split(/[\r\n]+/);
        lines.forEach((line, index) => {
            if (index > 0) {
                range.insertNode(document.createElement('br'));
            }
            range.insertNode(document.createTextNode(line));
            range.collapse(false); // Mueve el rango al final del nodo insertado
        });
    }

    // Colocar el cursor después del texto insertado
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);

    // Procesar cada elemento del HTML pegado para ajustar colores y eliminar estilos no deseados
    function processHTML(element) {

        // Eliminar elementos específicos como <sup class="superscription"> y <span class="parabreak">
        Array.from(element.querySelectorAll('sup.superscription, span.parabreak')).forEach(node => {
        const parent = node.parentNode;
        parent.removeChild(node); // Elimina completamente el nodo del DOM
        });

        Array.from(element.querySelectorAll('a')).forEach(node => {
            if (!/\d/.test(node.textContent)) {
                if (node.parentNode) {
                    node.parentNode.removeChild(node); // Elimina completamente el nodo <a> del DOM
                }
            }
            
            // const parent = node.parentNode;
            // while (node.firstChild) {
            //     parent.insertBefore(node.firstChild, node); // Mueve el contenido del enlace (texto) antes de eliminar el nodo
            // }
            // parent.removeChild(node); // Elimina el nodo del enlace
            
        });

        // Convertir &nbsp; a espacios normales y colapsar múltiples espacios a uno solo
        let htmlString = element.innerHTML.replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ');
        
        // Asignar de nuevo el HTML procesado
        element.innerHTML = htmlString;

        Array.from(element.querySelectorAll('*')).forEach(node => {

            node.innerHTML = node.innerHTML.replace(/&nbsp;/g, ' ');

            if (node.style) {

                // Si el color es blanco, eliminar el estilo completamente
                if (node.style.color === 'white' || node.style.color === 'rgb(255, 255, 255)') {
                    node.removeAttribute('style');
                } else if (node.style.color === 'black' || node.style.color === 'rgb(0, 0, 0)') {
                    node.removeAttribute('style'); // Cambia el negro a blanco
                } else if (node.style.color === 'rgb(41, 41, 41)') {
                    node.removeAttribute('style'); // Cambia el gris a por defecto, fix jw Biblia
                }
                // Eliminar estilos no necesarios
                node.style.fontSize = '';
                node.style.fontFamily = '';
                node.style.backgroundColor = '';
            }
            // Eliminar elementos que no contribuyen al texto visible
            if (node.tagName === 'SCRIPT' || node.tagName === 'META' || node.tagName === 'STYLE') {
                node.parentNode.removeChild(node);
            }
        });
    }
    autoguardado();
});



function autoguardado() {
    const contenido = document.getElementById('teleprompter').innerHTML;
    localStorage.setItem('savedScript', contenido);
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


// function adjustSpeed(speed) {
//     // Aquí puedes ajustar la velocidad del scroll en tu aplicación
//     console.log('Adjusting speed to:', speed);
//     // Asigna una lógica adecuada para ajustar la velocidad de scroll aquí.
//     // Esto podría implicar ajustar intervalos de tiempo, modificar CSS, etc.
//     if (isAutoScrolling) {
//         clearInterval(scrollInterval);
//         const speedscroll = 100 - speed;
//         scrollInterval = setInterval(() => {
//             teleprompter.scrollBy(0, 1);
//         }, speedscroll);
//     }
// }



function prepareTeleprompter() {

    const teleprompter = document.getElementById('teleprompter');
    
    if (!teleprompter.getAttribute('data-original-content')) {
        teleprompter.setAttribute('data-original-content', teleprompter.innerHTML);
    }
    // Restaurar contenido original si existe.
    const originalContent = teleprompter.getAttribute('data-original-content') || teleprompter.innerHTML; // Asegurar que siempre hay contenido.
    teleprompter.innerHTML = ''; // Limpiar contenido actual para recalcular padding correctamente.

    // Calcular espacio necesario en base al contenido original sin padding.
    teleprompter.innerHTML = originalContent; // Establecer contenido sin padding.
    const lineHeight = parseInt(window.getComputedStyle(teleprompter).lineHeight, 10);
    const clientHeight = teleprompter.clientHeight;
    const contentHeight = teleprompter.scrollHeight; // Altura del contenido sin padding.

    // let paddingLines = 0;
    // if (clientHeight > contentHeight) {
    //     paddingLines = Math.ceil((clientHeight - contentHeight) / 2 / lineHeight);
    // }

    // console.log('Padding lines:', paddingLines);
    // console.log('Content height:', contentHeight, 'Client height:', clientHeight);

    // const paddingHTML = '<br>'.repeat(paddingLines);
    // teleprompter.innerHTML = paddingHTML + originalContent + paddingHTML; // Reañadir padding calculado correctamente.

    // Añadir endMarker al final.
    teleprompter.innerHTML += '<br><br><br><div id="endMarker" style="font-size: 24px; font-weight: bold; text-align: center; padding: 20px; cursor: pointer;">TOCA AQUÍ PARA FINALIZAR</div>';

    // Añade el manejador de eventos
    const endMarker = document.getElementById("endMarker");
    endMarker.addEventListener('touchstart', handleEndMarkerTouch, { passive: true });
    endMarker.addEventListener('click', handleEndMarkerTouch); // Para dispositivos no táctiles
    // estimateDuration();
}













function handleEndMarkerTouch(event) {
    //event.preventDefault(); // Evita que se produzcan comportamientos predeterminados indeseados en touch
    console.log("El endMarker ha sido tocado o clickeado.");
    // Aquí ejecutas lo que necesitas hacer al tocar el marcador
    activateSpecialFunction();
}



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



function setPlaceholder() {
    if (teleprompter.textContent.trim() === '') {
        teleprompter.textContent = teleprompter.getAttribute('data-placeholder');
        teleprompter.classList.add('placeholder'); // Añade una clase para controlar el estilo del placeholder si es necesario.
    }
}


function removePlaceholder() {
    if (teleprompter.textContent === teleprompter.getAttribute('data-placeholder')) {
        teleprompter.textContent = '';
        teleprompter.classList.remove('placeholder'); // Remueve la clase cuando el usuario empiece a escribir.
    }
}


teleprompter.addEventListener('focus', function() {
    removePlaceholder();
});


teleprompter.addEventListener('blur', function() {
    setPlaceholder();
});

// Inicializa el placeholder correctamente al cargar
document.addEventListener('DOMContentLoaded', setPlaceholder);


function getSpeedControl() {
    return document.getElementById('speedControl');
}



// teleprompter.addEventListener('touchstart', function(event) {
//     isTouching = true;
//     startY = event.touches[0].clientY; // Almacena la posición inicial de Y
//     event.preventDefault(); // Previene otros eventos como scroll del navegador
// }, { passive: false });

// teleprompter.addEventListener('touchmove', function(event) {
//     if (!isTouching) return;
//     let touchY = event.touches[0].clientY;
//     let deltaY = touchY - startY; // Calcula la diferencia desde el último punto
//     translateYValue += deltaY; // Actualiza el valor de translateY
//     teleprompter.style.transform = `translateY(-${translateYValue}px)`;
//     startY = touchY; // Actualiza startY para el próximo movimiento
//     event.preventDefault();
// }, { passive: false });

// teleprompter.addEventListener('touchend', function(event) {
//     isTouching = false;
// });


teleprompter.addEventListener('touchstart', function(event) {
    // if (!isAutoScrolling) return;  // Solo actuar si el auto-scroll está activo
    // cancelAnimationFrame(scrollAnimation); // Pausar el auto-scrolling
    isTouching = true;
    startY = event.touches[0].clientY; // Almacena la posición inicial de Y
    event.preventDefault(); // Previene el scroll del navegador
}, { passive: false });

teleprompter.addEventListener('touchmove', function(event) {
    if (!isTouching) return;
    let touchY = event.touches[0].clientY;
    let deltaY = touchY - startY; // Calcula la diferencia desde el último punto

    translateYValue += deltaY; // Actualiza el valor de translateY
    teleprompter.style.transform = `translateY(-${translateYValue}px)`;
    startY = touchY; // Actualiza startY para el próximo movimiento
    event.preventDefault();
}, { passive: false });

teleprompter.addEventListener('touchend', function(event) {
    isTouching = false;
});



let countdownEstimateDuration;

function startEstimatedTimeCountdown() {
    const scrollHeight = teleprompter.scrollHeight;
    const clientHeight = teleprompter.clientHeight;
    const remainingDistance = scrollHeight - clientHeight - translateYValue;
    let estimatedTimeSeconds = remainingDistance / pixelsPerSecond;

    countdownEstimateDuration = setInterval(() => {
        if (estimatedTimeSeconds <= 0) {
            clearInterval(countdownEstimateDuration);
            displayTime(0); // Mostrar 00:00 o similar cuando el conteo termine
        } else {
            displayTime(estimatedTimeSeconds);
            estimatedTimeSeconds -= 1; // Decrementa el contador cada segundo
        }
    }, 1000);
}

function displayTime(seconds) {
    const durationContainer = document.getElementById('durationContainer');
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    let timeString = '';

    if (hours > 0) {
        timeString += `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    } else {
        timeString += `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    durationContainer.textContent = timeString;
}

function stopEstimatedTimeCountdown() {
    clearInterval(countdownEstimateDuration);
}

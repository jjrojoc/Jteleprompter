if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
      navigator.serviceWorker.register('./service-worker.js')
        .then(function(registration) {
          console.log('ServiceWorker registration successful with scope: ', registration.scope);
        }, function(err) {
          console.log('ServiceWorker registration failed: ', err);
        });
    });
  }
  

let isAutoScrolling = false;
let scrollInterval;
let lastScrollTop = 0;

const teleprompter = document.getElementById('teleprompter');
const speedControl = document.getElementById('speedControl');
// Existing variables and toggleAutoScroll function remain the same

const textSizeControl = document.getElementById('textSizeControl');
const textColorControl = document.getElementById('textColorControl');

document.getElementById('toggleScroll').addEventListener('click', toggleAutoScroll);


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
    
    // Comprueba la clase actual del ícono para determinar el estado del botón
    if (icon.classList.contains("fa-play")) {
        icon.className = "fas fa-stop"; // Cambia el ícono a "stop"
        document.getElementById('toggleScroll').style.backgroundColor = "#ff0000"
        // Iniciar el autoscroll aquí
        const speed = 100 - speedControl.value;
        scrollInterval = setInterval(() => {
                         teleprompter.scrollBy(0, 1);
            // Update lastScrollTop to new position
             lastScrollTop = teleprompter.scrollTop;
        }, speed);
    } else {
        icon.className = "fas fa-play"; // Cambia el ícono a "play"
        document.getElementById('toggleScroll').style.backgroundColor = "#007BFF"
        // Detener el autoscroll aquí
        clearInterval(scrollInterval);
        
    }
};


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


document.getElementById('editToggle').addEventListener('click', function() {
    const teleprompter = document.getElementById('teleprompter');
    const isEditable = teleprompter.contentEditable === "true";
    teleprompter.contentEditable = !isEditable;  // Toggle the state
    this.textContent = isEditable ? 'Editar' : 'Parar Editar';  // Update button text
    if (isEditable){
    const scriptText = document.getElementById('teleprompter').innerHTML;
    localStorage.setItem('savedScript', scriptText);
    alert('Text edited saved!');
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

// CLASE 1: Representa una tarea individual
class Tarea {
    constructor(nombre) {
        this.id = Date.now(); 
        this.nombre = nombre;
        this.completa = false;
    }

    toggleCompletar() {
        this.completa = !this.completa;
    }
}

// CLASE 2: Administra toda la lista de tareas
class GestorDeTareas {
    constructor() {
        const tareasGuardadas = localStorage.getItem('misTareas');
        this.tareas = tareasGuardadas ? JSON.parse(tareasGuardadas) : [];
        this.render();
    }

    agregarTarea(nombre) {
        if (nombre.trim() === '') {
            alert("Por favor escribe una tarea.");
            return;
        }

        const nuevaTarea = new Tarea(nombre);
        this.tareas.push(nuevaTarea);
        this.guardarYActualizar();
    }

    eliminarTarea(id) {
        this.tareas = this.tareas.filter(tarea => tarea.id !== id);
        this.guardarYActualizar();
    }

    editarTarea(id) {
        const tarea = this.tareas.find(t => t.id === id);
        if (tarea) {
            const nuevoNombre = prompt("Edita tu tarea:", tarea.nombre);

            if (nuevoNombre && nuevoNombre.trim() !== '') {
                tarea.nombre = nuevoNombre; 
                this.guardarYActualizar(); 
            }
        }
    }

    toggleTarea(id) {
        const tarea = this.tareas.find(t => t.id === id);
        if (tarea) {
            tarea.completa = !tarea.completa; 
            this.guardarYActualizar();
        }
    }

    // Método auxiliar para guardar en LocalStorage y refrescar la pantalla
    guardarYActualizar() {
        localStorage.setItem('misTareas', JSON.stringify(this.tareas));
        this.render();
    }

    // Método render: Genera el HTML dinámicamente
    render() {
        const listaUI = document.getElementById('lista-tareas');
        listaUI.innerHTML = ''; // Limpiamos la lista actual

        this.tareas.forEach(tarea => {
            const li = document.createElement('li');
            li.className = `tarea-item ${tarea.completa ? 'completada' : ''}`;
            li.innerHTML = `
                <span onclick="gestor.toggleTarea(${tarea.id})" style="cursor:pointer;">
                    ${tarea.nombre}
                </span>
                <div class="acciones">
                    <button class="btn-accion btn-editar" onclick="gestor.editarTarea(${tarea.id})">Editar</button>
                    <button class="btn-accion btn-eliminar" onclick="gestor.eliminarTarea(${tarea.id})">Eliminar</button>
                </div>
            `;
            
            listaUI.appendChild(li);
        });
    }
}

// INICIALIZACIÓN 

const gestor = new GestorDeTareas();
document.getElementById('agregar-tarea').addEventListener('click', () => {
    const input = document.getElementById('nueva-tarea');
    gestor.agregarTarea(input.value);
    input.value = ''; 
});

document.getElementById('nueva-tarea').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const input = document.getElementById('nueva-tarea');
        gestor.agregarTarea(input.value);
        input.value = '';
    }
});
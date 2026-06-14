// CLASE 1: Representa una tarea 
class Tarea {
    constructor(nombre) {
        this.nombre = nombre;
        // Tu backend espera una descripción obligatoria, le pasamos una por defecto
        this.descripcion = "Descripción pendiente";
        this.completa = false;
    }
}

// CLASE 2: Administrador conectado al Backend
class GestorDeTareas {
    constructor() {
        this.tareas = [];
        this.apiUrl = 'http://localhost:3000'; // La dirección de la cocina
        this.token = null; // Aquí guardaremos el "Pase VIP" (JWT)

        // Al iniciar la app, primero obtenemos el pase VIP
        this.iniciarSesion();
    }

    // LOGIN (OBTENER EL PASE VIP) 
    async iniciarSesion() {
        try {
            const respuesta = await fetch(`${this.apiUrl}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                //body: JSON.stringify({ username: 'SantiagoDev', password: '123' })
                body: JSON.stringify({ username: 'Admin', password: '123' })
            });

            if (respuesta.ok) {
                const datos = await respuesta.json();
                this.token = datos.token; // ¡Guardamos el pase VIP!
                this.obtenerTareasDelServidor(); // Ya podemos pedir las tareas
            } else {
                console.error("Error al iniciar sesión. Revisa tu contraseña.");
            }
        } catch (error) {
            console.error("No hay conexión con el servidor:", error);
        }
    }

    // --- 2. LEER TAREAS (MÉTODO GET) ---
    async obtenerTareasDelServidor() {
        // Hacemos una petición GET (por defecto) enviando nuestro token de seguridad
        const respuesta = await fetch(`${this.apiUrl}/tareas`, {
            headers: { 'Authorization': `Bearer ${this.token}` }
        });
        const tareas = await respuesta.json();
        this.tareas = tareas;
        this.render(); // Dibujamos las tareas en la pantalla
    }

    // --- 3. CREAR TAREA (MÉTODO POST) ---
    async agregarTarea(nombre) {
        if (nombre.trim() === '') return alert("Por favor escribe una tarea.");

        const nuevaTarea = new Tarea(nombre);

        // El mesero lleva la nueva tarea a la base de datos
        await fetch(`${this.apiUrl}/tareas`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.token}`
            },
            body: JSON.stringify(nuevaTarea)
        });

        this.obtenerTareasDelServidor(); // Pedimos la lista actualizada
    }

    // --- 4. ELIMINAR TAREA (MÉTODO DELETE) ---
    async eliminarTarea(id) {
        await fetch(`${this.apiUrl}/tareas/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${this.token}` }
        });
        this.obtenerTareasDelServidor();
    }

    // --- 5. EDITAR TAREA (MÉTODO PUT) ---
    async editarTarea(id) {
        const tarea = this.tareas.find(t => t.id === id);
        if (!tarea) return;

        const nuevoNombre = prompt("Edita tu tarea:", tarea.nombre);
        if (nuevoNombre && nuevoNombre.trim() !== '') {
            tarea.nombre = nuevoNombre;

            await fetch(`${this.apiUrl}/tareas/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify(tarea)
            });
            this.obtenerTareasDelServidor();
        }
    }

    // --- 6. COMPLETAR TAREA (MÉTODO PUT) ---
    async toggleTarea(id) {
        const tarea = this.tareas.find(t => t.id === id);
        if (!tarea) return;

        tarea.completa = !tarea.completa;

        await fetch(`${this.apiUrl}/tareas/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.token}`
            },
            body: JSON.stringify(tarea)
        });
        this.obtenerTareasDelServidor();
    }

    // Renderizado HTML
    render() {
        const listaUI = document.getElementById('lista-tareas');
        listaUI.innerHTML = '';

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

// INICIALIZACIÓN DE EVENTOS
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
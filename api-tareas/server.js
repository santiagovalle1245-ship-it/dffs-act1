const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 3000;
const SECRET_KEY = 'secreto_super_seguro_de_ufotable';

const archivoTareas = path.join(__dirname, 'tareas.json');
const archivoUsuarios = path.join(__dirname, 'usuarios.json');

app.use(express.json());

// --- FUNCIONES AYUDANTES ---

async function leerArchivo(ruta) {
    try {
        const data = await fs.readFile(ruta, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

async function guardarArchivo(ruta, datos) {
    await fs.writeFile(ruta, JSON.stringify(datos, null, 2));
}

// --- EL PORTERO (MIDDLEWARE) 🛡️ ---
// Esta función se ejecutará ANTES de dejar pasar a las rutas protegidas
const verificarToken = (req, res, next) => {
    // 1. Buscamos el token en la cabecera 'Authorization'
    const cabeceraAuth = req.headers['authorization'];
    
    // El token suele venir como "Bearer eyJhbG..." así que quitamos "Bearer " si está
    const token = cabeceraAuth && cabeceraAuth.split(' ')[1];

    if (!token) {
        return res.status(401).send('🛑 Acceso denegado: No tienes un token');
    }

    // 2. Verificamos si el token es válido y no ha expirado
    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
            return res.status(403).send('🚫 Token inválido o expirado');
        }
        // Si todo está bien, guardamos los datos del usuario en la petición y dejamos pasar
        req.user = user;
        next(); // ¡Pase usted!
    });
};

// --- RUTAS PÚBLICAS (Cualquiera puede entrar) ---

app.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) return res.status(400).send('Falta datos');
        
        const usuarios = await leerArchivo(archivoUsuarios);
        if (usuarios.find(u => u.username === username)) return res.status(400).send('El usuario ya existe');

        const passwordEncriptada = await bcrypt.hash(password, 10);
        usuarios.push({ username, password: passwordEncriptada });
        
        await guardarArchivo(archivoUsuarios, usuarios);
        res.status(201).send('Usuario registrado exitosamente');
    } catch (error) {
        res.status(500).send('Error al registrar');
    }
});

app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const usuarios = await leerArchivo(archivoUsuarios);
        const usuarioEncontrado = usuarios.find(u => u.username === username);
        
        if (!usuarioEncontrado || !(await bcrypt.compare(password, usuarioEncontrado.password))) {
            return res.status(401).send('Usuario o contraseña incorrectos');
        }

        const token = jwt.sign({ username: usuarioEncontrado.username }, SECRET_KEY, { expiresIn: '1h' });
        res.json({ token });
    } catch (error) {
        res.status(500).send('Error al iniciar sesión');
    }
});

// --- RUTAS PROTEGIDAS (Solo con Token) 🔒 ---
// Nota cómo agregamos 'verificarToken' antes de la función de la ruta

app.get('/tareas', verificarToken, async (req, res) => {
    const tareas = await leerArchivo(archivoTareas);
    res.json(tareas);
});

app.post('/tareas', verificarToken, async (req, res) => {
    const { nombre, descripcion } = req.body;
    const tareas = await leerArchivo(archivoTareas);
    const nuevaTarea = { id: Date.now(), nombre, descripcion, completa: false, creador: req.user.username };
    tareas.push(nuevaTarea);
    await guardarArchivo(archivoTareas, tareas);
    res.status(201).json(nuevaTarea);
});

app.put('/tareas/:id', verificarToken, async (req, res) => {
    const id = parseInt(req.params.id);
    const { nombre, descripcion, completa } = req.body;
    let tareas = await leerArchivo(archivoTareas);
    const indice = tareas.findIndex(t => t.id === id);

    if (indice !== -1) {
        tareas[indice] = { ...tareas[indice], nombre, descripcion, completa };
        await guardarArchivo(archivoTareas, tareas);
        res.json(tareas[indice]);
    } else {
        res.status(404).send('Tarea no encontrada');
    }
});

app.delete('/tareas/:id', verificarToken, async (req, res) => {
    const id = parseInt(req.params.id);
    let tareas = await leerArchivo(archivoTareas);
    const tareasFiltradas = tareas.filter(t => t.id !== id);
    if (tareas.length !== tareasFiltradas.length) {
        await guardarArchivo(archivoTareas, tareasFiltradas);
        res.send('Tarea eliminada');
    } else {
        res.status(404).send('Tarea no encontrada');
    }
});

// --- MANEJO DE ERRORES GLOBAL ---
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('¡Algo salió mal en el servidor!');
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
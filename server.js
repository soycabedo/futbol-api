const express = require('express');
const axios = require('axios');
const app = express();
const PORT = 3000;
const API_KEY = '46249bc5c0mshba32cb2d8ef854ap170a42jsn5303c31afe5d'; // Reemplaza con tu clave de API

// Configura EJS como motor de plantillas
app.set('view engine', 'ejs');
app.use(express.static('public'));

// Ruta para la página principal
app.get('/', async (req, res) => {
  try {
    const response = await axios.get('https://api-football-v1.p.rapidapi.com/v3/leagues', {
      headers: {
        'X-RapidAPI-Key': API_KEY,
        'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com'
      }
    });
    const leagues = response.data.response;
    res.render('index', { leagues });
  } catch (error) {
    console.error('Error al obtener los datos:', error.message);
    res.send('Error al obtener los datos.');
  }
});

// Ruta para mostrar equipos de una liga específica
app.get('/league/:id/teams', async (req, res) => {
  const leagueId = req.params.id;
  try {
    const response = await axios.get(`https://api-football-v1.p.rapidapi.com/v3/teams?league=${leagueId}&season=2023`, {
      headers: {
        'X-RapidAPI-Key': API_KEY,
        'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com'
      }
    });
    const teams = response.data.response;
    res.render('teams', { teams });
  } catch (error) {
    console.error('Error al obtener los equipos:', error.message);
    res.send('Error al obtener los equipos.');
  }
});


// Inicia el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});


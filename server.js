const express = require('express');
const axios = require('axios');
const app = express();
const PORT = 3000;
const API_KEY = '46249bc5c0mshba32cb2d8ef854ap170a42jsn5303c31afe5d';

// Definimos las ligas que queremos mostrar, con sus respectivos IDs
const leagues = [
  { id: 140, name: 'La Liga' },        // España
  { id: 39, name: 'Premier League' },  // Inglaterra
  { id: 135, name: 'Serie A' },        // Italia
  { id: 61, name: 'Ligue 1' },         // Francia
  { id: 78, name: 'Bundesliga' }       // Alemania
];

// Función para obtener estadísticas de un equipo
async function getTeamStatistics(teamId, leagueId) {
  const options = {
    method: 'GET',
    url: `https://v3.football.api-sports.io/teams/statistics`,
    params: { league: leagueId, season: 2023, team: teamId },
    headers: {
      'X-RapidAPI-Key': API_KEY,
      'X-RapidAPI-Host': 'v3.football.api-sports.io'
    }
  };

  const response = await axios.request(options);
  return response.data.response;
}

// Función para sumar las tarjetas por intervalos
function sumCardsByInterval(cards) {
  return Object.values(cards).reduce((total, interval) => {
    return total + (interval.total || 0);
  }, 0);
}

// Endpoint para obtener tarjetas de un equipo específico en la temporada 2023
app.get('/team/:id/cards', async (req, res) => {
  const teamId = req.params.id;
  const leagueId = req.query.league;
  
  try {
    const data = await getTeamStatistics(teamId, leagueId);

    const yellowCardsTotal = sumCardsByInterval(data.cards.yellow);
    const redCardsTotal = sumCardsByInterval(data.cards.red);

    data.totalYellowCards = yellowCardsTotal;
    data.totalRedCards = redCardsTotal;

    res.json(data);  // Devolver los datos modificados al cliente
  } catch (error) {
    res.status(500).send('Error al obtener las tarjetas del equipo');
  }
});

// Endpoint para el análisis de partidos
app.get('/team/:id/match-analysis', async (req, res) => {
  const teamId = req.params.id;
  const leagueId = req.query.league;
  
  try {
    const stats = await getTeamStatistics(teamId, leagueId);

    const matchData = {
      home: stats.fixtures.wins.home + stats.fixtures.draws.home + stats.fixtures.loses.home,
      away: stats.fixtures.wins.away + stats.fixtures.draws.away + stats.fixtures.loses.away,
      winsHome: stats.fixtures.wins.home,
      winsAway: stats.fixtures.wins.away,
      drawsHome: stats.fixtures.draws.home,
      drawsAway: stats.fixtures.draws.away,
      losesHome: stats.fixtures.loses.home,
      losesAway: stats.fixtures.loses.away,
    };

    res.render('match-analysis', { matchData, teamId });
  } catch (error) {
    res.status(500).send('Error al obtener el análisis de partidos');
  }
});

// Configuramos EJS como el motor de plantillas
app.set('view engine', 'ejs');
app.use(express.static('public')); // Configuramos la carpeta 'public' para archivos estáticos como CSS y JS

// Ruta principal para mostrar las ligas disponibles
app.get('/', (req, res) => {
  res.render('index', { leagues });
});

// Ruta para mostrar los equipos de una liga seleccionada
app.get('/league/:id/teams', async (req, res) => {
  const leagueId = req.params.id;
  try {
    const response = await axios.get(`https://api-football-v1.p.rapidapi.com/v3/teams`, {
      params: { league: leagueId, season: '2023' },
      headers: {
        'X-RapidAPI-Key': API_KEY,
        'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com'
      }
    });
    const teams = response.data.response; // Obtenemos la lista de equipos de la respuesta
    res.render('teams', { teams, leagueId }); // Renderizamos la vista 'teams.ejs' con los datos de los equipos
  } catch (error) {
    console.error('Error al obtener los equipos:', error.message); // Mostramos el error en la consola si ocurre
    res.send('Error al obtener los equipos.'); // Enviamos un mensaje de error al usuario
  }
});

// Ruta para mostrar las estadísticas de un equipo seleccionado
app.get('/team/:id/stats', async (req, res) => {
  const teamId = req.params.id;
  const leagueId = req.query.league;
  try {
    const stats = await getTeamStatistics(teamId, leagueId);

    if (stats.cards) {
      const yellowCardsTotal = sumCardsByInterval(stats.cards.yellow);
      const redCardsTotal = sumCardsByInterval(stats.cards.red);
    
      stats.totalYellowCards = yellowCardsTotal;
      stats.totalRedCards = redCardsTotal;
    } else {
      stats.totalYellowCards = 'N/A';
      stats.totalRedCards = 'N/A';
    }

    console.log('Estadísticas del equipo:', stats);
    console.log('Tarjetas amarillas:', JSON.stringify(stats.cards.yellow, null, 2));
    console.log('Tarjetas rojas:', JSON.stringify(stats.cards.red, null, 2));

    res.render('team-stats', { stats }); // Renderizamos la vista 'team-stats.ejs' con las estadísticas del equipo
  } catch (error) {
    console.error('Error al obtener las estadísticas del equipo:', error.message); // Mostramos el error en la consola si ocurre
    res.send('Error al obtener las estadísticas del equipo.'); // Enviamos un mensaje de error al usuario
  }
});

// Iniciamos el servidor en el puerto especificado
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});




const express = require('express');
const axios = require('axios');
const app = express();
const PORT = 3000;
const API_KEY = '46249bc5c0mshba32cb2d8ef854ap170a42jsn5303c31afe5d'; // Reemplaza con tu clave de API

// Configurar el motor de plantillas (si estás usando EJS)
app.set('view engine', 'ejs');

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Ruta de prueba
app.get('/test', (req, res) => {
  res.sendFile(path.join(__dirname, 'test', 'TestZone.html'));
});

// Ruta principal
app.get('/', (req, res) => {
  res.send('Fútbol API');
});

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});



// Definimos las ligas que queremos mostrar, con sus respectivos IDs
const leagues = [
  { id: 140, name: 'La Liga' },        // España
  { id: 39, name: 'Premier League' },  // Inglaterra
  { id: 135, name: 'Serie A' },        // Italia
  { id: 61, name: 'Ligue 1' },         // Francia
  { id: 78, name: 'Bundesliga' }       // Alemania
];

// Función para sumar las tarjetas por intervalos
function sumCardsByInterval(cards) {
  // Sumamos las tarjetas en todos los intervalos, ignorando aquellos con valores null
  return Object.values(cards).reduce((total, interval) => {
    return total + (interval.total || 0);
  }, 0);
}

// Endpoint para obtener tarjetas de un equipo específico en la temporada 2023
app.get('/team/:id/cards', async (req, res) => {
  const teamId = req.params.id;
  const leagueId = req.query.league;  // Suponiendo que se pase el ID de la liga como parámetro de consulta
  
  try {
    const options = {
      method: 'GET',
      url: `https://v3.football.api-sports.io/teams/statistics`,
      params: { league: leagueId, season: 2023, team: teamId },  // Ahora especificamos equipo y liga
      headers: {
        'X-RapidAPI-Key': API_KEY,
        'X-RapidAPI-Host': 'v3.football.api-sports.io'
      }
    };
    
    const response = await axios.request(options);
    const data = response.data.response;

    // Sumar tarjetas amarillas y rojas del equipo
    const yellowCardsTotal = sumCardsByInterval(data.cards.yellow);
    const redCardsTotal = sumCardsByInterval(data.cards.red);

    // Añadir los totales al objeto de datos
    data.totalYellowCards = yellowCardsTotal;
    data.totalRedCards = redCardsTotal;

    res.json(data);  // Devolver los datos modificados al cliente
  } catch (error) {
    res.status(500).send('Error al obtener las tarjetas del equipo');
  }
});

// Función para obtener y sumar los corners de una liga
async function getTotalCorners(leagueId) {
  let totalCorners = 0;

  try {
    // Solicitud para obtener todos los fixtures de la liga y temporada especificada
    const fixturesResponse = await axios.get(`https://api-football-v1.p.rapidapi.com/v3/fixtures`, {
      params: { league: leagueId, season: '2023' },
      headers: {
        'X-RapidAPI-Key': API_KEY,
        'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com'
      }
    });

    const fixtures = fixturesResponse.data.response;

    // Iterar sobre cada fixture para obtener las estadísticas de corners
    for (let fixture of fixtures) {
      const fixtureId = fixture.fixture.id;
      const statsResponse = await axios.get(`https://api-football-v1.p.rapidapi.com/v3/fixtures/statistics`, {
        params: { fixture: fixtureId },
        headers: {
          'X-RapidAPI-Key': API_KEY,
          'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com'
        }
      });

      const stats = statsResponse.data.response;

      if (stats.length > 0) {
        const homeCorners = stats[0].statistics.find(stat => stat.type === "Corners")?.value || 0;
        const awayCorners = stats[1].statistics.find(stat => stat.type === "Corners")?.value || 0;
        totalCorners += homeCorners + awayCorners;
      }
    }
  } catch (error) {
    console.error('Error al obtener los corners:', error.message);
  }

  return totalCorners;
}

// Endpoint para obtener el total de corners en la temporada 2023-2024 de las 5 grandes ligas
app.get('/total-corners', async (req, res) => {
  let totalCornersSum = 0;

  for (let league of leagues) {
    totalCornersSum += await getTotalCorners(league.id);
  }

  res.json({
    season: '2023-2024',
    totalCorners: totalCornersSum
  });
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
    // Solicitud a la API para obtener los equipos de la liga seleccionada
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
    // Solicitud a la API para obtener las estadísticas del equipo seleccionado
    const response = await axios.get(`https://api-football-v1.p.rapidapi.com/v3/teams/statistics`, {
      params: { league: leagueId, season: '2023', team: teamId },
      headers: {
        'X-RapidAPI-Key': API_KEY,
        'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com'
      }
    });
    const stats = response.data.response; // Obtenemos las estadísticas del equipo de la respuesta

    // Verificamos si stats.cards existe para evitar errores
    if (stats.cards) {
      const yellowCardsTotal = sumCardsByInterval(stats.cards.yellow);
      const redCardsTotal = sumCardsByInterval(stats.cards.red);
    
     // Agregar estos valores al objeto stats
    stats.totalYellowCards = yellowCardsTotal;
    stats.totalRedCards = redCardsTotal;} 
    else {
      stats.totalYellowCards = 'N/A';
      stats.totalRedCards = 'N/A';
    }

     // Ahora aseguramos que los logos y banderas también se pasen a la vista
     const teamData = {
      name: stats.team.name,
      logo: stats.team.logo
    };

    const leagueData = {
      name: stats.league.name,
      flag: stats.league.flag,
      season: stats.league.season
    };

    // Pasar los datos a la vista
    res.render('team-stats', { 
      stats, 
      team: teamData, 
      league: leagueData 
    });

    // Verificamos los datos en la consola
    console.log('Estadísticas del equipo:', stats);
    console.log('Tarjetas amarillas:', JSON.stringify(stats.cards.yellow, null, 2));
    console.log('Tarjetas rojas:', JSON.stringify(stats.cards.red, null, 2));

    res.render('team-stats', { stats }); // Renderizamos la vista 'team-stats.ejs' con las estadísticas del equipo
  } catch (error) {
    console.error('Error al obtener las estadísticas del equipo:', error.message); // Mostramos el error en la consola si ocurre
    res.send('Error al obtener las estadísticas del equipo.'); // Enviamos un mensaje de error al usuario
  }
});

// Ruta para mostrar el análisis de partidos
app.get('/match-analysis', (req, res) => {
  res.render('match-analysis');
});

app.get('/match-analysis/data', async (req, res) => {
  try {
    const teamId = req.query.teamId; // Asegúrate de pasar el teamId desde el front-end
    const response = await axios.get(`https://api-football-v1.p.rapidapi.com/v3/fixtures`, {
      headers: { 'x-rapidapi-key': API_KEY },
      params: { team: teamId }
    });
    
    const matches = response.data.response;
    const categorizedMatches = {
      ganados: matches.filter(m => m.winner === teamId),
      perdidos: matches.filter(m => m.winner !== null && m.winner !== teamId),
      empatados: matches.filter(m => m.winner === null)
    };
    res.json(categorizedMatches);
  } catch (error) {
    res.status(500).send('Error al obtener los partidos');
  }
});

app.get('/match-timeline/:matchId', async (req, res) => {
  try {
    const matchId = req.params.matchId;
    const response = await axios.get(`https://api-football-v1.p.rapidapi.com/v3/fixtures/events`, {
      headers: { 'x-rapidapi-key': API_KEY },
      params: { fixture: matchId }
    });

    const events = response.data.response;
    res.render('match-timeline', { events, teamId: req.query.teamId }); // Pasar events y teamId a la vista
  } catch (error) {
    res.status(500).send('Error al obtener la línea de tiempo del partido');
  }
});

const path = require('path');

// Iniciamos el servidor en el puerto especificado
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});




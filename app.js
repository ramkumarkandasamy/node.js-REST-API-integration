const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());


const dbPath = path.join(__dirname, "goodreads.db");

let db = null;

const initializeDBAndServer = async () => {
    try {
      db = await open({
        filename: dbPath,
        driver: sqlite3.Database,
      });

      // create a table 
      const createMovieTableQuery = `
        CREATE TABLE IF NOT EXISTS movie (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            image TEXT NOT NULL,
            description TEXT NOT NULL
        );
      `;
      await db.run(createMovieTableQuery);

      app.listen(3000, () => {
        console.log("Server Running at http://localhost:3000/");
      });
    } catch (e) {
      console.log(`DB Error: ${e.message}`);
      process.exit(1);
    }
  };

initializeDBAndServer();

  
// Define a route handler for the root URL
app.get("/", async (request, response) => {
    try {
      // You can send a response here, such as rendering an HTML file
      response.sendFile(path.join(__dirname, "public", "index.html"));
    } catch (error) {
      console.error("Error:", error.message);
      response.status(500).send("Internal Server Error");
    }
  });

app.get("/movies/", async (request, response) => {
    const getBookQuery = `
        SELECT *
        FROM movie;
    `;
    const bookDetails = await db.all(getBookQuery);
    response.send(bookDetails);
});

app.get("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const getMovie = `
    SELECT *
    FROM movie
    WHERE 
      id = ${movieId};
  `;
  const movie = await db.get(getMovie);
  response.send(movie);
});

app.post("/movies/", async (request, response) => {
    const movieDetail = request.body;
    const { name, image, description } = movieDetail; 
    const addMovieQuery = `
        INSERT INTO 
            movie (name, image, description)
        VALUES 
            (
                '${name}',
                '${image}',
                '${description}'
            );
    `;
    const dbResponse = await db.run(addMovieQuery);
    const movieId = dbResponse.lastID;
    response.send({ movieId: movieId});
});




app.put("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { name, image, description } = movieDetails;
  const updtaeMovieQuery = `
    UPDATE
      movie
    SET 
      name='${name}',
      image='${image}',
      description='${description}'
    WHERE
      id = ${movieId};;
  `;
  await db.run(updtaeMovieQuery);
  response.send("movie Updated");
});

app.delete("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovie =  `
    DELETE FROM movie
    WHERE id = ${movieId};
  `;
  await db.run(deleteMovie);
  response.send("movie deleted");
});
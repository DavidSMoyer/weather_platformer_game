const sqlite = require('sqlite3');
const express = require('express');
const fs = require("fs");
const fsPromises = fs.promises;

const openDB = async (filePath, recreateFunc) => new Promise(async (resolve, reject) => { 
  const fileExists = await fsPromises.access(filePath, fs.constants.W_OK).then(() => true).catch(() => false);
  const db = new sqlite.Database(filePath, err => {
    if(err)
      reject(err.message);
  });

  if(!fileExists && recreateFunc !== undefined) {
    recreateFunc(db);
    console.log("Database not found, Database Recreated");
  }

  resolve(db);
});

const queryDB = async (db, queryString, params = []) => new Promise((resolve, reject) => {
  db.all(queryString, params, (err, rows) => {
    if (err) reject(err);
    resolve(rows);
  });
});

const insertDB = async (db, insertString, params = []) => new Promise((resolve, reject) => {
  db.run(insertString, params, err => {
    if (err) reject(err);
    resolve(true);
  });
});

const recreateScoreDB = db => {
  db.run(`CREATE TABLE IF NOT EXISTS playerScores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nick TEXT NOT NULL,
    time INTEGER NOT NULL,
    weather TEXT NOT NULL,
    collected INTEGER NOT NULL,
    level INTEGER NOT NULL
  );`);
};

(async () => {
  try {
    const db = await openDB("./scores.db", recreateScoreDB);
    const web = express();

    web.use(express.static('./www'));
    web.get('/api/score', async (req, res) => {
      try {
        console.log(req.query);
        req.query.id = parseInt(req.query.id);
        if (isNaN(req.query.id) || req.query.id < 0) {
          res.status(400);
          res.send("ID Required");
          return;
        }

        const data = await queryDB(db, `SELECT * FROM playerScores WHERE id == ${req.query.id}`);
        if (data.length == 0) throw new Error("no results for score with id: " + req.query.id);
        res.status(200);
        res.send(data[0]);
      } catch(e) {
        console.log(e);
        res.sendStatus(500);
      }
    });

    web.get('/api/scores', async (req, res) => {
      try {
        req.query.page = parseInt(req.query.page);
        if (isNaN(req.query.page) || req.query.page < 0) {
          req.query.page = 0;
        }

        req.query.limit = parseInt(req.query.limit);
        if (isNaN(req.query.limit) || req.query.limit < 1) {
          req.query.limit = 25;
        }

        req.query.level = parseInt(req.query.level);
        if (isNaN(req.query.level) || req.query.level < 0) {
          req.query.level = -1;
        }

        const data = await queryDB(db, `SELECT * FROM playerScores ${req.query.level!=-1?("WHERE level == " + req.query.level):""} ORDER BY time DESC LIMIT ${req.query.limit} OFFSET ${req.query.page * req.query.limit}; `);
        res.status(200);
        res.send(data);
      } catch(e) {
        console.log(e);
        res.sendStatus(500);
      }
    });

    web.post('/api/score', async (req, res) => {
      try {
        if (!req.query.name || !req.query.name.trim()) {
          res.status(400);
          res.send("Name Required");
          return;
        }

        req.query.time = parseInt(req.query.time);
        if (isNaN(req.query.time)) {
          res.status(400);
          res.send("Time Required");
          return;
        }

        if (!req.query.weather || !req.query.weather.trim()) {
          req.query.weather = "[]";
        }

        req.query.coins = parseInt(req.query.coins);
        if (isNaN(req.query.coins) || req.query.coins < 0) {
          req.query.coins = 0;
        }

        req.query.level = parseInt(req.query.level);
        if (isNaN(req.query.level) || req.query.level < 0) {
          res.status(400);
          res.send("Level Required");
          return;
        }

        await insertDB(db, `INSERT INTO playerScores (nick, time, weather, collected, level) VALUES ('${req.query.name}', ${req.query.time}, '${req.query.weather}', ${req.query.time}, ${req.query.level});`);
        res.sendStatus(200);
      } catch(e) {
        console.log(e);
        res.sendStatus(500);
      }
    });

    web.get('*', (req, res) => {
      res.redirect('index.html');
    });

    const server = web.listen(8080);

    //runs before process exit caused error when posting score, db never closed
    //db.close();

  } catch(e) {
    console.log("Error: " + e);
  }
})();
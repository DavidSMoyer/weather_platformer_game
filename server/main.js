const sqlite = require('sqlite3');
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
    console.log("DB recreated");
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
    //console.log(await insertDB(db, "INSERT INTO playerScores (nick, time, weather, collected, level) VALUES ('test', 1, 'snow', 0, 0);"))
    //console.log(await queryDB(db, "SELECT * FROM playerScores"));
    db.close();
  } catch(e) {
    console.log("Error: " + e);
  }
})();
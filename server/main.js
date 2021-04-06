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

const recreateScoreDB = db => {
  db.run(`CREATE TABLE IF NOT EXISTS playerScores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nick TEXT NOT NULL,
    time INTEGER NOT NULL,
    weather TEXT NOT NULL,
    collected TEXT NOT NULL,
    level INTEGER NOT NULL
  );`);
};

(async () => {
  try {
    const db = await openDB("./scores.db", recreateScoreDB);
    db.close();
  } catch(e) {
    console.log("Error: " + e);
  }
})();
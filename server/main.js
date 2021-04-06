const sqlite = require('sqlite3');

const openDB = async filePath => new Promise((resolve, reject) => { 
  const db = new sqlite.Database(filePath, err => {
    if(err)
      reject(err.message);
  });
  resolve(db);
});

(async () => {
  try {
    const DB = await openDB("./scores.db");
    console.log(DB);
    DB.close();
  } catch(e) {
    console.log("Error: " + e);
  }
})();
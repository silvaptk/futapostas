const fs = require('fs')
const { db }= require('../databases/postgres');
const { QueryFile } = require('pg-promise');

const {join: joinPath} = require('path');

// Helper for linking to external query files:
function sql(file) {
    const fullPath = joinPath(__dirname, file); // generating full path;
    return new QueryFile(fullPath, {minify: true});
}

async function runMigration() {
  const creationScript = sql('setup.sql')
  try {
    await db.any(creationScript);
  } catch(e) {
    console.error(e)
  }
}

runMigration();
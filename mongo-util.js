const { MongoClient, ObjectID } = require('mongodb');
const dotenv = require('dotenv');
dotenv.config();

function mongoUtil() {

  function loadData(data) {
    return new Promise(async (resolve, reject) => {
      const client = new MongoClient(process.env.URL);
      try {
        await client.connect();
        const db = client.db(process.env.dbName);
        const results = await db.collection(process.env.colName).insertMany(data);
        resolve(results);
        client.close();
      } catch (error) {
        reject(error);
      }
    })
  }

  function get(query, limit) {
    return new Promise(async (resolve, reject) => {
      const client = new MongoClient(process.env.URL);
      try {
        await client.connect();
        const db = client.db(process.env.dbName);
        let items = await db.collection(process.env.colName).find(query); // returns a cursor
        if (limit > 0) {
          items = items.limit(limit);
        }
        resolve(await items.toArray());
        client.close();
      } catch (error) {
        reject(error);
      }
    });
  }

  function getById(id) {
    return new Promise(async (resolve, reject) => {
      const client = new MongoClient(process.env.URL);
      try {
        await client.connect();
        const db = client.db(process.env.dbName);
        const item = await db.collection(process.env.colName).findOne({_id: ObjectID(id)});
        resolve(item);
        client.close();
      } catch (error) {
        reject(error);
      }
    });
  }  

  function addItem(item) {
    return new Promise(async (resolve, reject) => {
      const client = new MongoClient(process.env.URL);
      try {
        await client.connect();
        const db = client.db(process.env.dbName);
        const addedItem = await db.collection(process.env.colName).insertOne(item);
        resolve(addedItem.ops[0]);
        await client.close();
      } catch (error) {
        reject(error);
      }
    });
  }

  function updateItem(id, item) {
    return new Promise(async (resolve, reject) => {
      const client = new MongoClient(process.env.URL);
      try {
        await client.connect();
        const db = client.db(process.env.dbName);
        const updatedItem = await db.collection(process.env.colName)
          .findOneAndReplace({_id: ObjectID(id)}, item, {returnOriginal: false});
        resolve(updatedItem.value);
        client.close();
      } catch (error) {
        reject(error);
      }
    });
  }

  function removeItem(id) {
    return new Promise(async (resolve, reject) => {
      const client = new MongoClient(process.env.URL);
      try {
        await client.connect();
        const db = client.db(process.env.dbName);
        const removed = await db.collection(process.env.colName).deleteOne({_id: ObjectID(id)});
        resolve(removed.deletedCount === 1);
        client.close();        
      } catch (error) {
        reject(error);
      }
    });
  }

  return { loadData, get, getById, addItem, updateItem, removeItem }
} 

module.exports = mongoUtil();
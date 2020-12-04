const { MongoClient, ObjectID } = require('mongodb');
const assert = require('assert');
const dotenv = require('dotenv'); 
dotenv.config();
const mongoUtil = require('./mongo-util');
const mockData = require('./mock-data.json');

async function main() {
  try {
    // Load data
    const results = await mongoUtil.loadData(mockData);
    assert.strictEqual(mockData.length, results.insertedCount);
    console.log('--INSERTED DATA:');
    console.log(typeof results); // object {}
    console.log(results); // {result: {}, ops: [], insertedCount: number, insertedIds: {}, ...}
    console.log(results.insertedCount, results.ops);

    // Get data (all)
    const getData = await mongoUtil.get({});
    assert.strictEqual(mockData.length, getData.length);
    console.log('--GET DATA:');
    console.log(getData);

    // Get data with filter
    const filterData = await mongoUtil.get({Newspaper: 'New York Times'});
    assert.deepStrictEqual(filterData[0].Newspaper, 'New York Times');
    console.log('--FILTERED DATA:');
    console.log(filterData);

    // Get data with limit
    const limitData = await mongoUtil.get({}, 2);
    assert.deepStrictEqual(limitData.length, 2);
    console.log('--LIMIT DATA:');
    console.log(limitData);

    // Get data by id
    const id = '5fca36f5895c2510fc832740';
    const byId = await mongoUtil.getById(id);
    console.log(byId);
    assert.deepStrictEqual(byId._id, ObjectID(id));

    // Add item
    const newItem = {
      "Newspaper": "New Journal",
      "Daily Circulation, 2018": 2222,
      "Daily Circulation, 2020": 3333,
      "Change in Daily Circulation, 2018-2020": 33,
      "Pulitzer Prize Winners and Finalists, 1990-2003": 0,
      "Pulitzer Prize Winners and Finalists, 2004-2014": 0,
      "Pulitzer Prize Winners and Finalists, 1990-2014": 0
  }
    const addedItem = await mongoUtil.addItem(newItem);
    assert(addedItem._id);
    console.log(addedItem);

    // Update item
    const id = '5fca3832a546ed08c47dabde';
    const newItem = {
      "Newspaper": "Updated Journal",
      "Daily Circulation, 2018": 2222222,
      "Daily Circulation, 2020": 3333333,
      "Change in Daily Circulation, 2018-2020": 30000003,
      "Pulitzer Prize Winners and Finalists, 1990-2003": 111110,
      "Pulitzer Prize Winners and Finalists, 2004-2014": 11111110,
      "Pulitzer Prize Winners and Finalists, 1990-2014": 1111110,
      "NewProperty": "ValueOfNewProperty"
    };
    const updated = await mongoUtil.updateItem(id, newItem);
    console.log(updated);
    const check = await mongoUtil.getById(id);
    assert.deepStrictEqual(updated, check);

    // Remove item
    const id = '5fca3832a546ed08c47dabde';
    const removed = await mongoUtil.removeItem(id);
    console.log(removed);
    assert(removed);

    const deleted = await mongoUtil.getById(id);
    console.log(deleted);
    assert.strictEqual(deleted, null);

  } catch (error) {
    console.log(error);
  } finally {
    // Admin
    const client = new MongoClient(process.env.URL);
    await client.connect();
    const admin = client.db(process.env.dbName).admin();
    console.log('--SERVER STATUS:');
    console.log(await admin.serverStatus());
    console.log('--LIST OF DATABASES BEFORE DROPPING:');
    console.log(await admin.listDatabases());
    await client.db(process.env.dbName).dropDatabase();
    console.log('--LIST OF DATABASES AFTER DROPPING:');    
    console.log(await admin.listDatabases());
    client.close();
  }
}

main();

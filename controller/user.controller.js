const { neo4j } = require('../config/db');
// One type Node: Person
async function getUsers(req, res, next) {
    let session;
    try {
        session = neo4j().session();
        // By specifying a pattern with a single node and no labels, all nodes in the graph will be returned
        const result = await session.run(
            'MATCH (n) RETURN n',
        )
        return res.send({
            result: result
        })
    }
    catch (err) {
        return next(err)
    }
    finally {
        await session.close()
    }
}
async function getUsersWithRelations(req, res, next) {
    let session;
    try {
        session = neo4j().session();
        const result = await session.run(
            'MATCH (a:Person) -[r] - (b :Person) RETURN *',
        )
        return res.send({
            result: result
        })
    }
    catch (err) {
        return next(err)
    }
    finally {
        await session.close()
    }
}
async function getUsersByLabel(req, res, next) {
    let session;
    try {
        let { label } = req.query;
        console.log(label)
        session = neo4j().session();
        // Find all nodes with a specific label:
        const result = await session.run(
            `MATCH (user:${label})
             RETURN user`
        )
        return res.send({
            result: result
        })
    }
    catch (err) {
        return next(err)
    }
    finally {
        await session.close()
    }
}
async function searchUser(req, res, next) {
    let session;
    try {
        let { name } = req.query;
        console.log(name)
        session = neo4j().session();
        // Find all nodes with a specific label:
        const result = await session.run(
            `MATCH (:Person {name: '${name}'})--(p:Person)
             RETURN p`)

        return res.send({
            result: result
        })
    }
    catch (err) {
        return next(err)
    }
    finally {
        await session.close()
    }
}


async function insertUser(req, res, next) {
    let session;
    try {
        session = neo4j().session();
        const { name, personalId } = req.body;
        const result = await session.run(
            'CREATE (a:Person {name: $name, personalId: $personalId}) RETURN a',
            { name: name, personalId: personalId }
        )

        const singleRecord = result.records[0]
        const node = singleRecord.get(0)
        return res.send({
            result: node
        })
    } catch (err) {
        return next(err)
    }
    finally {
        await session.close()
    }
}
async function deleteAllUsers(req, res, next) {
    let session;
    try {
        session = neo4j().session();
        const { name } = req.body;
        const result = await session.run(
            'MATCH (n) DETACH DELETE n',
            { name: name }
        )
        return res.send({
            message: "Request done successfully"
        })
    } catch (err) {
        return next(err)
    }
    finally {
        await session.close()
    }
}
async function createRelation(req, res, next) {
    let session;
    try {
        session = neo4j().session();
        const { from, to } = req.body;
        const result = await session.run(
            `MATCH
            (a:Person),
            (b:Person)
            WHERE a.personalId = $from AND b.personalId = $to
            CREATE (a)-[rel:FOLLOW]->(b)
            RETURN type(rel)`,
            { from: from, to: to }
        )
        return res.send({
            result: result
        })
    } catch (err) {
        return next(err)
    }
    finally {
        await session.close()
    }
}

module.exports = {
    getUsers,
    getUsersWithRelations,
    getUsersByLabel,
    insertUser,
    deleteAllUsers,
    createRelation,
    searchUser
}
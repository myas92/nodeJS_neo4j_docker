const { neo4j } = require('../config/db');
// One type Node: Person
async function getNodes(req, res, next) {
    let session;
    try {
        session = neo4j().session();
        // By specifying a pattern with a single node and no labels, all nodes in the graph will be returned
        const result = await session.run(
            'MATCH (n) RETURN n',
        )
        return res.send({
            result: result.records
        })
    }
    catch (err) {
        return next(err)
    }
    finally {
        await session.close()
    }
}

async function deleteNodeById(req, res, next) {
    let session;
    try {
        let { elementId } = req.params;
        session = neo4j().session();
        const { name } = req.body;
        const result = await session.run(
            `MATCH (n) where elementId(n)=$elementId
             DETACH DELETE n`,
            { elementId: elementId }
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
async function searchNode(req, res, next) {
    let session;
    try {
        let { input } = req.query;
        session = neo4j().session();
        // Find all nodes with a specific label:
        const result = await session.run(
            `CALL db.index.fulltext.queryNodes("person_and_project", "*${input}*") 
             YIELD node, score
             RETURN node, score`);
            console.log(result)
        return res.send({
            result: result.records
        })
    }
    catch (err) {
        return next(err)
    }
    finally {
        await session.close()
    }
}


async function getNodeWithRelationsById(req, res, next) {
    let session;
    try {
        let { elementId, deepId } = req.params;
        session = neo4j().session();
        // Find all nodes with a specific label:
        const result = await session.run(
            `MATCH (a)-[r*1..${deepId}]-(b)
             where elementId(a)=$elementId
             RETURN r, a, b`,
            { elementId: elementId }
        )
        return res.send({
            result: result.records
        })
    }
    catch (err) {
        return next(err)
    }
    finally {
        await session.close()
    }
}
async function getNodeById(req, res, next) {
    let session;
    try {
        let { elementId } = req.params;
        session = neo4j().session();
        const result = await session.run(
            `MATCH (n) where elementId(n)=$elementId
             RETURN n`,
            { elementId: elementId }
        )
        return res.send({
            result: result.records
        })
    }
    catch (err) {
        return next(err)
    }
    finally {
        await session.close()
    }
}


module.exports = {
    getNodes,
    deleteNodeById,
    searchNode,
    getNodeWithRelationsById,
    getNodeById
}
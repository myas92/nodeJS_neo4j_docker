const { neo4j } = require('../config/db');
// One type Node: Person

async function getRelations(req, res, next) {
    let session;
    try {
        session = neo4j().session();
        const result = await session.run(
            'MATCH (a) -[r] - (b) RETURN DISTINCT(r)',
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

async function deleteRelationshipById(req, res, next) {
    let session;
    try {
        let { elementId } = req.params;
        session = neo4j().session();
        const { name } = req.body;
        const result = await session.run(
            `MATCH ()-[r]-() WHERE elementId(r)=$elementId DELETE r`,
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
async function createRelation(req, res, next) {
    let session;
    try {
        session = neo4j().session();
        const { from, to, meta, label } = req.body;
        const { description, level } = meta;
        const result = await session.run(
            `
            MATCH (a)
            MATCH (b)
            WHERE elementId(a) = $from AND elementId(b)=$to
            CREATE (a)-[rel:FOLLOW {label: $label, description: $description, level:$level}]->(b)
            RETURN rel
            `, { from: from, to: to, label, description, level }
        )
        return res.send({
            result: result.records
        })
    } catch (err) {
        return next(err)
    }
    finally {
        await session.close()
    }
}

module.exports = {
    createRelation,
    getRelations,
    deleteRelationshipById
}
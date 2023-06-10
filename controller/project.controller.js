const { neo4j } = require('../config/db');
// One type Node: Person
async function getProjects(req, res, next) {
    let session;
    try {
        session = neo4j().session();
        // By specifying a pattern with a single node and no labels, all nodes in the graph will be returned
        const result = await session.run(
            'MATCH (n:Project) RETURN n',
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
async function getProjectsWithRelations(req, res, next) {
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
async function getProjectsByLabel(req, res, next) {
    let session;
    try {
        let { label } = req.query;
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



async function insertProject(req, res, next) {
    let session;
    try {
        session = neo4j().session();
        const { name, description, link } = req.body;
        const result = await session.run(
            'CREATE (a:Project {name: $name, description: $description, link:$link}) RETURN a',
            { name, description, link }
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

module.exports = {
    getProjects,
    getProjectsWithRelations,
    getProjectsByLabel,
    insertProject,
}
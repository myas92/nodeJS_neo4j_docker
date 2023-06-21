const { neo4j } = require('../config/db');
const { VMsInfo } = require("../scripts/VMsInfo");
// One type Node: VirtualMachine
const TypeNode = 'VirtualMachine'

let blackUsers = ['ali.mousavi', 'darkoob', 'devops', 'rundeck', 'mahla.rahati']
async function insertVMs(req, res, next) {

    let session;
    try {
        session = neo4j().session();
        for (let vm of VMsInfo) {
            const { name, id, ip, os, projectName, subProject, environment, zone } = vm
            let vmResult = await session.run(
                `MERGE (vm:VirtualMachine {name:$name, id:$id , ip:$ip , os:$os, projectName:$projectName , subProject:$subProject, environment:$environment , zone:$zone })
                RETURN vm`,
                { name: name, id: id, ip: ip, os: os, projectName: projectName, subProject: subProject, environment: environment, zone: zone }
            )
            let vmId = vmResult.records[0].get(0).elementId
            // Upsert Project
            const projectResult = await session.run(
                `
                MERGE (prj:Project {name:$name })
                RETURN prj
                 `, { name: vm.projectName });
            let projectId = projectResult.records[0].get(0).elementId;

            //[project]->[virtual Machine]
            await session.run(
                `
                MATCH (a)
                MATCH (b)
                WHERE elementId(a) = $from AND elementId(b)=$to
                CREATE (a)-[rel:FOLLOW {label: $label}]->(b)
                RETURN rel
          `, { from: projectId, to: vmId, label: '', });

            for (let user of vm.users) {
                if (!blackUsers.includes(user)) {

                    const userResult = await session.run(
                        `
                        MERGE (user:Person {name:$name })
                        RETURN user
                         `, { name: user });
                    // [user]->[Virtual Machine]
                    let userId = userResult.records[0].get(0).elementId
                    await session.run(
                        `
                        MATCH (a:Person)
                        MATCH (b)
                        WHERE elementId(a) = $from AND elementId(b)=$to
                        CREATE (a)-[rel:FOLLOW {label: $label}]->(b)
                        RETURN rel
                `, { from: userId, to: vmId, label: '', });

                    // [user]->[Project]
                    await session.run(
                        `
                        MATCH (a)
                        MATCH (b)
                        WHERE elementId(a) = $from AND elementId(b)=$to
                        MERGE (a)-[rel:FOLLOW {label: $label}]->(b)
                        RETURN rel
                `, { from: userId, to: projectId, label: '', });


                }
            }
        }
        return res.send({
            message: "Request done successfully"
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
    insertVMs,
}
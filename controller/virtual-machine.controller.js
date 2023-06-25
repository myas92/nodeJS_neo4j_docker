const { default: axios } = require('axios');
const { neo4j } = require('../config/db');
const { VMsInfo } = require("../scripts/VMsInfo");
// One type Node: VirtualMachine
const TypeNode = 'VirtualMachine'

let blackUsers = ['ali.mousavi', 'darkoob', 'devops', 'rundeck', 'mahla.rahati']
async function insertVMs(req, res, next) {
    let session;
    try {
        session = neo4j().session();
        const usersDetails = await getUsersTeams()
        for(let user of Object.keys(usersDetails)){
            const teams = getTeams(usersDetails, user)
            await session.run(
                `MERGE (p:Person {name: $name})
                 ON CREATE
                    SET  p.teams=$teams
                RETURN p`,
                { name: user, teams: teams });
        }
        for (let vm of VMsInfo) {
            //  Upsert VM
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
            // assign users of each VM to Project and 
            for (let user of vm.users) {
                if (usersDetails[user]) {
                    const teams = getTeams(usersDetails, user)
                    if (!blackUsers.includes(user)) {
                        // Upsert User
                        const userResult = await session.run(
                            `MERGE (p:Person {name: $name})
                             ON MATCH
                                SET  p.teams=$teams
                            RETURN p`,
                            { name: user, teams: teams });
                        // [user]->[Virtual Machine]
                        let userId = userResult.records[0].get(0).elementId
                        await session.run(
                            `
                            MATCH (a:Person)
                            MATCH (b)
                            WHERE elementId(a) = $from AND elementId(b)=$to
                            MERGE (a)-[rel:FOLLOW {label: $label}]->(b)
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


async function getUsersTeams() {
    try {
        let config = {
            method: 'get',
            url: 'http://172.30.201.78:3001/user/all-users-teams',
            headers: {
                'X-Auth-Token': process.env.EVENT_NOTIFICATION_TOKEN
            },
        };

        let { data } = await axios(config)
        return data.data.users
    } catch (error) {
        throw new Error('Error: getUsersTeam')
    }

}

function getTeams(usersDetails, user) {
    let teams = ['']
    if (usersDetails[user]?.length == 1) {
        teams = (usersDetails[user][0].teamTitle) ? [(usersDetails[user][0].teamTitle)] : ['']
    }
    else if (usersDetails[user]?.length > 1) {
        teams = usersDetails[user].map(info => (info.teamTitle) ? info.teamTitle : [''])
    }
    return teams
}


module.exports = {
    insertVMs,
}
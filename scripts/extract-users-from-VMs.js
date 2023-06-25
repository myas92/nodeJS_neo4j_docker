const { VMs } = require("./VMs");
const { getUsersVM } = require("./request");
const fs = require('fs');
const windowsQuery = 'user_info_output'
const extractUsersFromVMs = async () => {
    try{
        let usersInfo=[];
        for (let vm of VMs) {
            let currUsers, ip;
            let hostname = vm.labels.__meta_netbox_name
            let result = await getUsersVM(hostname);
            let os;
            
            if (result.data.result.length == 0) {
                result = await getUsersVM(hostname, windowsQuery);
                // result = {
                //     "status": "success",
                //     "data": {
                //         "resultType": "vector",
                //         "result": [
                //             {
                //                 "metric": {
                //                     "IP": "192.168.48.201",
                //                     "OS": "Windows Server 2019 Standard",
                //                     "Users": "mourche ## Part.JitsiAdmin ## Part-MySSO-Admin ## Administrator ## Enterprise Admins ## Domain Admins ## mohammadali.farajian ## hamed.saadati ## mahdi.esmaeeli ## Part-MySSO-Admin ## zahra.parham ## arash.ghavidast ## alireza.tajalli ## hamidreza.amini ## khadijeh.shokati ## Administrator ## khadijeh.shokati ## hamidreza.amini ## alireza.tajalli ## arash.ghavidast ## kerioadmin ## hamed.saadati ## fatemeh.moradi ## rouhbakhsh ## mohammadali.farajian ## veeam-appaware ## admanager ## Horizon-domain-user",
                //                     "__name__": "system_info_output",
                //                     "host": "ADDC-19-net.part3.psg.network",
                //                     "instance": "192.168.48.201:9273",
                //                     "job": "virtual-machines"
                //                 },
                //                 "value": [
                //                     1687173385.857,
                //                     "10"
                //                 ]
                //             }
                //         ]
                //     }
                // }
                currUsers = result.data.result[0].metric.Users;
                currUsers = currUsers.split(/(?:\s##\s)/);
                currUsers = [...new Set(currUsers)];
                ip = result.data.result[0].metric.IP;
            }
            else {
                currUsers = result.data.result[0].metric.Users.split(", ");
                currUsers = [...new Set(currUsers)];
                ip = result.data.result[0].metric.IPAddress;
            }
            usersInfo.push({
                users: currUsers,
                name: vm.labels.__meta_netbox_name,
                ip: ip,
                os: result.data.result[0].metric.OS,
                ...getVMsDetails(hostname)
            })
    
        }
        fs.writeFileSync(`./VMsInfo${+new Date()}.json`, JSON.stringify(usersInfo))
        // console.log(usersInfo)
        console.log('Finished Extracting USers of VMs')
    }
    catch(e){
        console.log(e)
    }

}

function getVMsDetails(hostname){
    let vmInfo = hostname.split(/(?:-|\.)+/);
    let vmDetails={}
    if(vmInfo.length==6){
        vmDetails  = {
            projectName:vmInfo[0],
            subProject: '',
            id: vmInfo[1],
            environment: vmInfo[2],
            zone: vmInfo[3]
        }
    }else {
        vmDetails  = {
            projectName:vmInfo[0],
            subProject: vmInfo[1],
            id: vmInfo[2],
            environment: vmInfo[3],
            zone: vmInfo[4]
        }
    }
    return vmDetails
}


extractUsersFromVMs()
module.exports = {
    extractUsersFromVMs
}
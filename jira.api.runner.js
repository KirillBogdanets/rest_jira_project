
const Client = require('node-rest-client').Client;
const fs=require('fs');
const yargs = require("yargs").argv;
const txtFilePath = "./tags.txt";
const creds = require('./consts/common.consts.json');
client = new Client();

let loginArgs = {
    data: {
        "username": creds.userName,
        "password": creds.password
    },
    headers: {
        "Content-Type": "application/json"
    }
};

const jsonWorker = (value) => {
    let tagsArray = [];
    let arrayFromJira = value.fields.customfield_12303;
    arrayFromJira.map(val => {
       tagsArray.push(`@jira(${val.b})`);
    });
    let finalString = `--tag "${tagsArray.join('","')}"`;
    fs.writeFileSync(txtFilePath, finalString,'utf8');
};

client.post("https://jira.wolterskluwer.io/jira/rest/auth/1/session", loginArgs,(data, response) =>{
    if (response.statusCode === 200) {
        let session = data.session;
        let issueTypes = {
            headers: {
                cookie: session.name + '=' + session.value,
                "Content-Type": "application/json"
            }
        };
        client.get(`https://jira.wolterskluwer.io/jira/rest/api/2/issue/${yargs.tag}`, issueTypes, (data, response) => {
            if (response.statusCode === 200) {
                jsonWorker(data);
            } else {
                throw `Given tag: ${yargs.tag} was wrong.`;
            }
        });
    } else {
        throw "Login failed :(";
    }
});


const Client = require('node-rest-client').Client;
const fs=require('fs');
const yargs = require("yargs").argv;
const txtFilePath = "./tags.txt";
const jsonFilePath = './finalJson.json';
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

const jsonWorker = (value, createFile) => {
    let tagsArray = [];
    let arrayFromJira = value.fields.customfield_12303;
    arrayFromJira.map(val => {
       tagsArray.push(`@jira(${val.b})`);
    });
    let finalString = `--tag "${tagsArray.join('","')}"`;

    if (createFile) {
       return fs.writeFileSync(txtFilePath, finalString, 'utf8');
    }
    jsonComparator(finalString);
};

const clientRequest = (createFile) => {
    return client.post("https://jira.wolterskluwer.io/jira/rest/auth/1/session", loginArgs, (data, response) => {
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
                    return jsonWorker(data, createFile);
                } else {
                    throw `Given tag: ${yargs.tag} was wrong.`;
                }
            });
        } else {
            throw "Login failed :(";
        }
    });
};

const jsonComparator = (tags) => {
    if (yargs.path) {
        let filePath = yargs.path.trim();
        let givenJson = require(filePath);
        let finalObject = {};
        finalObject.tests = [];
        givenJson.tests.map(value => {
            if (tags.includes(value.testKey)) {
                finalObject.tests.push(value);
            }
        });
        return fs.writeFileSync(jsonFilePath, JSON.stringify(finalObject), 'utf8');
    } else {
        throw "Given no path";
    }
};

module.exports = {
    clientRequest,
};

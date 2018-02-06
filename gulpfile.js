const gulp = require('gulp');
const yargs = require("yargs").argv;
const jiraApi = require('./jira.api.runner');

gulp.task('tags:converting', ()=>{
    if (yargs.path) {
        jiraApi.clientRequest();
    } else {
        jiraApi.clientRequest(true);
    }
});
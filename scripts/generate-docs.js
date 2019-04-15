#!/usr/local/bin/node

const fs = require('fs');
const execSync = require('child_process').execSync;

const widdershins_output_file = './docs/source/_tmp.html.md'

// https://stackoverflow.com/questions/18052762/remove-directory-which-is-not-empty#answer-32197381
var _deleteFolderRecursive = function(path) {
    if (fs.existsSync(path)) {
      fs.readdirSync(path).forEach(function(file, index){
        var curPath = path + "/" + file;
        if (fs.lstatSync(curPath).isDirectory()) { // recurse
            _deleteFolderRecursive(curPath);
        } else { // delete file
          fs.unlinkSync(curPath);
        }
      });
      fs.rmdirSync(path);
    }
  };
  
  function run_command(command, params) {
    console.log('Running `' + command + '`...')
    if (params && !params.stdio) {
        params.stdio = 'inherit'
    }
    execSync(command, params);
}

function git_pull() {
    run_command('git pull origin master', {cwd:'./docs'});
}

function widdershins() {
    var command = [
        "./node_modules/.bin/widdershins", 
        "--search", "true", 
        "--language_tabs", "'shell:Shell'", "'go:Go'", "'java:Java'", "'javascript:Javascript'", "'python:Python'", "'ruby:Ruby'", 
        "--summary", "api/swagger/swagger.yaml", 
        "-o", widdershins_output_file
    ]
    run_command(command.join(' '));
}

function split_widdershins_output() {
    const data = fs.readFileSync(widdershins_output_file, 'utf8')

    const delimiter = '<h1 id="ccxt-rest-exchange-management-api">Exchange Management API</h1>'
    segments = data.split(delimiter);
    //first_half = [delimiter, segments[1], delimiter].join('')
    //second_half = segments.slice(2).join(delimiter)

    fs.writeFileSync("./docs/source/00_generated_header.html.md", [segments[0], '\n'].join(''));
    fs.writeFileSync("./docs/source/50_generated_api.html.md", ['\n', delimiter, segments[1]].join(''));

    fs.unlinkSync(widdershins_output_file)
}

function docs_build() {
    run_command('rake build', {cwd:'./docs'});
}

function delete_out_docs() {
    _deleteFolderRecursive('./out/docs')
}

function move_docs_build_to_out_docs() {
    if (!fs.existsSync('./out')) {
        fs.mkdirSync('./out')
    }
    fs.renameSync('./docs/build', './out/docs')
}

git_pull();
widdershins();
split_widdershins_output();
docs_build();
delete_out_docs();
move_docs_build_to_out_docs();
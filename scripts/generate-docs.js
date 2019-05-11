#!/usr/local/bin/node

const fs = require('fs');
const execSync = require('child_process').execSync;

const redoc_output_file = './docs/website/static/api.html'
const ccxt_rest_website_output_dir = 'docs/website/build/ccxt-rest'

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
    console.info('[START] `' + command + '`...')
    if (params && !params.stdio) {
        params.stdio = 'inherit'
    }
    execSync(command, params);
    console.info('[END] `' + command + '`...')
}

function ensure_submodule_exists() {
    if (!fs.existsSync('./docs/Dockerfile')) {
        run_command('git submodule init docs')
        run_command('git submodule update docs')
    }
}

function redoc() {
    var command = [
        "./node_modules/.bin/redoc-cli", 
        "bundle", "api/swagger/swagger.yaml", 
        "--output", redoc_output_file, 
        "--title='CCXT-REST API Documentation'", 
        "--template=./docs/templates/template.hbs"
    ]
    run_command(command.join(' '));
}

function docs_build() {
    run_command('npm install', {cwd:'./docs/website'});
    run_command('npm run build', {cwd:'./docs/website'});
    if (!fs.existsSync(ccxt_rest_website_output_dir)) {
        console.error(`Should have been able to find ${ccxt_rest_website_output_dir} but did not`)
        process.exit(1)
    }
}

function move_docs_build_to_out_docs() {
    console.info('[START] move_docs_build_to_out_docs()...')
    if (!fs.existsSync('./out')) {
        fs.mkdirSync('./out')
    }
    if (!fs.existsSync('./out')) {
        console.error('Should have been able to find ./docs but did not')
        process.exit(1)
    }
    try {
        // this code fails inside docker
        fs.renameSync(ccxt_rest_website_output_dir, 'out/docs')
    } catch (err) {
        // so we fallback to something we know will work inside node:10.4.0-alpine
        run_command(`mv ${ccxt_rest_website_output_dir} out/docs`)
    }
    console.info('[END] move_docs_build_to_out_docs()...')
}

ensure_submodule_exists();
_deleteFolderRecursive('./docs/website/build')
_deleteFolderRecursive('./out/docs')
redoc();
docs_build();
move_docs_build_to_out_docs();

#!/usr/local/bin/node

const fs = require('fs');
const yaml = require('js-yaml');

function verify_swagger_version() {
    const swagger_yaml = yaml.safeLoad(fs.readFileSync('./api/swagger/swagger.yaml'), 'utf8');
    const swagger_version = swagger_yaml.info.version

    const package_json = JSON.parse(fs.readFileSync('./package.json'));
    const package_version = package_json.version
    
    if (package_version != swagger_version) {
        console.log('[swagger.yaml] Version is : ' + swagger_version);
        console.log('[package.json] Version is : ' + package_version);

        console.error('******************************************************************************************************************')
        console.error('* swagger.yaml version does NOT match package.json. Update swagger.yaml\'s version to match that of package.json *')
        console.error('******************************************************************************************************************')
        process.exit(1)
    }
}

verify_swagger_version();

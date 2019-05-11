const fs = require('fs');
const path = require('path');
const Mocha = require('mocha-parallel-tests').default;

const os = require('os')

process.env.PORT = 0
const app = require('../../app')

const mochaParamObject = (function(){
    const additionalMochaArgs = process.argv.slice(2)

    const getMethods = (obj) => {
        let properties = new Set()
        let currentObj = obj
        do {
          Object.getOwnPropertyNames(currentObj).map(item => properties.add(item))
        } while ((currentObj = Object.getPrototypeOf(currentObj)))
        return [...properties.keys()].filter(item => typeof obj[item] === 'function')
    }
    
    const mochaFunctionNames = getMethods(new Mocha()).filter(methodName => !methodName.startsWith('_')).sort()

    let mochaParamObject = {}
    let i = 0;
    let mochaParameterName
    while (i < additionalMochaArgs.length) {
        const optionName = additionalMochaArgs[i]
        if (optionName.startsWith('--')) {
            mochaParameterName = optionName.slice(2)

            if (!mochaFunctionNames.includes(mochaParameterName)) {
                console.error(`'${optionName}' is not supported. Try one of the followings intead: 
                ${mochaFunctionNames.map(name => '--' + name).join('\n * ')} 
                
                (Note: note all of these are supported.)`)
                process.exit(1)
            }
            mochaParamObject[mochaParameterName] = [] 
        } else if (optionName.startsWith('-')) {
            console.error(`Single dash options like '${optionName}' are not supported. Use double dash arguments instead.`)
            process.exit(1)
            continue;
        } else {
            mochaParamObject[mochaParameterName].push(optionName)
        }

        i++;
    }

    return mochaParamObject
})()

function generateTestFiles(server, exchangeList, testDir, templateFile, postTestFileGenerationProcessor) {
    const template = fs.readFileSync(templateFile).toString()
    exchangeList.forEach(exchangeName => {
        let testContent = template
            .replace(new RegExp('%%baseUrl%%', 'g'), `http://localhost:${server.address().port}`)
            .replace(new RegExp('%%exchangeName%%', 'g'), exchangeName);

        testContent = postTestFileGenerationProcessor(testContent, exchangeName)
        fs.writeFileSync(`${testDir}/${exchangeName}.js`, testContent)
    })
}

function prepareCleanTestDir(testDir) {
    if (!fs.existsSync(testDir)) {
        fs.mkdirSync(testDir, {recursive:true});
    }
    fs.readdirSync(testDir).forEach(fileName => {
        fs.unlinkSync(path.join(testDir, fileName))
    })  
}

function createMochaObject(testDir, mochaParamObject) {
    const mocha = new Mocha()
    fs.readdirSync(testDir)
        .filter(filename => filename.endsWith('.js'))
        .map(filename => path.join(testDir, filename))
        .forEach(filename => {
            console.info(`Adding ${filename} to mocha`)
            mocha.addFile(filename)
        });
    
    Object.keys(mochaParamObject).forEach(paramName => {
        mocha[paramName].apply(mocha, mochaParamObject[paramName])
    })

    const numberOfCpus = os.cpus().length
    let maxParallel = process.env.MAX_PARALLEL_TESTS || numberOfCpus
    if (maxParallel === 0) {
        maxParallel = numberOfCpus
    }
    console.info(`
    Max Parallel Configuration:
    * numberOfCpus : ${numberOfCpus}
    * process.env.MAX_PARALLEL_TESTS : ${process.env.MAX_PARALLEL_TESTS}
    * effective maxParallel : ${maxParallel}
    `)
    mocha.setMaxParallel(maxParallel)
    return mocha
}

function runParallelTests(exchangeList, testDir, templateFile, postTestFileGenerationProcessor, postMochaCreationProcessor, beforeAllTests, afterAllTests) {
    prepareCleanTestDir(testDir)

    beforeAllTests()

    if (fs.existsSync('./out/database.sqlite3')) {
        fs.unlinkSync('./out/database.sqlite3')
    }
    app.start(server => {
        generateTestFiles(server, exchangeList, testDir, templateFile, postTestFileGenerationProcessor);
        
        let mocha = createMochaObject(testDir, mochaParamObject)
        mocha = postMochaCreationProcessor(mocha, mochaParamObject)
        
        const start = new Date()
        mocha.run(function() {
            if (server) {
                server.close()
            }
            afterAllTests()
            const end = new Date()
            console.info(`Started execution at ${start.toUTCString()}`)
            console.info(`Ended execution at ${end.toUTCString()}`)
            console.info(`Finished execution after ${(end - start) / 1000.0 / 60.0 } minutes`)
        });
    
    })
    
}

module.exports = {
    runParallelTests : runParallelTests
}
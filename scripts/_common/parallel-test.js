const fs = require('fs');
const net = require('net');
const path = require('path');
const Mocha = require('mocha-parallel-tests').default;
const {exec, spawn} = require('child_process');

const os = require('os')

process.env.PORT = 0
const app = require('../../app')

const mochaDirectParameters = process.argv.slice(2)

const mochaParamObject = (function(){
    const additionalMochaArgs = mochaDirectParameters

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

function generateTestFiles(baseUrl, exchangeList, testDir, templateFile, postTestFileGenerationProcessor) {
    const template = fs.readFileSync(templateFile).toString()
    exchangeList.forEach(exchangeName => {
        let testContent = template
            .replace(new RegExp('%%baseUrl%%', 'g'), baseUrl)
            .replace(new RegExp('%%exchangeName%%', 'g'), exchangeName);

        testContent = postTestFileGenerationProcessor(testContent, exchangeName)
        fs.writeFileSync(`${testDir}/${exchangeName}-test.js`, testContent)
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
        generateTestFiles(`http://localhost:${server.address().port}`, exchangeList, testDir, templateFile, postTestFileGenerationProcessor);
        
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

function getAvailablePort() {
    return new Promise((resolve, reject) => {
        const server = net.createServer();
        server.unref();
        server.on('error', reject);
        server.listen(() => {
            const {port} = server.address();
            server.close(() => {
                resolve(port);
            });
        });
    });
}

function waitTillReachable(host, port) {
    const start = new Date().getTime()
    return new Promise((resolve, reject) => {
        const innerWaitTillReachable = () => {
            try {
                const socket = new net.Socket();
    
                socket.setTimeout(10 * 1000);
                socket.once('error', error => {
                    const current = new Date().getTime()
                    if (error.code === 'ECONNREFUSED' && (current - start) < (10 * 1000)) {
                        setTimeout(innerWaitTillReachable, 1000)
                    } else {
                        reject()
                    }
                });
                socket.once('timeout', () => {
                    const current = new Date().getTime()
                    if ((current - start) < (10 * 1000)) {
                        setTimeout(innerWaitTillReachable, 1000)
                    } else {
                        reject()
                    }
                });
        
                socket.connect(port, host, () => {
                    socket.end();
                    resolve();
                });
            } catch (e) {
                reject(e)
            }
        }
        innerWaitTillReachable();
	});
}

function runParallelProcessTests(exchangeList, testDir, templateFile, postTestFileGenerationProcessor, mochaCommandCreator, beforeAllTests, afterAllTests) {
    prepareCleanTestDir(testDir)

    beforeAllTests()

    if (fs.existsSync('./out/database.sqlite3')) {
        fs.unlinkSync('./out/database.sqlite3')
    }

    getAvailablePort().then(port => {
        const startCommand = `./bin/www`
        console.info(`Running ${startCommand}`)
        const ccxtProcess = spawn(process.execPath, ['./bin/www'], {
            env: Object.assign(process.env, {
                'NODE_ENV': 'test',
                'LOG_LEVEL': 'error',
                'PORT': port
            }),
            stdio:'inherit'
        })

        const baseUrl = `http://localhost:${port}`
        console.info(`Waiting for ${baseUrl} to be recheable`)
        waitTillReachable('localhost', port)
            .then(() => {
                console.info(`${baseUrl} is recheable!`)
                generateTestFiles(baseUrl, exchangeList, testDir, templateFile, postTestFileGenerationProcessor);

                const testFiles = fs.readdirSync(testDir)
                    .filter(filename => filename.endsWith('.js'))
                    .map(filename => path.join(testDir, filename));
                
                const testCommandStrings = testFiles.map(testFile => {
                    let command = ['./node_modules/.bin/mocha', testFile, ...mochaDirectParameters]
                    command = mochaCommandCreator(command)
                    return command.join(' ')
                })
                
                console.info(`Executing:\n * ${testCommandStrings.join('\n * ')}\n`)
            
                const start = new Date()
                const promises = testCommandStrings.map(commandString => new Promise((resolve, reject) => {
                    exec(commandString, 
                        {
                            env: Object.assign(process.env, {
                                'NODE_ENV': 'test',
                                'BASE_URL': baseUrl
                            })
                        }, 
                        (error, stdout, stderr) => {
                            if (stdout) {
                                console.info(stdout)
                            }
                            if (stderr) {
                                console.error(stderr)
                            }
                            if (error) {
                                console.error(`Error in ${commandString}`)
                                console.trace(error)
                                reject(error)
                            } else {
                                resolve()
                            }
                        });
                }))
            
                let hasError = false
                Promise.all(promises)
                    .catch(error => {
                        hasError = true
                    })
                    .finally(() => {
                        ccxtProcess.kill('SIGINT');
                        afterAllTests()
                        const end = new Date()
                        console.info(`Started execution at ${start.toUTCString()}`)
                        console.info(`Ended execution at ${end.toUTCString()}`)
                        console.info(`Finished execution after ${(end - start) / 1000.0 / 60.0 } minutes`)
                        process.exit(hasError ? 1 : 0)
                    })
            }).catch(error => {
                console.error(`Could not wait for localhost:${port}`)
                console.trace(error)
                process.exit(1)
            })
    }).catch(error => {
        console.error('Could not find available port')
        console.trace(error)
        process.exit(1)
    })
    
}

module.exports = {
    runParallelTests : runParallelTests,
    runParallelProcessTests : runParallelProcessTests
}
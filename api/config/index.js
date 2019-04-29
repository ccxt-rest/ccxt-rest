module.exports = {
    dbConfigPath : process.env.DB_CONFIG,
    env : process.env.NODE_ENV,
    logLevel : (process.env.LOG_LEVEL || 'info'),
    port : (process.env.PORT || 3000)
}
/* Create and export configuration variables */

// Container for all the environments
const environments = {};

// Staging (default) environment
environments.staging = {
    'httpPort': 4343,
    'httpsPort': 4344,
    'envName': 'staging'
};

// Production environment
environments.production = {
    'httpPort': 5555,
    'httpsPort': 5556,
    'envName': 'production'
};

// Determine which environment was passed as a command-line argument. 
// Note: 'process' is a global variable in Node.js
const currentEnvironment = typeof(process.env.NODE_ENV) === 'string' ? process.env.NODE_ENV.toLowerCase() : '';

// Check that the current environment is one of the environments above,
// if not, default to staging.
const environmentToExport = typeof(environments[currentEnvironment]) === 'object' ? environments[currentEnvironment] : environments.staging;

// Export the module
module.exports = environmentToExport;
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const createStats = require('./helpers/create-stats');

module.exports = (options, plugins) => {
  let config = {};
  const cache = {};
  const stats = createStats();
  const configFile = options.config || '.npcheck.json';

  try {
    // load config data from file
    const configData = fs.readFileSync(
      path.resolve(process.cwd(), configFile),
      { encoding: 'utf-8' }
    );

    // parse data into JS object
    config = JSON.parse(configData);
    console.log('\n🖖 NPCheck config loaded.');
  } catch (e) {
    console.log(chalk.red.bold(`\n🚫 Error loading config file: ${e}\n`));
    process.exit(1);
  }

  const start = async () => {
    // iterate through defined modules
    for await (const pkg of config.modules) {
      console.log(
        chalk.bold(
        `\n🧪 ==== Running checks on ${chalk.cyan.bold(
          `${pkg.name}`
        )} package ====`
        )
      );

      for await (const plugin of plugins) {
        const result = await plugin(pkg, config, options, cache);
        stats.errors += result.errors;
        stats.warnings += result.warnings;
        stats.logs = [...stats.logs, ...result.logs];
      }
    }
    return stats;
  };

  return { start };
};
const Plugin = require('@midgar/midgar/plugin')
const DbConfig = require('./libs/config')

/**
 * MidgarDbConfig Pluging
 * Add dbConfig service
 */
class MidgarDbConfig extends Plugin {
  /**
   * Init plugin hook
   * Add dbConfig instance on Midgar services object
   * Afet sequelize has init
   */
  async init() {
    this.pm.on('@midgar/db:afterSequelizeInit', async  args => {
      const config = new DbConfig(this.midgar)
      //load config
      await config.init()

      //add dbConfig service
      this.midgar.services.dbConfig = config
    })
  }
 
}

module.exports = MidgarDbConfig
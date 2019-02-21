
const utils = require('@midgar/utils')
const Sequelize = require('sequelize')

/**
 * DbConfig class
 * Manage configuration stored in database
 * 
 * @param {Midgar} midgar Midgar instance
 */
class DbConfig {
  constructor (midgar) {
    this.midgar = midgar
    this._configs = null
    this._configModel = midgar.services.db.models.config

    const useCache = midgar.services.cache && (midgar.config.cache.layout == undefined || midgar.config.cache.layout)
    this._cache = useCache ? midgar.services.cache : false
    this._cacheKey = '@midgar/db-config:config'
  }

  /**
   * Load config from database
   */
  async init() {
    await this._loadConfig()
  }

 /**
  * Load config from database
  * @private
  */
  async _loadConfig() {
    //if cache is enable
    if (this._cache) {
      //try to get the config from the cache
      const config = await this._cache.get(this._cacheKey)

      //if is in cache
      if (config !== null && config !== undefined) {
        //set the config
        this._configs = config
        return
      }
    }


    this._configs = {}
    //Load the default configuration from the config part
    //in the plugin.json file of each plugins
    await this._loadPluginsConfig()
    //load from the db
    await this._loadDbConfig()


    //if the cache is enable save the config in the cache
    if (this._cache) {
      await this._cache.set(this._cacheKey, this._configs)
    }
    //this.midgar.debug('Config loaded:')
    //this.midgar.debug(this._configs)
  }

  /**
   * Load the default configuration from the config part
   * in the plugin.json file of each plugins
   */
  async _loadPluginsConfig() {
    //list plugins async
    await utils.asyncMap(this.midgar.pm.plugins, async plugin => {

      //if plugin have admin config
      if (plugin.config && plugin.config.config) {      
        //list plugins async
        await utils.asyncMap(plugin.config.config, async (value, code) => {
          this._configs[code] = {value: value}
        })
      }
    })
  }

  /**
   * Load config from db
   */
  async _loadDbConfig() {
    //dont trow exception for the case where the database is not installed
    try {
      //get config from db
      const configs = await this._configModel.findAll({})
      //set the config on an object
      await utils.asyncMap(configs, config => {
        this._configs[config.code] = {id: config.id, value: config.value}
      })
    } catch (error) {

    }
  }

  async get(code) {
    if (this._configs[code] !== undefined) {
      return this._configs[code].value
    }

    return null
  }

  async set(code, value , save = true) {
    if (this._configs == null) {
      this._configs = {}
    }
    if (this._configs[code] != undefined) {
      //if value change
      if (this._configs[code].value != value) {
        this._configs[code].value = value
      //prevent save unchanged value
      } else if (save) {
        save = false
      }
    } else {
      this._configs[code] = {value}
    }
    
    if (save) {
      try {
        const id = this._configs[code].id ? this._configs[code].id : null
        //save the config in the db
        await this._saveConfig(code, value, id)
        //if the cache is enable save the config in the cache
        if (this._cache) {
          //try to get the config from the cache
          let config = await this._cache.get(this._cacheKey)

          //add config
          if (config !== null && config !== undefined) {
            config[code] = this._configs[code]
          } else { 
            config = this._configs
          }

          //update config objet from cache
          //commented because this cause some bugs
         //this._configs = config

          //save cache
          await this._cache.set(this._cacheKey, config)
        }
      } catch (error) {
        throw error
      }
    }
  }

  async _saveConfig(code, value, id = null) {
    if (!id) {
      try {
        const config = await this._configModel.create({code, value})
        this._configs[code].id = config.id
      } catch (error) {
        this.midgar.error(error)
      }
     
    } else {
      await this._configModel.update({code, value}, {where: {id: {[Sequelize.Op.eq]: id}}})
    }
  }

}

module.exports = DbConfig

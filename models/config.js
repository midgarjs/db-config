module.exports = (sequelize, DataTypes) => {
  const Config = sequelize.define('config', {
    code: {type: DataTypes.STRING, unique: true, allowNull: false},
    value: {type: DataTypes.TEXT, allowNull: true},
    
  },{
    tableName: 'config'
  })
  return Config
}
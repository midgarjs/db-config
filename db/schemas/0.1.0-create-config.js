module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('config', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      code: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      value: {
        type: Sequelize.TEXT
      },
    },
    {
      charset: 'utf8',
      collate: 'utf8_general_ci',
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('config')
  }
}
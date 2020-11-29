module.exports = (sequelize, Sequelize) => {
  const News = sequelize.define(
    'news',
    {
      id: {
        type: Sequelize.INTEGER,
        field: 'id', 
        autoIncrement: true,
        primaryKey: true
      },
      topic: {
        type: Sequelize.STRING,
        field: 'topic'
      },
      description1: {
        type: Sequelize.STRING,
        field: 'description1'
      },
      description2: {
        type: Sequelize.STRING,
        field: 'description2'
      },
      image: {
        type: Sequelize.STRING,
        field: 'image'
      },
      author: {
        type: Sequelize.STRING,
        field: 'author'
      },
      create_dttm: {
        type: 'TIMESTAMP',
        field: 'create_dttm',
        allowNull: true
      },
      update_dttm: {
        type: 'TIMESTAMP',
        field: 'update_dttm',
        allowNull: true
      }
    },
    {
      timestamps: false,
      freezeTableName: true
    }
  );
  return News;
};
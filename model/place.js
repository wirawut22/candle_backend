module.exports = (sequelize, Sequelize) => {
  const Place = sequelize.define(
    'place',
    {
      id: {
        type: Sequelize.INTEGER,
        field: 'id',
        autoIncrement: true,
        primaryKey: true
      },
      group_id: {
        type: Sequelize.INTEGER,
        field: 'group_id'
      },
      topic: {
        type: Sequelize.STRING,
        field: 'topic'
      },
      address: {
        type: Sequelize.STRING,
        field: 'address'
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
      latitude: {
        type: Sequelize.STRING,
        field: 'latitude'
      },
      longtitude: {
        type: Sequelize.STRING,
        field: 'longtitude'
      },
      author: {
        type: Sequelize.STRING,
        field: 'author'
      },
      create_dttm: {
        type: 'TIMESTAMP',
        field: 'create_dttm',
        allowNull: false 
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
  return Place;
};
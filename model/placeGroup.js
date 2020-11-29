module.exports = (sequelize, Sequelize) => {
  const PlaceGroup = sequelize.define(
    'place_group',
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
      description: {
        type: Sequelize.STRING,
        field: 'description'
      }, 
      icon: {
        type: Sequelize.STRING,
        field: 'icon'
      }, 
      context_path: {
        type: Sequelize.STRING,
        field: 'context_path'
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
  return PlaceGroup;
};
module.exports = (sequelize, Sequelize) => {
  const Reserve = sequelize.define(
    'reserve',
    {
      id: {
        type: Sequelize.INTEGER,
        field: 'id',
        autoIncrement: true,
        primaryKey: true
      },
      zone_id: {
        type: Sequelize.INTEGER,
        field: 'zone_id'
      }, 
      title: {
        type: Sequelize.STRING,
        field: 'title'
      }, 
      first_name: {
        type: Sequelize.STRING,
        field: 'first_name'
      }, 
      last_name: {
        type: Sequelize.STRING,
        field: 'last_name'
      }, 
      mobile: {
        type: Sequelize.STRING,
        field: 'mobile'
      }, 
      amount: {
        type: Sequelize.INTEGER,
        field: 'amount'
      },
      status: {
        type: Sequelize.STRING,
        field: 'status'
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
  return Reserve;
};
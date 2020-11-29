module.exports = (sequelize, Sequelize) => {
  const Zone = sequelize.define(
    'zone',
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
      amount: {
        type: Sequelize.INTEGER,
        field: 'amount'
      },
      booked: {
        type: Sequelize.INTEGER,
        field: 'booked'
      },
      empty_seat: {
        type: Sequelize.INTEGER,
        field: 'empty_seat'
      },
      status: {
        type: Sequelize.STRING,
        field: 'status'
      },
      create_dttm: {
        type: 'TIMESTAMP',
        field: 'create_dttm',
        allowNull: false,
        defaultValue: Sequelize.NOW
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
  return Zone;
};
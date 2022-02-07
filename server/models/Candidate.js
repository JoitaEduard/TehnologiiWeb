const sequelize = require('../sequelize');
const DataTypes = require('sequelize');

const Candidate = sequelize.define('candidate', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true
    },
    nume: {
        type: DataTypes.STRING,
        validate: {
            min: 5
        }
    },
    cv: {
        type: DataTypes.STRING,
        validate: {
            min: 100
        }
    },
    email: {
        type: DataTypes.STRING,
        validate: {
            isEmail: true
        }
    }
})

module.exports = Candidate;
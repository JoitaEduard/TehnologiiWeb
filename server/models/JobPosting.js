const sequelize = require('../sequelize');
const DataTypes = require('sequelize');

const JobPosting = sequelize.define('jobPosting', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true
    },
    descriere: {
        type: DataTypes.STRING,
        validate: {
            min: 3
        }
    },
    deadline: {
        type: DataTypes.DATE,
    }
});

module.exports = JobPosting;
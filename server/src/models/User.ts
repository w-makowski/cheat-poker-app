import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "./index";

interface UserAttributes {
    id: number;
    username: string;
    email: string;
    auth0Id: string;
    createdAt?: Date;
    updatedAt?: Date;
    role: 'user' | 'admin';
    accountStatus: 'active' | 'banned';
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id'> {}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
    public id!: number;
    public username!: string;
    public email!: string;
    public auth0Id!: string;
    public role!: 'user' | 'admin';
    public accountStatus!: 'active' | 'banned';

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

User.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    auth0Id: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    role: {
        type: DataTypes.ENUM('user', 'admin'),
        allowNull: false,
        defaultValue: 'user'
    },
    accountStatus: {
        type: DataTypes.ENUM('active', 'banned'),
        allowNull: false,
        defaultValue: 'active'
    }
}, {
    sequelize,
    modelName: 'User',
    tableName: 'users'
});

export default User;

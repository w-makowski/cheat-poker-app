import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from './index';

interface GameAttributes {
  id: number;
  name: string;
  status: 'waiting' | 'active' | 'finished';
  currentTurn: number;
  maxPlayers: number;
  numberOfDecks: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface GameCreationAttributes extends Optional<GameAttributes, 'id'> {}

class Game extends Model<GameAttributes, GameCreationAttributes> implements GameAttributes {
  public id!: number;
  public name!: string;
  public status!: 'waiting' | 'active' | 'finished';
  public currentTurn!: number;
  public maxPlayers!: number;
  public numberOfDecks!: number;
  
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Game.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('waiting', 'active', 'finished'),
    allowNull: false,
    defaultValue: 'waiting'
  },
  currentTurn: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  maxPlayers: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 8,
  },
  numberOfDecks: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  }
}, {
  sequelize,
  modelName: 'Game',
  tableName: 'games'
});

export default Game;

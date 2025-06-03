import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from './index';
import User from './User';
import Game from './Game';

interface PlayerAttributes {
  id: number;
  userId: number;
  gameId: number;
  position: number;
  cardsCount: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  isHost: boolean
}

interface PlayerCreationAttributes extends Optional<PlayerAttributes, 'id'> {}

class Player extends Model<PlayerAttributes, PlayerCreationAttributes> implements PlayerAttributes {
  public id!: number;
  public userId!: number;
  public gameId!: number;
  public position!: number;
  public cardsCount!: number;
  public isActive!: boolean;
  public isHost!: boolean;
  
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Player.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  gameId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Game,
      key: 'id'
    }
  },
  position: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  cardsCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  isHost: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  }
}, {
  sequelize,
  modelName: 'Player',
  tableName: 'players'
});

// Relations
User.hasMany(Player, { foreignKey: 'userId' });
Player.belongsTo(User, { foreignKey: 'userId' });

Game.hasMany(Player, { foreignKey: 'gameId' });
Player.belongsTo(Game, { foreignKey: 'gameId' });

export default Player;

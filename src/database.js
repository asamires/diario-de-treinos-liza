import { Sequelize, DataTypes } from 'sequelize';

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './banco.sqlite',
  logging: false
});

sequelize.addHook('afterConnect', async (connection) => {
  await new Promise((resolve, reject) => {
    connection.run('PRAGMA journal_mode = WAL;', (err) => (err ? reject(err) : resolve()));
  });
});

const Usuario = sequelize.define('Usuario', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  nome: {
    type: DataTypes.STRING(80),
    allowNull: false
  },
  dataNascimento: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  user: {
    type: DataTypes.STRING(30),
    allowNull: false,
    unique: true
  },
  email: {
    type: DataTypes.STRING(120),
    allowNull: false,
    unique: true,
    validate: { isEmail: true }
  },
  senha: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

const Treino = sequelize.define('Treino', {
  nome: { type: DataTypes.STRING, allowNull: false },
  tipo: { type: DataTypes.STRING, allowNull: false },
  duracao: { type: DataTypes.INTEGER, allowNull: true },
  distancia: { type: DataTypes.FLOAT, allowNull: true }
});

const Serie = sequelize.define('Serie', {
  repeticoes: { type: DataTypes.INTEGER, allowNull: false },
  carga: { type: DataTypes.FLOAT, allowNull: false }
});

// Relacionamentos
Usuario.hasMany(Treino, { as: 'treinos', onDelete: 'CASCADE' });
Treino.belongsTo(Usuario);

Treino.hasMany(Serie, { as: 'series', onDelete: 'CASCADE' });
Serie.belongsTo(Treino);

export { sequelize, Usuario, Treino, Serie };

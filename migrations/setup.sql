CREATE TABLE IF NOT EXISTS Usuario (
  id serial NOT NULL PRIMARY KEY UNIQUE,
  carteira double precision NOT NULL,
  privacidade_do_perfil boolean NOT NULL,
  cpf varchar(256) NOT NULL UNIQUE,
  nome varchar(256) NOT NULL,
  email varchar(256) NOT NULL
);

CREATE TABLE IF NOT EXISTS "time" (
  id serial NOT NULL PRIMARY KEY UNIQUE,
  nome varchar(256) NOT NULL,
  numero_de_resenhas int8
);

CREATE TABLE IF NOT EXISTS Jogo (
  id serial NOT NULL PRIMARY KEY UNIQUE,
  "local" varchar(256) NOT NULL,
  data_horario TIMESTAMP NOT NULL,
  timeA integer NOT NULL,
  timeB integer NOT NULL,
  campeonato varchar(256),
  numero_de_resenhas integer NOT NULL,

  CONSTRAINT fk_timeA
      FOREIGN KEY(timeA) 
	      REFERENCES "time"(id),
  CONSTRAINT fk_timeB
      FOREIGN KEY(timeB) 
	      REFERENCES "time"(id)
);

CREATE TABLE IF NOT EXISTS Apostas (
  id serial NOT NULL PRIMARY KEY UNIQUE,
  valor double precision NOT NULL,
  tipo varchar(256) NOT NULL,
  lucro_ou_perda varchar(256) NOT NULL,
  usuario integer NOT NULL,
  jogo integer NOT NULL,
  "data" timestamp NOT NULL,

  CONSTRAINT fk_usuario
      FOREIGN KEY(usuario) 
	      REFERENCES Usuario(id),
  CONSTRAINT fk_jogo
    FOREIGN KEY(jogo) 
      REFERENCES Jogo(id)
);

CREATE TABLE IF NOT EXISTS Jogador (
  id serial NOT NULL PRIMARY KEY UNIQUE,
  nome varchar(256) NOT NULL,
  data_de_nascimento DATE NOT NULL,
  local_de_nascimento varchar(256),
  numero_de_resenhas int8,
  altura integer,
  peso decimal,
  "time" integer,
  CONSTRAINT fk_time
      FOREIGN KEY("time")
	      REFERENCES "time"(id)
);

CREATE TABLE IF NOT EXISTS Deposito (
  id serial NOT NULL PRIMARY KEY UNIQUE,
  valor double precision,
  usuario integer,

  CONSTRAINT fk_usuario
      FOREIGN KEY(usuario) 
	      REFERENCES Usuario(id)
);

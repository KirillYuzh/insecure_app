

--                     СОЗДАНИЕ БД


CREATE TYPE user_status AS ENUM ('active', 'banned', 'deleted');
CREATE TYPE user_role AS ENUM ('user', 'admin');
CREATE TYPE request_status AS ENUM ('pending', 'approved', 'rejected');

----

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(100),
    password_hash VARCHAR(200) NOT NULL,
    role user_role NOT NULL DEFAULT 'user',
    score INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    status user_status NOT NULL DEFAULT 'active'
);


CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(100) NOT NULL UNIQUE,
    invite_link UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
    score INT DEFAULT 0,
    captain_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE c_users_teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, team_id)
);


CREATE TABLE team_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    status request_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (team_id, user_id)
);


CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    weight INT DEFAULT 0,
    category VARCHAR(50),
    active BOOLEAN DEFAULT TRUE,
    flag_hash VARCHAR(200) NOT NULL,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE c_user_task_solutions (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    is_solved BOOLEAN NOT NULL DEFAULT FALSE,
    solved_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, task_id)
);

----                       ФУНКЦИИ


-- USERS

-- Получить email по id
CREATE OR REPLACE FUNCTION get_user_email_by_id(p_user_id UUID)
RETURNS VARCHAR AS $$
    SELECT email FROM users WHERE id = p_user_id;
$$ LANGUAGE SQL;

-- Получить password_hash по id
CREATE OR REPLACE FUNCTION get_user_password_hash_by_id(p_user_id UUID)
RETURNS VARCHAR AS $$
    SELECT password_hash FROM users WHERE id = p_user_id;
$$ LANGUAGE SQL;

-- Получить статус пользователя
CREATE OR REPLACE FUNCTION get_user_status_by_id(p_user_id UUID)
RETURNS user_status AS $$
    SELECT status FROM users WHERE id = p_user_id;
$$ LANGUAGE SQL;

-- Получить роль пользователя
CREATE OR REPLACE FUNCTION get_user_role_by_id(p_user_id UUID)
RETURNS user_role AS $$
    SELECT role FROM users WHERE id = p_user_id;
$$ LANGUAGE SQL;


-- TASKS

-- Получить flag_hash по id таска
CREATE OR REPLACE FUNCTION get_task_flag_hash_by_id(p_task_id UUID)
RETURNS VARCHAR AS $$
    SELECT flag_hash FROM tasks WHERE id = p_task_id;
$$ LANGUAGE SQL;


-- TEAMS

-- Получить invite_link по id команды
CREATE OR REPLACE FUNCTION get_team_invite_link_by_id(p_team_id UUID)
RETURNS UUID AS $$
    SELECT invite_link FROM teams WHERE id = p_team_id;
$$ LANGUAGE SQL;
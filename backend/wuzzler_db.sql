CREATE EXTENSION "uuid-ossp";

CREATE TABLE users(
    id              serial      primary key,
    name            text        not null unique,
    passwd          text        not null,
    sign_up         timestamptz not null default now(),
    cookie          text        not null default uuid_generate_v4()
);

CREATE TABLE games(
    id              serial      primary key,
    timestamp       timestamptz not null   default now(),
    id_red          integer     references users(id),
    id_blue         integer     references users(id),
    goals_red       integer     not null,
    goals_blue      integer     not null,
    points_red2blue integer     not null
);

CREATE OR REPLACE VIEW v_users as(
    select name, sign_up, cookie
      from users
);

CREATE OR REPLACE FUNCTION login(p_name text, p_passwd text)
returns setof v_users
AS
$BODY$
    select name, sign_up, cookie
      from users
     where name = $1
       and passwd = md5($2);
$BODY$
language sql;

CREATE OR REPLACE FUNCTION get_user(p_cookie text)
returns setof v_users
AS
$BODY$
    select name, sign_up, cookie
      from users
     where cookie =$1;
$BODY$
language sql;


CREATE OR REPLACE FUNCTION register(p_name text, p_passwd text)
returns setof v_users
AS
$BODY$
    insert into users(name, passwd)
    values ($1, md5($2))
    returning name, sign_up, cookie ;
$BODY$
language sql;

CREATE OR REPLACE FUNCTION get_score(p_user_id integer)
returns bigint
AS
$BODY$
    select coalesce(sum(
        case
            when games.id_red   = $1 then -points_red2blue
            when games.id_blue  = $1 then points_red2blue
        end), 0)+100
      from games
     where games.id_red = $1
        or games.id_blue = $1

$BODY$
language sql;

CREATE OR REPLACE FUNCTION add_game(p_red text, p_blue text, p_red_goals integer, p_blue_goals integer)
returns games
AS
$BODY$
    with w_users as(
         select red.id as id_red,
                blue.id as id_blue,
                (get_score(blue.id) * $3 ) /100 as points_red,
                (get_score(red.id)  * $4 ) /100 as points_blue
           from users blue
     cross join users red
          where blue.name = $2
            and red.name  = $1
    )

    insert into games(
        id_red,
        id_blue,
        goals_red,
        goals_blue,
        points_red2blue
    )
    select id_red,
           id_blue,
           $3,
           $4,
           points_blue - points_red
      from w_users
     returning *
$BODY$
language sql;

CREATE OR REPLACE view v_top
AS
with w_games as (
    select
        name,
        timestamp,
        goals_red as goals_player,
        goals_blue as goals_opponent,
        -points_red2blue as points,
        'red' as team
    from games
    right join users on users.id = games.id_red
union all
    select
        name,
        timestamp,
        goals_blue as goals_player,
        goals_red  as goals_opponent,
        points_red2blue as points,
        'blue' as team
    from games
    join users on users.id = games.id_blue
)
    select rank() over(ORDER BY coalesce(sum(points), 0) desc) as rank,
           name,
           coalesce(sum(points), 0)+100 as score,
           count(timestamp) as played,
           count((case when goals_player>goals_opponent then true end)) as won,
           count((case when goals_player<goals_opponent then true end)) as lost
    from w_games
    group by name
    order by coalesce(sum(points), 0) desc
;

CREATE OR REPLACE FUNCTION f_top(p_time text)
returns setof v_top
AS
$BODY$
with w_games as (
    select
        name,
        timestamp,
        goals_red as goals_player,
        goals_blue as goals_opponent,
        -points_red2blue as points,
        'red' as team
    from games
    join users on users.id = games.id_red
    where timestamp > date_trunc($1, now())
union all
    select
        name,
        timestamp,
        goals_blue as goals_player,
        goals_red  as goals_opponent,
        points_red2blue as points,
        'blue' as team
    from games
    join users on users.id = games.id_blue
    where timestamp > date_trunc($1, now())
)
    select rank() over(ORDER BY coalesce(sum(points), 0) desc) as rank,
           name,
           coalesce(sum(points), 0) as score,
           count(*) as played,
           count((case when goals_player>goals_opponent then true end)) as won,
           count((case when goals_player<goals_opponent then true end)) as lost
    from w_games
    group by name
    order by coalesce(sum(points), 0) desc
;

$BODY$
language sql;

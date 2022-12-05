create type user_role_enum as enum ('client', 'admin');

alter type user_role_enum owner to postgres;

create table if not exists "user"
(
    id             uuid           default uuid_generate_v4()       not null
        constraint "PK_cace4a159ff9f2512dd42373760"
            primary key,
    name           varchar                                         not null,
    email          varchar                                         not null
        constraint "UQ_e12875dfb3b1d92d7d7c5377e22"
            unique,
    "passwordHash" varchar                                         not null,
    role           user_role_enum default 'client'::user_role_enum not null
);

alter table "user"
    owner to postgres;

create table if not exists device
(
    id                     uuid default uuid_generate_v4() not null
        constraint "PK_2dc10972aa4e27c01378dad2c72"
            primary key,
    description            varchar                         not null,
    address                varchar                         not null,
    "maxHourlyConsumption" integer                         not null,
    name                   varchar                         not null
);

alter table device
    owner to postgres;

create table if not exists consumption
(
    id         uuid default uuid_generate_v4() not null
        constraint "PK_90c8f17309014e5d0f244767367"
            primary key,
    timestamp  timestamp                       not null,
    value      integer                         not null,
    "deviceId" uuid
        constraint "FK_d7cf3083a52e67a1b6a77b65dbe"
            references device
);

alter table consumption
    owner to postgres;

create table if not exists user_devices_device
(
    "userId"   uuid not null
        constraint "FK_59cb70befbb0f464cf4991d3ddd"
            references "user"
            on update cascade on delete cascade,
    "deviceId" uuid not null
        constraint "FK_657c293e81b67466e61cabee788"
            references device,
    constraint "PK_b93d16dba5252c8d7221da38638"
        primary key ("userId", "deviceId")
);

alter table user_devices_device
    owner to postgres;

create index if not exists "IDX_59cb70befbb0f464cf4991d3dd"
    on user_devices_device ("userId");

create index if not exists "IDX_657c293e81b67466e61cabee78"
    on user_devices_device ("deviceId");

create or replace function uuid_nil() returns uuid
    immutable
    strict
    parallel safe
    language c
as
$$
begin
-- missing source code
end;
$$;

alter function uuid_nil() owner to postgres;

create or replace function uuid_ns_dns() returns uuid
    immutable
    strict
    parallel safe
    language c
as
$$
begin
-- missing source code
end;
$$;

alter function uuid_ns_dns() owner to postgres;

create or replace function uuid_ns_url() returns uuid
    immutable
    strict
    parallel safe
    language c
as
$$
begin
-- missing source code
end;
$$;

alter function uuid_ns_url() owner to postgres;

create or replace function uuid_ns_oid() returns uuid
    immutable
    strict
    parallel safe
    language c
as
$$
begin
-- missing source code
end;
$$;

alter function uuid_ns_oid() owner to postgres;

create or replace function uuid_ns_x500() returns uuid
    immutable
    strict
    parallel safe
    language c
as
$$
begin
-- missing source code
end;
$$;

alter function uuid_ns_x500() owner to postgres;

create or replace function uuid_generate_v1() returns uuid
    strict
    parallel safe
    language c
as
$$
begin
-- missing source code
end;
$$;

alter function uuid_generate_v1() owner to postgres;

create or replace function uuid_generate_v1mc() returns uuid
    strict
    parallel safe
    language c
as
$$
begin
-- missing source code
end;
$$;

alter function uuid_generate_v1mc() owner to postgres;

create or replace function uuid_generate_v3(namespace uuid, name text) returns uuid
    immutable
    strict
    parallel safe
    language c
as
$$
begin
-- missing source code
end;
$$;

alter function uuid_generate_v3(uuid, text) owner to postgres;

create or replace function uuid_generate_v4() returns uuid
    strict
    parallel safe
    language c
as
$$
begin
-- missing source code
end;
$$;

alter function uuid_generate_v4() owner to postgres;

create or replace function uuid_generate_v5(namespace uuid, name text) returns uuid
    immutable
    strict
    parallel safe
    language c
as
$$
begin
-- missing source code
end;
$$;

alter function uuid_generate_v5(uuid, text) owner to postgres;



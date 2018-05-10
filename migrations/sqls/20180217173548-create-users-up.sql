-- Sql for transforming into the new state
drop schema public cascade;
create schema public;

SET statement_timeout = 0;
--SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;

--
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner:
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner:
--

-- COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner:
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner:
--

-- COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


SET search_path = public, pg_catalog;

SET default_tablespace = '';

SET default_with_oids = false;

BEGIN;

CREATE TABLE users (
  id character varying(128) DEFAULT uuid_generate_v4() NOT NULL,
  login character varying NOT NULL,
  password character varying NOT NULL,
  role character varying NOT NULL,
  "firstName" character varying NOT NULL,
  "lastName" character varying,
  "middleName" character varying,
  email character varying,
  phone character varying NOT NULL,
  province character varying,
  city character varying,
  district character varying,
  address character varying,
  "createdAt" timestamp with time zone,
  "updatedAt" timestamp with time zone,
  active boolean DEFAULT true NOT NULL
);

ALTER TABLE ONLY users
  ADD CONSTRAINT users_pkey PRIMARY KEY (id);

ALTER TABLE ONLY users
  ADD CONSTRAINT users_login_key UNIQUE (login);

INSERT INTO users (id, login,"firstName", password, role, phone, "createdAt", "updatedAt")
VALUES (1, 'admin', 'Administrator', '$2a$08$8/sQarmhc1WMkZluOvungemNum2lHoZ.T7iznS66qEKmK/p8bJoF6', 'admin', '1111111111', null, null);

COMMIT;

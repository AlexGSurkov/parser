CREATE TABLE containers (
  id character varying(128) DEFAULT uuid_generate_v4() NOT NULL,
  "userId" character varying(128) NOT NULL,
  number character varying(128) NOT NULL,
  line character varying(50) NOT NULL,
  type character varying(50) NOT NULL,
  "billOfLadingNumber" character varying(128) DEFAULT '' NOT NULL,
  eta jsonb DEFAULT '{}'::jsonb NOT NULL,
  "currentState" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "createdAt" timestamp with time zone,
  "updatedAt" timestamp with time zone
);

ALTER TABLE ONLY containers
  ADD CONSTRAINT containers_pkey PRIMARY KEY (id);

ALTER TABLE ONLY containers
  ADD CONSTRAINT containers_key UNIQUE ("userId", number);

CREATE TABLE locations (
  id character varying(128) DEFAULT uuid_generate_v4() NOT NULL,
  "containerId" character varying(128) NOT NULL,
  number character varying(128) NOT NULL,
  location character varying NOT NULL,
  states jsonb DEFAULT '[]'::jsonb NOT NULL,
  "createdAt" timestamp with time zone,
  "updatedAt" timestamp with time zone
);

ALTER TABLE ONLY locations
  ADD CONSTRAINT locations_pkey PRIMARY KEY (id);

ALTER TABLE ONLY locations
  ADD CONSTRAINT locations_containerId_fkey FOREIGN KEY ("containerId")
    REFERENCES containers (id) MATCH SIMPLE;

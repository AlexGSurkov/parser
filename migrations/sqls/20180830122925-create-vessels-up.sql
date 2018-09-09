CREATE TABLE vessels (
  imo character varying(20) NOT NULL,
  name character varying(100) NOT NULL,
  line character varying(50),
  "createdAt" timestamp with time zone,
  "updatedAt" timestamp with time zone
);

ALTER TABLE ONLY vessels
  ADD CONSTRAINT vessels_pkey PRIMARY KEY (imo);

CREATE INDEX vessels_name ON vessels(name);

CREATE TABLE tracking (
  id character varying(128) DEFAULT uuid_generate_v4() NOT NULL,
  imo character varying(20) NOT NULL,
  mmsi character varying(20) NOT NULL,
  lat character varying(50),
  lon character varying(50),
  speed character varying(5),
  heading character varying(5),
  course character varying(5),
  status character varying(5),
  "timestamp" timestamp with time zone,
  dsrc character varying(5),
  "createdAt" timestamp with time zone,
  "updatedAt" timestamp with time zone
);

ALTER TABLE ONLY tracking
  ADD CONSTRAINT tracking_pkey PRIMARY KEY (id);

ALTER TABLE ONLY tracking
  ADD CONSTRAINT tracking_imo_fkey FOREIGN KEY ("imo")
    REFERENCES vessels (imo) MATCH SIMPLE;

CREATE TABLE logging (
  id character varying(128) DEFAULT uuid_generate_v4() NOT NULL,
  module character varying(50) NOT NULL,
  action character varying(50),
  msg character varying NOT NULL,
  "createdAt" timestamp with time zone,
  "updatedAt" timestamp with time zone
);

ALTER TABLE ONLY logging
  ADD CONSTRAINT logging_pkey PRIMARY KEY (id);

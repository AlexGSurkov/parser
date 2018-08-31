CREATE TABLE vessels (
  imo character varying NOT NULL,
  name character varying NOT NULL,
  line character varying(50),
  "createdAt" timestamp with time zone,
  "updatedAt" timestamp with time zone
);

ALTER TABLE ONLY vessels
  ADD CONSTRAINT vessels_pkey PRIMARY KEY (imo);

CREATE INDEX vessels_name ON vessels(name);

do $$
declare
  selectrow record;
begin
  for selectrow in
  select
    'UPDATE '||quote_ident(c.table_name)||' SET '||quote_ident(c.COLUMN_NAME)||'=TRIM(both from '||quote_ident(c.COLUMN_NAME)||')  WHERE '||quote_ident(c.COLUMN_NAME)||' ILIKE ''% '' ' as script
  from (
         select
           table_name,COLUMN_NAME
         from
           INFORMATION_SCHEMA.COLUMNS
         where
           table_name LIKE 'intrist_%'  and (data_type='text' or data_type='character varying' )
       ) c
  loop
    execute selectrow.script;
  end loop;
end;
$$;
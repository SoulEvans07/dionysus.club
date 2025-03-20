-- Custom SQL migration file, put you code below! --

-- Based on https://github.com/drizzle-team/drizzle-orm/issues/956#issuecomment-1732327425 --
CREATE OR REPLACE FUNCTION on_row_update_set_updated_at() RETURNS trigger
    LANGUAGE plpgsql AS
$$
BEGIN
    NEW."updated_at" = now();
    return NEW;
END;
$$;

CREATE OR REPLACE FUNCTION on_create_table_add_trigger_on_row_update_set_updated_at() RETURNS event_trigger
    LANGUAGE plpgsql AS
$$
DECLARE
    obj      record;
    tbl_name text;
BEGIN
    for obj in select * from pg_event_trigger_ddl_commands() where object_type = 'table'
        loop
            tbl_name := obj.objid::regclass;
            if exists(select 1
                      from information_schema.columns
                      where table_schema = obj.schema_name
                        and table_name = tbl_name
                        and column_name = 'updated_at') then
                execute format(
                        'create or replace trigger on_row_update_set_updated_at before update on %I for each row execute procedure on_row_update_set_updated_at();',
                        tbl_name);
            end if;
        end loop;
END
$$;

CREATE EVENT trigger
    on_create_table_add_trigger_on_row_update_set_updated_at ON ddl_command_end
    WHEN tag IN ('CREATE TABLE', 'CREATE TABLE AS')
EXECUTE PROCEDURE on_create_table_add_trigger_on_row_update_set_updated_at();

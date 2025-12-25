-- Clean up Ninja Forms database entries

-- Remove all options starting with ninja_forms_ or nf_
DELETE FROM wp_options WHERE option_name LIKE 'ninja_forms_%' OR option_name LIKE 'nf_%';

-- Remove post meta entries
DELETE FROM wp_postmeta WHERE meta_key = 'ninja_forms_form';

-- Remove widget instances (check all widget options)
DELETE FROM wp_options WHERE option_name LIKE 'widget_ninja_forms%';

-- Drop custom tables if they exist (Ninja Forms v3 tables)
DROP TABLE IF EXISTS wp_nf3_actions;
DROP TABLE IF EXISTS wp_nf3_action_meta;
DROP TABLE IF EXISTS wp_nf3_chunks;
DROP TABLE IF EXISTS wp_nf3_fields;
DROP TABLE IF EXISTS wp_nf3_field_meta;
DROP TABLE IF EXISTS wp_nf3_forms;
DROP TABLE IF EXISTS wp_nf3_form_meta;
DROP TABLE IF EXISTS wp_nf3_objects;
DROP TABLE IF EXISTS wp_nf3_object_meta;
DROP TABLE IF EXISTS wp_nf3_relationships;
DROP TABLE IF EXISTS wp_nf3_upgrades;


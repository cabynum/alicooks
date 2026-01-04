-- Enable Realtime for dishes and meal_plans tables
-- 
-- Supabase Realtime requires tables to be added to the `supabase_realtime` publication
-- before they can broadcast INSERT/UPDATE/DELETE events via WebSocket.
--
-- Without this, the WebSocket subscription will connect successfully, but no events
-- will be received when data changes.

-- Add dishes table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE dishes;

-- Add meal_plans table to realtime publication  
ALTER PUBLICATION supabase_realtime ADD TABLE meal_plans;

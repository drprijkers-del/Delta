-- Allow anonymous users to submit wishes (creates backlog items in 'review' status)
-- Run this in Supabase SQL Editor

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "backlog_items_anon_insert_wish" ON backlog_items;

-- Allow anonymous inserts but only for items with status='review' and no decision
CREATE POLICY "backlog_items_anon_insert_wish" ON backlog_items
  FOR INSERT
  TO anon
  WITH CHECK (
    status = 'review' AND decision IS NULL
  );

-- Grant insert permission to anon
GRANT INSERT ON backlog_items TO anon;

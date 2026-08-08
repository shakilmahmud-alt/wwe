-- ========================================================
-- WWE UNIVERSE MANAGER - SUPABASE DATABASE SCHEMA (FULL)
-- ========================================================

-- 1. Main JSON Save Table (Stores complete AppState JSON)
CREATE TABLE IF NOT EXISTS public.wwe_universe_data (
    id TEXT PRIMARY KEY DEFAULT 'main_save',
    data JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Superstars Table (Relational sync with Tier including 'Women Tag Team')
CREATE TABLE IF NOT EXISTS public.superstars (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    brand TEXT NOT NULL,
    tier TEXT NOT NULL CHECK (tier IN ('Top', 'Middle', 'Low', 'Female', 'Tag Team', 'Women Tag Team')),
    overall_rating INTEGER DEFAULT 85,
    title_held TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Update check constraint if table already exists
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'superstars_tier_check'
    ) THEN
        ALTER TABLE public.superstars DROP CONSTRAINT superstars_tier_check;
    END IF;
    
    ALTER TABLE public.superstars 
    ADD CONSTRAINT superstars_tier_check 
    CHECK (tier IN ('Top', 'Middle', 'Low', 'Female', 'Tag Team', 'Women Tag Team'));
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- 3. Women's Tag Teams Table
CREATE TABLE IF NOT EXISTS public.women_tag_teams (
    id TEXT PRIMARY KEY,
    team_name TEXT NOT NULL,
    brand TEXT DEFAULT 'RAW',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Active Champions & Championships Tables
CREATE TABLE IF NOT EXISTS public.champions (
    id TEXT PRIMARY KEY,
    title_name TEXT NOT NULL,
    brand TEXT NOT NULL,
    current_champion TEXT NOT NULL,
    days_held INTEGER DEFAULT 0,
    defenses INTEGER DEFAULT 0,
    previous_champion TEXT,
    acquired_date TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.championships (
    id TEXT PRIMARY KEY,
    title_name TEXT NOT NULL,
    brand TEXT NOT NULL,
    current_champion TEXT NOT NULL,
    days_held INTEGER DEFAULT 0,
    defenses INTEGER DEFAULT 0,
    previous_champion TEXT,
    acquired_date TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Calendar Events / PLE Schedule Table
CREATE TABLE IF NOT EXISTS public.calendar_events (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    month TEXT NOT NULL,
    date_str TEXT NOT NULL,
    type TEXT DEFAULT 'PPV',
    brand TEXT NOT NULL,
    arena TEXT,
    main_event TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Rivalries Table
CREATE TABLE IF NOT EXISTS public.rivalries (
    id TEXT PRIMARY KEY,
    name TEXT,
    brand TEXT NOT NULL,
    rival1 TEXT NOT NULL,
    rival2 TEXT NOT NULL,
    intensity TEXT DEFAULT 'Medium',
    rivalry_type TEXT DEFAULT '1v1',
    current_stage TEXT,
    winner TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Show Plans Table
CREATE TABLE IF NOT EXISTS public.show_plans (
    id TEXT PRIMARY KEY,
    brand TEXT NOT NULL,
    episode_name TEXT NOT NULL,
    show_date TEXT,
    arena TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.wwe_universe_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.superstars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.women_tag_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.champions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.championships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rivalries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.show_plans ENABLE ROW LEVEL SECURITY;

-- Create Permissive RLS Policies for Anon access
DO $$ 
BEGIN
    EXECUTE 'CREATE POLICY "Allow anon all on wwe_universe_data" ON public.wwe_universe_data FOR ALL USING (true) WITH CHECK (true)';
    EXECUTE 'CREATE POLICY "Allow anon all on superstars" ON public.superstars FOR ALL USING (true) WITH CHECK (true)';
    EXECUTE 'CREATE POLICY "Allow anon all on women_tag_teams" ON public.women_tag_teams FOR ALL USING (true) WITH CHECK (true)';
    EXECUTE 'CREATE POLICY "Allow anon all on champions" ON public.champions FOR ALL USING (true) WITH CHECK (true)';
    EXECUTE 'CREATE POLICY "Allow anon all on championships" ON public.championships FOR ALL USING (true) WITH CHECK (true)';
    EXECUTE 'CREATE POLICY "Allow anon all on calendar_events" ON public.calendar_events FOR ALL USING (true) WITH CHECK (true)';
    EXECUTE 'CREATE POLICY "Allow anon all on rivalries" ON public.rivalries FOR ALL USING (true) WITH CHECK (true)';
    EXECUTE 'CREATE POLICY "Allow anon all on show_plans" ON public.show_plans FOR ALL USING (true) WITH CHECK (true)';
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

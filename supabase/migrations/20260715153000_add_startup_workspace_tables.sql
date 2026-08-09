-- ===========================================================
-- Startup Workspace Tables
-- ===========================================================

-- ===========================================================
-- startups
-- ===========================================================

CREATE TABLE startups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    name TEXT NOT NULL,

    status TEXT NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===========================================================
-- startup_onboarding
-- ===========================================================

CREATE TABLE startup_onboarding (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    startup_id UUID NOT NULL UNIQUE
        REFERENCES startups(id) ON DELETE CASCADE,

    status TEXT NOT NULL,

    session_data JSONB NOT NULL DEFAULT '{}'::jsonb,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===========================================================
-- startup_artifacts
-- ===========================================================

CREATE TABLE startup_artifacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    startup_id UUID NOT NULL
        REFERENCES startups(id) ON DELETE CASCADE,

    folder TEXT NOT NULL,

    artifact_id TEXT NOT NULL,

    display_name TEXT NOT NULL,

    content TEXT NOT NULL,

    previous_content TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT startup_artifact_unique
        UNIQUE (startup_id, artifact_id)
);
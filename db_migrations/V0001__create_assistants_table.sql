CREATE TABLE t_p80641698_future_tech_initiati.assistants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_name TEXT NOT NULL,
    lookbook_url TEXT,
    lookbook_filename TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
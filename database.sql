DROP TABLE IF EXISTS applications;
DROP TABLE IF EXISTS vacancies;
DROP TABLE IF EXISTS candidates;

CREATE TABLE candidates (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    years_of_experience INTEGER NOT NULL CHECK (years_of_experience >= 0)
);

CREATE TABLE vacancies (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    minimum_experience INTEGER NOT NULL CHECK (minimum_experience >= 0),
    status VARCHAR(10) NOT NULL CHECK (status IN ('OPEN', 'CLOSED'))
);

CREATE TABLE applications (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    candidate_id INTEGER NOT NULL,
    vacancy_id INTEGER NOT NULL,
    cover_letter TEXT NOT NULL,
    source VARCHAR(20) NOT NULL CHECK (
        source IN ('REFERRAL', 'INTERNAL', 'JOB_BOARD', 'OTHER')
    ),
    score INTEGER NOT NULL CHECK (score >= 0),
    priority VARCHAR(10) NOT NULL CHECK (
        priority IN ('LOW', 'MEDIUM', 'HIGH', 'TOP')
    ),
    status VARCHAR(20) NOT NULL CHECK (
        status IN ('RECEIVED', 'IN_REVIEW', 'REJECTED', 'HIRED')
    ),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status_updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_application_candidate
        FOREIGN KEY (candidate_id)
        REFERENCES candidates(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_application_vacancy
        FOREIGN KEY (vacancy_id)
        REFERENCES vacancies(id)
        ON DELETE RESTRICT
);

CREATE INDEX idx_applications_candidate_vacancy
    ON applications(candidate_id, vacancy_id);

CREATE INDEX idx_applications_status
    ON applications(status);

CREATE INDEX idx_applications_vacancy
    ON applications(vacancy_id);

INSERT INTO candidates (name, email, years_of_experience)
VALUES
    ('Ana Lopez', 'ana.lopez@example.com', 5),
    ('Carlos Mendez', 'carlos.mendez@example.com', 2),
    ('Diego Perez', 'diego.perez@example.com', 4);

INSERT INTO vacancies (title, minimum_experience, status)
VALUES
    ('Backend Node.js Developer', 3, 'OPEN'),
    ('Frontend Developer', 2, 'CLOSED'),
    ('SQL Developer', 2, 'OPEN'),
    ('API Developer', 3, 'OPEN');

INSERT INTO applications (
    candidate_id,
    vacancy_id,
    cover_letter,
    source,
    score,
    priority,
    status,
    created_at,
    status_updated_at
)
VALUES
    (
        1,
        1,
        'I have five years of experience building REST APIs with Node.js and SQL databases.',
        'REFERRAL',
        9,
        'TOP',
        'RECEIVED',
        '2026-09-20 09:00:00-06',
        '2026-09-20 09:00:00-06'
    ),
    (
        2,
        1,
        'I am interested in joining your company and developing my professional skills.',
        'JOB_BOARD',
        0,
        'LOW',
        'IN_REVIEW',
        '2026-09-21 10:00:00-06',
        '2026-09-22 10:00:00-06'
    ),
    (
        3,
        1,
        'I have experience developing applications and working with Node.js.',
        'INTERNAL',
        8,
        'TOP',
        'HIRED',
        '2026-09-22 11:00:00-06',
        '2026-09-25 14:00:00-06'
    ),
    (
        1,
        2,
        'I have experience developing web applications and working with frontend technologies.',
        'OTHER',
        4,
        'MEDIUM',
        'REJECTED',
        '2026-08-01 09:00:00-06',
        '2026-08-01 16:00:00-06'
    ),
    (
        1,
        3,
        'I have five years of experience working with databases and SQL.',
        'INTERNAL',
        8,
        'TOP',
        'IN_REVIEW',
        '2026-09-23 09:00:00-06',
        '2026-09-24 10:00:00-06'
    ),
    (
        1,
        4,
        'I have experience developing backend applications.',
        'OTHER',
        4,
        'MEDIUM',
        'RECEIVED',
        '2026-09-24 09:00:00-06',
        '2026-09-24 09:00:00-06'
    ),
    (
        1,
        2,
        'I am interested in applying my development experience to this position.',
        'JOB_BOARD',
        4,
        'MEDIUM',
        'RECEIVED',
        '2026-09-15 09:00:00-06',
        '2026-09-15 09:00:00-06'
    );
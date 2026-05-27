-- =============================================================================
-- Migration: 002_seed_default_templates
-- Description: Seeds 4 system-level default templates that are available to all
--              issuers. Uses the zero-address as a sentinel wallet to distinguish
--              these from issuer-created templates.
-- =============================================================================

insert into templates (issuer_wallet, title, type, description, issuance_mode, requires_certificate, fields)
values

-- 1. Bachelor of Computer Science (Honours)
(
  '0x0000000000000000000000000000000000000000',
  'Bachelor of Computer Science (Honours)',
  'Degree',
  'Undergraduate degree credential for Computer Science (Honours) programme completions.',
  'both',
  true,
  '[
    { "name": "studentName",    "label": "Student Name",     "type": "text",     "required": true,  "placeholder": "",                              "options": [] },
    { "name": "programme",      "label": "Programme",        "type": "text",     "required": true,  "placeholder": "e.g. Computer Science",         "options": [] },
    { "name": "grade",          "label": "Grade",            "type": "text",     "required": false, "placeholder": "e.g. First Class Honours",      "options": [] },
    { "name": "graduationDate", "label": "Graduation Date",  "type": "date",     "required": true,  "placeholder": "",                              "options": [] },
    { "name": "description",    "label": "Description",      "type": "textarea", "required": false, "placeholder": "",                              "options": [] },
    { "name": "certificate",    "label": "Certificate",      "type": "file",     "required": true,  "placeholder": "",                              "options": [] }
  ]'::jsonb
),

-- 2. Dean's List Award 2024
(
  '0x0000000000000000000000000000000000000000',
  'Dean''s List Award 2024',
  'Award',
  'Recognises students who achieved academic excellence during a given trimester.',
  'bulk',
  false,
  '[
    { "name": "studentName",      "label": "Student Name",      "type": "text",     "required": true,  "placeholder": "",                                  "options": [] },
    { "name": "academicSession",  "label": "Academic Session",  "type": "text",     "required": true,  "placeholder": "e.g. 2024/2025 Trimester 1",        "options": [] },
    { "name": "gpaThreshold",     "label": "GPA Threshold",     "type": "text",     "required": false, "placeholder": "e.g. 3.7",                          "options": [] },
    { "name": "description",      "label": "Description",       "type": "textarea", "required": false, "placeholder": "",                                  "options": [] }
  ]'::jsonb
),

-- 3. Certified Ethical Hacker (Practical)
(
  '0x0000000000000000000000000000000000000000',
  'Certified Ethical Hacker (Practical)',
  'Certificate',
  'Professional certification credential for ethical hacking practical assessment.',
  'single',
  true,
  '[
    { "name": "studentName",       "label": "Student Name",       "type": "text",     "required": true,  "placeholder": "",                    "options": [] },
    { "name": "certificationBody", "label": "Certification Body", "type": "text",     "required": true,  "placeholder": "e.g. EC-Council",    "options": [] },
    { "name": "validFrom",         "label": "Valid From",         "type": "date",     "required": true,  "placeholder": "",                    "options": [] },
    { "name": "validUntil",        "label": "Valid Until",        "type": "date",     "required": true,  "placeholder": "",                    "options": [] },
    { "name": "description",       "label": "Description",        "type": "textarea", "required": false, "placeholder": "",                    "options": [] },
    { "name": "certificate",       "label": "Certificate",        "type": "file",     "required": true,  "placeholder": "",                    "options": [] }
  ]'::jsonb
),

-- 4. Student Identification Credential
(
  '0x0000000000000000000000000000000000000000',
  'Student Identification Credential',
  'Status',
  'Verifiable credential confirming a student''s active enrollment status.',
  'single',
  false,
  '[
    { "name": "studentName",     "label": "Student Name",     "type": "text", "required": true,  "placeholder": "",                                       "options": [] },
    { "name": "studentIdNumber", "label": "Student ID Number", "type": "text", "required": true,  "placeholder": "e.g. STU2023001",                        "options": [] },
    { "name": "faculty",         "label": "Faculty",          "type": "text", "required": true,  "placeholder": "e.g. Faculty of Computing & Informatics", "options": [] },
    { "name": "enrollmentDate",  "label": "Enrollment Date",  "type": "date", "required": true,  "placeholder": "",                                       "options": [] },
    { "name": "expiryDate",      "label": "Expiry Date",      "type": "date", "required": true,  "placeholder": "",                                       "options": [] }
  ]'::jsonb
);

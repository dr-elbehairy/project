/*
  # Seed Demo Data for WAQIB Platform

  1. Demo Universities (3)
  2. Skill Library (~30 skills across 4 clusters)
  3. Benchmark Universities (3 with skill profiles)
  4. Demo Programs (3)
  5. Demo Courses (~10 per program)
*/

INSERT INTO universities (id, name, country, type, size) VALUES
  ('a1111111-1111-1111-1111-111111111111', 'جامعة الملك سعود', 'Saudi Arabia', 'public', 'large'),
  ('a2222222-2222-2222-2222-222222222222', 'جامعة الملك فهد للبترول والمعادن', 'Saudi Arabia', 'public', 'large'),
  ('a3333333-3333-3333-3333-333333333333', 'جامعة قطر', 'Qatar', 'public', 'medium')
ON CONFLICT (id) DO NOTHING;

INSERT INTO skill_library (id, name, name_ar, cluster, description, source, keywords, weight_default) VALUES
  ('a0000001-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Cloud Computing', 'الحوسبة السحابية', 'market_skills', 'Design and deploy cloud-based solutions', 'CC2020', ARRAY['cloud', 'aws', 'azure', 'gcp', 'saas', 'iaas', 'paas', 'cloud computing', 'deployment'], 1.0),
  ('a0000002-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Web Development', 'تطوير الويب', 'market_skills', 'Build modern web applications', 'CC2020', ARRAY['web', 'html', 'css', 'javascript', 'react', 'angular', 'frontend', 'backend', 'api', 'rest'], 1.0),
  ('a0000003-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Mobile Development', 'تطوير تطبيقات الجوال', 'market_skills', 'Develop mobile applications', 'CC2020', ARRAY['mobile', 'android', 'ios', 'swift', 'kotlin', 'flutter', 'react native', 'app'], 0.9),
  ('a0000004-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Database Management', 'إدارة قواعد البيانات', 'market_skills', 'Design and manage databases', 'CC2020', ARRAY['database', 'sql', 'nosql', 'mongodb', 'postgresql', 'mysql', 'data modeling', 'schema'], 1.0),
  ('a0000005-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'DevOps', 'عمليات التطوير', 'market_skills', 'CI/CD and infrastructure automation', 'CS2023', ARRAY['devops', 'ci', 'cd', 'docker', 'kubernetes', 'jenkins', 'automation', 'pipeline'], 0.8),
  ('a0000006-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Cybersecurity', 'الأمن السيبراني', 'market_skills', 'Protect systems and data', 'CS2023', ARRAY['security', 'cybersecurity', 'encryption', 'firewall', 'penetration', 'vulnerability', 'threat', 'authentication'], 1.0),
  ('a0000007-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Data Analytics', 'تحليل البيانات', 'market_skills', 'Analyze and interpret data', 'CC2020', ARRAY['data analysis', 'analytics', 'visualization', 'tableau', 'power bi', 'statistics', 'insights'], 0.9),
  ('a0000008-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Networking', 'الشبكات', 'market_skills', 'Computer networking fundamentals', 'ABET', ARRAY['networking', 'tcp', 'ip', 'routing', 'switching', 'protocol', 'lan', 'wan', 'network'], 0.8),
  ('b0000001-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Algorithms & Data Structures', 'الخوارزميات وهياكل البيانات', 'core_academic', 'Fundamental algorithms and data structures', 'CC2020', ARRAY['algorithm', 'data structure', 'sorting', 'searching', 'tree', 'graph', 'complexity', 'big o', 'hash'], 1.0),
  ('b0000002-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Programming Fundamentals', 'أساسيات البرمجة', 'core_academic', 'Core programming concepts', 'CC2020', ARRAY['programming', 'coding', 'variable', 'loop', 'function', 'oop', 'object oriented', 'java', 'python', 'c++'], 1.0),
  ('b0000003-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Operating Systems', 'نظم التشغيل', 'core_academic', 'OS concepts and design', 'CC2020', ARRAY['operating system', 'process', 'thread', 'memory', 'scheduling', 'kernel', 'linux', 'windows'], 0.9),
  ('b0000004-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Software Engineering', 'هندسة البرمجيات', 'core_academic', 'Software development methodologies', 'ABET', ARRAY['software engineering', 'sdlc', 'agile', 'waterfall', 'testing', 'requirements', 'design patterns', 'uml'], 1.0),
  ('b0000005-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Computer Architecture', 'معمارية الحاسب', 'core_academic', 'Computer organization and architecture', 'CC2020', ARRAY['architecture', 'cpu', 'memory', 'assembly', 'instruction', 'pipeline', 'cache', 'processor'], 0.8),
  ('b0000006-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Discrete Mathematics', 'الرياضيات المتقطعة', 'core_academic', 'Mathematical foundations for CS', 'CC2020', ARRAY['discrete math', 'logic', 'proof', 'set theory', 'combinatorics', 'graph theory', 'boolean', 'mathematical'], 0.9),
  ('b0000007-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Theory of Computation', 'نظرية الحوسبة', 'core_academic', 'Formal languages and automata', 'CC2020', ARRAY['automata', 'formal language', 'turing', 'grammar', 'computation', 'complexity theory', 'decidability'], 0.7),
  ('b0000008-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Compiler Design', 'تصميم المترجمات', 'core_academic', 'Programming language compilation', 'CS2023', ARRAY['compiler', 'parser', 'lexer', 'syntax', 'semantic', 'code generation', 'optimization'], 0.6),
  ('c0000001-cccc-cccc-cccc-cccccccccccc', 'Artificial Intelligence', 'الذكاء الاصطناعي', 'future_skills', 'AI fundamentals and applications', 'CS2023', ARRAY['artificial intelligence', 'ai', 'machine learning', 'deep learning', 'neural network', 'classification', 'regression'], 1.0),
  ('c0000002-cccc-cccc-cccc-cccccccccccc', 'Machine Learning', 'تعلم الآلة', 'future_skills', 'ML algorithms and models', 'CS2023', ARRAY['machine learning', 'ml', 'supervised', 'unsupervised', 'model', 'training', 'prediction', 'feature'], 1.0),
  ('c0000003-cccc-cccc-cccc-cccccccccccc', 'Blockchain', 'البلوك تشين', 'future_skills', 'Distributed ledger technology', 'WEF', ARRAY['blockchain', 'distributed ledger', 'smart contract', 'cryptocurrency', 'consensus', 'decentralized'], 0.7),
  ('c0000004-cccc-cccc-cccc-cccccccccccc', 'IoT', 'إنترنت الأشياء', 'future_skills', 'Internet of Things systems', 'WEF', ARRAY['iot', 'internet of things', 'sensor', 'embedded', 'smart', 'connected', 'mqtt', 'edge computing'], 0.8),
  ('c0000005-cccc-cccc-cccc-cccccccccccc', 'Big Data', 'البيانات الضخمة', 'future_skills', 'Large-scale data processing', 'CS2023', ARRAY['big data', 'hadoop', 'spark', 'data lake', 'distributed', 'mapreduce', 'streaming', 'batch'], 0.9),
  ('c0000006-cccc-cccc-cccc-cccccccccccc', 'Natural Language Processing', 'معالجة اللغة الطبيعية', 'future_skills', 'Text and language processing', 'CS2023', ARRAY['nlp', 'natural language', 'text mining', 'sentiment', 'chatbot', 'language model', 'tokenization'], 0.8),
  ('c0000007-cccc-cccc-cccc-cccccccccccc', 'Quantum Computing', 'الحوسبة الكمية', 'future_skills', 'Quantum information processing', 'OECD', ARRAY['quantum', 'qubit', 'quantum computing', 'quantum algorithm', 'superposition', 'entanglement'], 0.5),
  ('d0000001-dddd-dddd-dddd-dddddddddddd', 'Project Management', 'إدارة المشاريع', 'soft_skills', 'Planning and executing projects', 'ABET', ARRAY['project management', 'planning', 'milestone', 'gantt', 'risk management', 'stakeholder', 'scope'], 1.0),
  ('d0000002-dddd-dddd-dddd-dddddddddddd', 'Communication Skills', 'مهارات التواصل', 'soft_skills', 'Effective written and verbal communication', 'ABET', ARRAY['communication', 'presentation', 'writing', 'speaking', 'technical writing', 'documentation', 'report'], 1.0),
  ('d0000003-dddd-dddd-dddd-dddddddddddd', 'Teamwork', 'العمل الجماعي', 'soft_skills', 'Collaborative work in teams', 'ABET', ARRAY['teamwork', 'team', 'collaboration', 'group project', 'cooperative', 'peer', 'group work'], 0.9),
  ('d0000004-dddd-dddd-dddd-dddddddddddd', 'Critical Thinking', 'التفكير النقدي', 'soft_skills', 'Analytical and critical thinking', 'OECD', ARRAY['critical thinking', 'analysis', 'problem solving', 'reasoning', 'evaluation', 'logic', 'analytical'], 1.0),
  ('d0000005-dddd-dddd-dddd-dddddddddddd', 'Ethics', 'الأخلاقيات المهنية', 'soft_skills', 'Professional and computing ethics', 'ABET', ARRAY['ethics', 'professional ethics', 'privacy', 'responsibility', 'code of conduct', 'moral', 'integrity'], 0.8),
  ('d0000006-dddd-dddd-dddd-dddddddddddd', 'Leadership', 'القيادة', 'soft_skills', 'Leadership and management skills', 'OECD', ARRAY['leadership', 'management', 'decision making', 'strategy', 'vision', 'motivation', 'delegation'], 0.7),
  ('d0000007-dddd-dddd-dddd-dddddddddddd', 'Entrepreneurship', 'ريادة الأعمال', 'soft_skills', 'Innovation and business creation', 'WEF', ARRAY['entrepreneurship', 'startup', 'innovation', 'business model', 'venture', 'market', 'product'], 0.6)
ON CONFLICT (id) DO NOTHING;

INSERT INTO benchmark_universities (id, name, country, ranking_source, discipline, skill_profile_json) VALUES
  ('e1111111-eeee-eeee-eeee-eeeeeeeeeeee', 'MIT', 'United States', 'QS', 'Computer Science', '{
    "a0000001-aaaa-aaaa-aaaa-aaaaaaaaaaaa": 0.9, "a0000002-aaaa-aaaa-aaaa-aaaaaaaaaaaa": 0.95, "a0000003-aaaa-aaaa-aaaa-aaaaaaaaaaaa": 0.7,
    "a0000004-aaaa-aaaa-aaaa-aaaaaaaaaaaa": 0.9, "a0000005-aaaa-aaaa-aaaa-aaaaaaaaaaaa": 0.8, "a0000006-aaaa-aaaa-aaaa-aaaaaaaaaaaa": 0.85,
    "a0000007-aaaa-aaaa-aaaa-aaaaaaaaaaaa": 0.8, "a0000008-aaaa-aaaa-aaaa-aaaaaaaaaaaa": 0.7,
    "b0000001-bbbb-bbbb-bbbb-bbbbbbbbbbbb": 0.95, "b0000002-bbbb-bbbb-bbbb-bbbbbbbbbbbb": 0.95, "b0000003-bbbb-bbbb-bbbb-bbbbbbbbbbbb": 0.9,
    "b0000004-bbbb-bbbb-bbbb-bbbbbbbbbbbb": 0.9, "b0000005-bbbb-bbbb-bbbb-bbbbbbbbbbbb": 0.85, "b0000006-bbbb-bbbb-bbbb-bbbbbbbbbbbb": 0.9,
    "b0000007-bbbb-bbbb-bbbb-bbbbbbbbbbbb": 0.8, "b0000008-bbbb-bbbb-bbbb-bbbbbbbbbbbb": 0.7,
    "c0000001-cccc-cccc-cccc-cccccccccccc": 0.95, "c0000002-cccc-cccc-cccc-cccccccccccc": 0.9, "c0000003-cccc-cccc-cccc-cccccccccccc": 0.5,
    "c0000004-cccc-cccc-cccc-cccccccccccc": 0.6, "c0000005-cccc-cccc-cccc-cccccccccccc": 0.8, "c0000006-cccc-cccc-cccc-cccccccccccc": 0.85,
    "c0000007-cccc-cccc-cccc-cccccccccccc": 0.6,
    "d0000001-dddd-dddd-dddd-dddddddddddd": 0.7, "d0000002-dddd-dddd-dddd-dddddddddddd": 0.8, "d0000003-dddd-dddd-dddd-dddddddddddd": 0.85,
    "d0000004-dddd-dddd-dddd-dddddddddddd": 0.9, "d0000005-dddd-dddd-dddd-dddddddddddd": 0.75, "d0000006-dddd-dddd-dddd-dddddddddddd": 0.6,
    "d0000007-dddd-dddd-dddd-dddddddddddd": 0.7
  }'::jsonb),
  ('e2222222-eeee-eeee-eeee-eeeeeeeeeeee', 'Stanford University', 'United States', 'QS', 'Computer Science', '{
    "a0000001-aaaa-aaaa-aaaa-aaaaaaaaaaaa": 0.85, "a0000002-aaaa-aaaa-aaaa-aaaaaaaaaaaa": 0.9, "a0000003-aaaa-aaaa-aaaa-aaaaaaaaaaaa": 0.75,
    "a0000004-aaaa-aaaa-aaaa-aaaaaaaaaaaa": 0.85, "a0000005-aaaa-aaaa-aaaa-aaaaaaaaaaaa": 0.75, "a0000006-aaaa-aaaa-aaaa-aaaaaaaaaaaa": 0.8,
    "a0000007-aaaa-aaaa-aaaa-aaaaaaaaaaaa": 0.85, "a0000008-aaaa-aaaa-aaaa-aaaaaaaaaaaa": 0.65,
    "b0000001-bbbb-bbbb-bbbb-bbbbbbbbbbbb": 0.95, "b0000002-bbbb-bbbb-bbbb-bbbbbbbbbbbb": 0.9, "b0000003-bbbb-bbbb-bbbb-bbbbbbbbbbbb": 0.85,
    "b0000004-bbbb-bbbb-bbbb-bbbbbbbbbbbb": 0.85, "b0000005-bbbb-bbbb-bbbb-bbbbbbbbbbbb": 0.8, "b0000006-bbbb-bbbb-bbbb-bbbbbbbbbbbb": 0.85,
    "b0000007-bbbb-bbbb-bbbb-bbbbbbbbbbbb": 0.75, "b0000008-bbbb-bbbb-bbbb-bbbbbbbbbbbb": 0.65,
    "c0000001-cccc-cccc-cccc-cccccccccccc": 0.95, "c0000002-cccc-cccc-cccc-cccccccccccc": 0.95, "c0000003-cccc-cccc-cccc-cccccccccccc": 0.45,
    "c0000004-cccc-cccc-cccc-cccccccccccc": 0.55, "c0000005-cccc-cccc-cccc-cccccccccccc": 0.85, "c0000006-cccc-cccc-cccc-cccccccccccc": 0.9,
    "c0000007-cccc-cccc-cccc-cccccccccccc": 0.5,
    "d0000001-dddd-dddd-dddd-dddddddddddd": 0.75, "d0000002-dddd-dddd-dddd-dddddddddddd": 0.8, "d0000003-dddd-dddd-dddd-dddddddddddd": 0.8,
    "d0000004-dddd-dddd-dddd-dddddddddddd": 0.85, "d0000005-dddd-dddd-dddd-dddddddddddd": 0.7, "d0000006-dddd-dddd-dddd-dddddddddddd": 0.65,
    "d0000007-dddd-dddd-dddd-dddddddddddd": 0.8
  }'::jsonb),
  ('e3333333-eeee-eeee-eeee-eeeeeeeeeeee', 'ETH Zurich', 'Switzerland', 'Shanghai', 'Computer Science', '{
    "a0000001-aaaa-aaaa-aaaa-aaaaaaaaaaaa": 0.8, "a0000002-aaaa-aaaa-aaaa-aaaaaaaaaaaa": 0.85, "a0000003-aaaa-aaaa-aaaa-aaaaaaaaaaaa": 0.6,
    "a0000004-aaaa-aaaa-aaaa-aaaaaaaaaaaa": 0.85, "a0000005-aaaa-aaaa-aaaa-aaaaaaaaaaaa": 0.7, "a0000006-aaaa-aaaa-aaaa-aaaaaaaaaaaa": 0.9,
    "a0000007-aaaa-aaaa-aaaa-aaaaaaaaaaaa": 0.75, "a0000008-aaaa-aaaa-aaaa-aaaaaaaaaaaa": 0.75,
    "b0000001-bbbb-bbbb-bbbb-bbbbbbbbbbbb": 0.95, "b0000002-bbbb-bbbb-bbbb-bbbbbbbbbbbb": 0.9, "b0000003-bbbb-bbbb-bbbb-bbbbbbbbbbbb": 0.9,
    "b0000004-bbbb-bbbb-bbbb-bbbbbbbbbbbb": 0.85, "b0000005-bbbb-bbbb-bbbb-bbbbbbbbbbbb": 0.9, "b0000006-bbbb-bbbb-bbbb-bbbbbbbbbbbb": 0.95,
    "b0000007-bbbb-bbbb-bbbb-bbbbbbbbbbbb": 0.85, "b0000008-bbbb-bbbb-bbbb-bbbbbbbbbbbb": 0.75,
    "c0000001-cccc-cccc-cccc-cccccccccccc": 0.85, "c0000002-cccc-cccc-cccc-cccccccccccc": 0.85, "c0000003-cccc-cccc-cccc-cccccccccccc": 0.6,
    "c0000004-cccc-cccc-cccc-cccccccccccc": 0.7, "c0000005-cccc-cccc-cccc-cccccccccccc": 0.75, "c0000006-cccc-cccc-cccc-cccccccccccc": 0.7,
    "c0000007-cccc-cccc-cccc-cccccccccccc": 0.65,
    "d0000001-dddd-dddd-dddd-dddddddddddd": 0.65, "d0000002-dddd-dddd-dddd-dddddddddddd": 0.7, "d0000003-dddd-dddd-dddd-dddddddddddd": 0.75,
    "d0000004-dddd-dddd-dddd-dddddddddddd": 0.9, "d0000005-dddd-dddd-dddd-dddddddddddd": 0.8, "d0000006-dddd-dddd-dddd-dddddddddddd": 0.55,
    "d0000007-dddd-dddd-dddd-dddddddddddd": 0.55
  }'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO programs (id, university_id, name, name_ar, degree_level, discipline, mode, description, status) VALUES
  ('f1111111-ffff-ffff-ffff-ffffffffffff', 'a1111111-1111-1111-1111-111111111111', 'B.Sc. Computer Science', 'بكالوريوس علوم الحاسب', 'bachelor', 'Computer Science', 'teaching', 'A comprehensive computer science program covering theoretical foundations and practical skills', 'active'),
  ('f2222222-ffff-ffff-ffff-ffffffffffff', 'a2222222-2222-2222-2222-222222222222', 'M.Sc. Information Systems', 'ماجستير نظم المعلومات', 'master', 'Information Systems', 'hybrid', 'Advanced program in information systems management and technology', 'active'),
  ('f3333333-ffff-ffff-ffff-ffffffffffff', 'a3333333-3333-3333-3333-333333333333', 'B.Sc. Software Engineering', 'بكالوريوس هندسة البرمجيات', 'bachelor', 'Software Engineering', 'teaching', 'Industry-oriented software engineering program with focus on modern development practices', 'active')
ON CONFLICT (id) DO NOTHING;

INSERT INTO courses (program_id, code, title, title_ar, description, credits, level, semester, category, is_active) VALUES
  ('f1111111-ffff-ffff-ffff-ffffffffffff', 'CS101', 'Introduction to Programming', 'مقدمة في البرمجة', 'Fundamentals of programming using Python. Covers variables, loops, functions, and object-oriented programming concepts.', 3, 'basic', 1, 'core', true),
  ('f1111111-ffff-ffff-ffff-ffffffffffff', 'CS201', 'Data Structures', 'هياكل البيانات', 'Study of fundamental data structures including arrays, linked lists, trees, graphs, and hash tables. Algorithm analysis and complexity.', 3, 'basic', 2, 'core', true),
  ('f1111111-ffff-ffff-ffff-ffffffffffff', 'CS301', 'Algorithms', 'تصميم وتحليل الخوارزميات', 'Design and analysis of algorithms. Sorting, searching, dynamic programming, greedy algorithms, and graph algorithms.', 3, 'applied', 3, 'core', true),
  ('f1111111-ffff-ffff-ffff-ffffffffffff', 'CS302', 'Database Systems', 'نظم قواعد البيانات', 'Relational database design, SQL, normalization, transaction processing, and NoSQL databases.', 3, 'applied', 3, 'core', true),
  ('f1111111-ffff-ffff-ffff-ffffffffffff', 'CS303', 'Operating Systems', 'نظم التشغيل', 'Process management, memory management, file systems, scheduling, and concurrency in operating systems.', 3, 'applied', 4, 'core', true),
  ('f1111111-ffff-ffff-ffff-ffffffffffff', 'CS401', 'Software Engineering', 'هندسة البرمجيات', 'Software development lifecycle, agile methodologies, requirements engineering, testing, and design patterns.', 3, 'applied', 5, 'core', true),
  ('f1111111-ffff-ffff-ffff-ffffffffffff', 'CS402', 'Computer Networks', 'شبكات الحاسب', 'TCP/IP protocol suite, network architecture, routing, switching, and network security fundamentals.', 3, 'applied', 5, 'core', true),
  ('f1111111-ffff-ffff-ffff-ffffffffffff', 'CS403', 'Web Development', 'تطوير تطبيقات الويب', 'Modern web development using HTML, CSS, JavaScript, React, REST APIs and cloud deployment.', 3, 'applied', 6, 'elective', true),
  ('f1111111-ffff-ffff-ffff-ffffffffffff', 'CS501', 'Artificial Intelligence', 'الذكاء الاصطناعي', 'Introduction to AI: search algorithms, machine learning basics, neural networks, and NLP fundamentals.', 3, 'advanced', 7, 'elective', true),
  ('f1111111-ffff-ffff-ffff-ffffffffffff', 'CS502', 'Senior Project', 'مشروع التخرج', 'Capstone project requiring teamwork, project management, communication, and technical skills. Presentation and documentation required.', 4, 'advanced', 8, 'core', true),
  ('f2222222-ffff-ffff-ffff-ffffffffffff', 'IS501', 'Information Systems Strategy', 'استراتيجية نظم المعلومات', 'Strategic planning for IT, digital transformation, and enterprise architecture.', 3, 'advanced', 1, 'core', true),
  ('f2222222-ffff-ffff-ffff-ffffffffffff', 'IS502', 'Database Design & Management', 'تصميم وإدارة قواعد البيانات', 'Advanced database concepts, data warehousing, data modeling, SQL optimization, and NoSQL systems.', 3, 'advanced', 1, 'core', true),
  ('f2222222-ffff-ffff-ffff-ffffffffffff', 'IS503', 'Data Analytics & Visualization', 'تحليل البيانات والتصور المرئي', 'Statistical analysis, data visualization using Power BI and Tableau, business analytics.', 3, 'advanced', 2, 'core', true),
  ('f2222222-ffff-ffff-ffff-ffffffffffff', 'IS504', 'Cybersecurity Management', 'إدارة الأمن السيبراني', 'Information security policies, risk assessment, encryption, authentication, and security governance.', 3, 'advanced', 2, 'core', true),
  ('f2222222-ffff-ffff-ffff-ffffffffffff', 'IS505', 'Cloud Computing & Services', 'الحوسبة السحابية والخدمات', 'Cloud architecture, AWS/Azure/GCP services, SaaS/IaaS/PaaS, cloud security and deployment.', 3, 'advanced', 3, 'elective', true),
  ('f2222222-ffff-ffff-ffff-ffffffffffff', 'IS506', 'AI & Machine Learning for Business', 'الذكاء الاصطناعي وتعلم الآلة للأعمال', 'Application of AI and machine learning in business contexts. Predictive analytics and deep learning.', 3, 'advanced', 3, 'elective', true),
  ('f2222222-ffff-ffff-ffff-ffffffffffff', 'IS601', 'Research Methods', 'مناهج البحث العلمي', 'Research methodology, literature review, critical thinking, and academic writing for graduate studies.', 3, 'advanced', 4, 'core', true),
  ('f2222222-ffff-ffff-ffff-ffffffffffff', 'IS602', 'Thesis Project', 'مشروع الرسالة', 'Independent research project requiring project management, leadership, teamwork and presentation skills.', 6, 'advanced', 4, 'core', true),
  ('f3333333-ffff-ffff-ffff-ffffffffffff', 'SE101', 'Programming Fundamentals', 'أساسيات البرمجة', 'Core programming concepts in Java: variables, control flow, functions, OOP, and basic testing.', 3, 'basic', 1, 'core', true),
  ('f3333333-ffff-ffff-ffff-ffffffffffff', 'SE201', 'Object-Oriented Design', 'التصميم كائني التوجه', 'Advanced OOP, design patterns, UML modeling, and software architecture principles.', 3, 'basic', 2, 'core', true),
  ('f3333333-ffff-ffff-ffff-ffffffffffff', 'SE202', 'Data Structures & Algorithms', 'هياكل البيانات والخوارزميات', 'Data structures, algorithm design, sorting, searching, trees, graphs, and complexity analysis.', 3, 'basic', 2, 'core', true),
  ('f3333333-ffff-ffff-ffff-ffffffffffff', 'SE301', 'Software Requirements Engineering', 'هندسة متطلبات البرمجيات', 'Requirements elicitation, analysis, specification, and validation. Use cases and user stories.', 3, 'applied', 3, 'core', true),
  ('f3333333-ffff-ffff-ffff-ffffffffffff', 'SE302', 'Web & Mobile Development', 'تطوير الويب والجوال', 'Full-stack web development with React, Node.js, REST APIs, and mobile app development with Flutter.', 3, 'applied', 4, 'core', true),
  ('f3333333-ffff-ffff-ffff-ffffffffffff', 'SE303', 'Database Systems', 'أنظمة قواعد البيانات', 'Relational databases, SQL, NoSQL, data modeling, and database administration.', 3, 'applied', 4, 'core', true),
  ('f3333333-ffff-ffff-ffff-ffffffffffff', 'SE401', 'Software Testing & QA', 'اختبار البرمجيات وضمان الجودة', 'Testing methodologies, automated testing, CI/CD pipelines, DevOps practices, and quality assurance.', 3, 'applied', 5, 'core', true),
  ('f3333333-ffff-ffff-ffff-ffffffffffff', 'SE402', 'Cloud Computing', 'الحوسبة السحابية', 'Cloud platforms (AWS, Azure), containerization with Docker, Kubernetes, and cloud-native development.', 3, 'applied', 6, 'elective', true),
  ('f3333333-ffff-ffff-ffff-ffffffffffff', 'SE501', 'Machine Learning Applications', 'تطبيقات تعلم الآلة', 'Practical machine learning with Python, supervised/unsupervised learning, model evaluation.', 3, 'advanced', 7, 'elective', true),
  ('f3333333-ffff-ffff-ffff-ffffffffffff', 'SE502', 'Capstone Project', 'مشروع التخرج', 'Team-based capstone project. Project management, agile methodology, presentation, documentation, and professional ethics.', 4, 'advanced', 8, 'core', true)
ON CONFLICT DO NOTHING;

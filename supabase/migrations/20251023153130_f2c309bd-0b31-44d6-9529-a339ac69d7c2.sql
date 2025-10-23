-- Clean up all existing data
DELETE FROM meeting_analyses;
DELETE FROM meeting_files;
DELETE FROM meetings;
DELETE FROM ai_research_results;
DELETE FROM market_analyses;
DELETE FROM swot_analyses;
DELETE FROM project_readmes;
DELETE FROM project_team_members;
DELETE FROM projects;
DELETE FROM client_personas;
DELETE FROM clients;

-- Insert clean client data
INSERT INTO clients (id, company, contact_person, email, phone, created_at, updated_at) VALUES
(gen_random_uuid(), 'TechVision GmbH', 'Anna Müller', 'anna.mueller@techvision.de', '+49 30 12345678', now(), now()),
(gen_random_uuid(), 'InnovateCorp AG', 'Michael Schmidt', 'michael.schmidt@innovatecorp.de', '+49 69 87654321', now(), now()),
(gen_random_uuid(), 'FutureLogistics SE', 'Sarah Weber', 'sarah.weber@futurelogistics.de', '+49 40 11223344', now(), now());

-- Create temporary variables for IDs
DO $$
DECLARE
  client1_id uuid;
  client2_id uuid;
  client3_id uuid;
  project1_id uuid;
  project2_id uuid;
  project3_id uuid;
  meeting1_id uuid;
  meeting2_id uuid;
  meeting3_id uuid;
  meeting4_id uuid;
BEGIN
  -- Get client IDs
  SELECT id INTO client1_id FROM clients WHERE company = 'TechVision GmbH';
  SELECT id INTO client2_id FROM clients WHERE company = 'InnovateCorp AG';
  SELECT id INTO client3_id FROM clients WHERE company = 'FutureLogistics SE';

  -- Insert projects
  INSERT INTO projects (id, name, client_id, created_at, updated_at) VALUES
  (gen_random_uuid(), 'Projekt X - Digital Transformation', client1_id, now(), now()),
  (gen_random_uuid(), 'Projekt Y - Market Expansion', client2_id, now(), now()),
  (gen_random_uuid(), 'Projekt Z - Process Optimization', client3_id, now(), now());

  -- Get project IDs
  SELECT id INTO project1_id FROM projects WHERE name = 'Projekt X - Digital Transformation';
  SELECT id INTO project2_id FROM projects WHERE name = 'Projekt Y - Market Expansion';
  SELECT id INTO project3_id FROM projects WHERE name = 'Projekt Z - Process Optimization';

  -- Insert team members
  INSERT INTO project_team_members (project_id, name, role, email) VALUES
  -- Project X Team
  (project1_id, 'Dr. Lisa Schmidt', 'Project Lead', 'lisa.schmidt@consulting.eu'),
  (project1_id, 'Max Bauer', 'Senior Analyst', 'max.bauer@consulting.eu'),
  (project1_id, 'Julia Fischer', 'Technical Consultant', 'julia.fischer@consulting.eu'),
  -- Project Y Team
  (project2_id, 'Thomas Wagner', 'Project Lead', 'thomas.wagner@consulting.eu'),
  (project2_id, 'Emma Hoffmann', 'Market Analyst', 'emma.hoffmann@consulting.eu'),
  -- Project Z Team
  (project3_id, 'Dr. Stefan Klein', 'Project Lead', 'stefan.klein@consulting.eu'),
  (project3_id, 'Nina Richter', 'Process Consultant', 'nina.richter@consulting.eu'),
  (project3_id, 'Paul Schäfer', 'Data Analyst', 'paul.schaefer@consulting.eu');

  -- Insert meetings
  INSERT INTO meetings (id, project_id, topic, date, attendees, transcript, created_at, updated_at) VALUES
  (gen_random_uuid(), project1_id, 'Kickoff Meeting - Digital Strategy', '2025-10-15', ARRAY['Dr. Lisa Schmidt', 'Max Bauer', 'Anna Müller'], 'Meeting transcript: We discussed the digital transformation roadmap. Key points: 1) Cloud migration timeline 2) Team training requirements 3) Budget allocation. Action items: Schedule technical workshops, Review vendor proposals.', now() - interval '8 days', now() - interval '8 days'),
  (gen_random_uuid(), project1_id, 'Weekly Status Update', '2025-10-20', ARRAY['Dr. Lisa Schmidt', 'Max Bauer', 'Julia Fischer'], 'Status update transcript: Progress on cloud infrastructure setup at 60%. Discussed security compliance requirements. Next steps: Complete security audit, Finalize migration plan.', now() - interval '3 days', now() - interval '3 days'),
  (gen_random_uuid(), project2_id, 'Market Analysis Review', '2025-10-18', ARRAY['Thomas Wagner', 'Emma Hoffmann', 'Michael Schmidt'], 'Market review transcript: Analyzed target markets in DACH region. Key findings: Strong growth potential in Austria and Switzerland. Action items: Prepare market entry strategy, Schedule client presentation.', now() - interval '5 days', now() - interval '5 days'),
  (gen_random_uuid(), project3_id, 'Process Optimization Workshop', '2025-10-22', ARRAY['Dr. Stefan Klein', 'Nina Richter', 'Paul Schäfer', 'Sarah Weber'], 'Workshop transcript: Identified 5 key bottlenecks in current logistics process. Proposed automation solutions. Next steps: Cost-benefit analysis, Pilot program planning.', now() - interval '1 day', now() - interval '1 day');

  -- Get meeting IDs
  SELECT id INTO meeting1_id FROM meetings WHERE topic = 'Kickoff Meeting - Digital Strategy';
  SELECT id INTO meeting2_id FROM meetings WHERE topic = 'Weekly Status Update';
  
  -- Insert meeting analyses
  INSERT INTO meeting_analyses (meeting_id, project_id, transcript, analysis) VALUES
  (meeting1_id, project1_id, 
  'Meeting transcript: We discussed the digital transformation roadmap. Key points: 1) Cloud migration timeline 2) Team training requirements 3) Budget allocation. Action items: Schedule technical workshops, Review vendor proposals.',
  '| Task | Owner | Priority | Deadline |
|------|-------|----------|----------|
| Schedule technical workshops | Max Bauer | High | 2025-10-25 |
| Review vendor proposals | Dr. Lisa Schmidt | High | 2025-10-28 |
| Prepare budget breakdown | Julia Fischer | Medium | 2025-10-30 |'),
  (meeting2_id, project1_id,
  'Status update transcript: Progress on cloud infrastructure setup at 60%. Discussed security compliance requirements. Next steps: Complete security audit, Finalize migration plan.',
  '| Task | Owner | Priority | Deadline |
|------|-------|----------|----------|
| Complete security audit | Max Bauer | Critical | 2025-10-27 |
| Finalize migration plan | Dr. Lisa Schmidt | High | 2025-10-29 |');

  -- Insert AI research results
  INSERT INTO ai_research_results (project_id, query, result, created_at) VALUES
  (project1_id,
  'Best practices for cloud migration in manufacturing industry',
  '# Cloud Migration Best Practices for Manufacturing

## Key Findings:
1. **Phased Approach**: Implement migration in stages to minimize disruption
2. **Data Security**: Prioritize encryption and compliance with industry standards
3. **Legacy System Integration**: Plan for hybrid cloud scenarios
4. **Staff Training**: Invest in comprehensive training programs

## Recommended Timeline:
- Phase 1 (Months 1-3): Assessment and planning
- Phase 2 (Months 4-6): Pilot migration
- Phase 3 (Months 7-12): Full deployment',
  now() - interval '6 days'),
  (project2_id,
  'Market entry strategies for DACH region',
  '# Market Entry Strategies - DACH Region

## Overview:
The DACH region (Germany, Austria, Switzerland) presents significant opportunities for market expansion.

## Key Strategies:
1. **Localization**: Adapt products to local preferences and regulations
2. **Partnership Model**: Consider strategic partnerships with local distributors
3. **Digital Marketing**: Leverage LinkedIn and XING for B2B marketing
4. **Regulatory Compliance**: Ensure GDPR compliance and local certifications

## Market Priorities:
- Germany: Largest market, high competition
- Austria: Growing market, easier entry
- Switzerland: Premium segment opportunity',
  now() - interval '4 days');

  -- Insert market analyses
  INSERT INTO market_analyses (project_id, query, result, created_at) VALUES
  (project1_id,
  'Digital transformation market size in Germany 2025',
  '# German Digital Transformation Market Analysis 2025

## Market Size: €45 billion
- Cloud Services: €18 billion (40%)
- Digital Consulting: €12 billion (27%)
- Software Solutions: €10 billion (22%)
- Other Services: €5 billion (11%)

## Growth Rate: 12% YoY
## Key Drivers:
- Industry 4.0 initiatives
- Regulatory compliance requirements
- Competitive pressure',
  now() - interval '7 days');

  -- Insert SWOT analyses
  INSERT INTO swot_analyses (project_id, analysis_mode, industry, competitors, result, created_at) VALUES
  (project2_id,
  'competitive', 'Technology Consulting', ARRAY['McKinsey Digital', 'Deloitte Digital', 'Accenture'], 
  '# SWOT Analysis - Market Expansion Project Y

## Strengths
- Strong industry expertise
- Proven track record in DACH region
- Dedicated team with local knowledge

## Weaknesses
- Limited brand recognition in Austria/Switzerland
- Smaller team compared to major competitors

## Opportunities
- Growing demand for digital transformation
- Underserved mid-market segment
- Government incentives for digitalization

## Threats
- Strong competition from established players
- Economic uncertainty
- Rapid technology changes',
  now() - interval '5 days');
END $$;
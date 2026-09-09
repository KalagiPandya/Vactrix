/**
 * Vactrix — Enterprise Seed Script (v3 — clean slate)
 * Drops all collections first, then seeds fresh professional data.
 * Run: npm run seed
 */

const mongoose   = require('mongoose');
const bcrypt     = require('bcryptjs');
require('dotenv').config();

const User         = require('./models/User');
const OrgNode      = require('./models/OrgNode');
const Job          = require('./models/Job');
const Application  = require('./models/Application');
const Notification = require('./models/Notification');

let AuditLog;
try { AuditLog = require('./models/AuditLog'); } catch (_) { AuditLog = null; }

// ══════════════════════════════════════════════════════════════════════
// SEED DATA
// ══════════════════════════════════════════════════════════════════════

const SEED_USERS = [
  {
    name: 'Arjun Mehta', email: 'admin@vactrix.com', plainPassword: 'admin123',
    role: 'admin', department: 'Management',
    skills: ['Leadership', 'Strategic Planning', 'Operations Management', 'P&L Management'],
    experience: 14, performanceRating: 5,
    certifications: ['PMP', 'MBA (IIM Ahmedabad)', 'Six Sigma Black Belt'],
  },
  {
    name: 'Priya Sharma', email: 'hr@vactrix.com', plainPassword: 'hr123456',
    role: 'hr', department: 'Human Resources',
    skills: ['Talent Acquisition', 'HRIS Management', 'Compensation & Benefits', 'HR Analytics', 'Labor Law'],
    experience: 8, performanceRating: 5,
    certifications: ['SHRM-CP', 'CHRP', 'Workday HCM Certified'],
  },
  {
    name: 'Rohan Kapoor', email: 'rohan.kapoor@vactrix.com', plainPassword: 'emp12345',
    role: 'employee', department: 'Engineering',
    skills: ['React', 'Node.js', 'MongoDB', 'TypeScript', 'AWS', 'Docker', 'GraphQL'],
    experience: 5, performanceRating: 5,
    certifications: ['AWS Solutions Architect Associate', 'MongoDB Certified Developer'],
  },
  {
    name: 'Sneha Patel', email: 'sneha.patel@vactrix.com', plainPassword: 'emp12345',
    role: 'employee', department: 'Data Science',
    skills: ['Python', 'Machine Learning', 'TensorFlow', 'SQL', 'Tableau', 'Statistics', 'NLP'],
    experience: 4, performanceRating: 4,
    certifications: ['Google Professional Data Engineer', 'TensorFlow Developer Certificate'],
  },
  {
    name: 'Vikram Singh', email: 'vikram.singh@vactrix.com', plainPassword: 'emp12345',
    role: 'employee', department: 'DevOps',
    skills: ['Kubernetes', 'Terraform', 'CI/CD', 'AWS', 'Linux', 'Ansible', 'Prometheus'],
    experience: 6, performanceRating: 5,
    certifications: ['CKA (Certified Kubernetes Administrator)', 'AWS DevOps Professional', 'HashiCorp Terraform Associate'],
  },
  {
    name: 'Ananya Krishnan', email: 'ananya.krishnan@vactrix.com', plainPassword: 'emp12345',
    role: 'employee', department: 'Product Management',
    skills: ['Product Strategy', 'Agile', 'User Research', 'Roadmapping', 'Jira', 'Data Analysis', 'Wireframing'],
    experience: 7, performanceRating: 5,
    certifications: ['Certified Scrum Product Owner (CSPO)', 'Google UX Design Certificate'],
  },
  {
    name: 'Rahul Gupta', email: 'rahul.gupta@vactrix.com', plainPassword: 'emp12345',
    role: 'employee', department: 'Finance',
    skills: ['Financial Modeling', 'Excel', 'Power BI', 'SAP FICO', 'Budgeting', 'Forecasting', 'GAAP'],
    experience: 9, performanceRating: 4,
    certifications: ['CFA Level II', 'CA (ICAI)', 'SAP FI Certification'],
  },
  {
    name: 'Meera Nair', email: 'meera.nair@vactrix.com', plainPassword: 'emp12345',
    role: 'employee', department: 'Marketing',
    skills: ['Digital Marketing', 'SEO/SEM', 'Content Strategy', 'Google Analytics', 'HubSpot', 'Social Media', 'Copywriting'],
    experience: 5, performanceRating: 4,
    certifications: ['Google Ads Certified', 'HubSpot Content Marketing', 'Meta Blueprint Certified'],
  },
  {
    name: 'Aditya Reddy', email: 'aditya.reddy@vactrix.com', plainPassword: 'emp12345',
    role: 'employee', department: 'Sales',
    skills: ['B2B Sales', 'CRM (Salesforce)', 'Solution Selling', 'Negotiation', 'Account Management', 'Lead Generation'],
    experience: 6, performanceRating: 4,
    certifications: ['Salesforce Administrator', 'Miller Heiman Strategic Selling'],
  },
  {
    name: 'Kavya Iyer', email: 'kavya.iyer@vactrix.com', plainPassword: 'emp12345',
    role: 'employee', department: 'Customer Success',
    skills: ['Customer Onboarding', 'SaaS Metrics', 'NPS Analysis', 'Zendesk', 'Churn Prevention', 'Upselling', 'Training'],
    experience: 4, performanceRating: 4,
    certifications: ['Customer Success Manager (CSM) Certified', 'ITIL Foundation'],
  },
  {
    name: 'Siddharth Joshi', email: 'siddharth.joshi@vactrix.com', plainPassword: 'emp12345',
    role: 'employee', department: 'Engineering',
    skills: ['Java', 'Spring Boot', 'Microservices', 'PostgreSQL', 'Kafka', 'Redis', 'REST APIs'],
    experience: 7, performanceRating: 5,
    certifications: ['Oracle Java SE 11 Developer', 'AWS Cloud Practitioner'],
  },
  {
    name: 'Divya Menon', email: 'divya.menon@vactrix.com', plainPassword: 'emp12345',
    role: 'employee', department: 'Operations',
    skills: ['Process Improvement', 'Supply Chain', 'Lean Six Sigma', 'Project Management', 'ERP (SAP)', 'Risk Management'],
    experience: 8, performanceRating: 4,
    certifications: ['PMP', 'Lean Six Sigma Green Belt', 'APICS CPIM'],
  },
];

const ORG_STRUCTURE = [
  { title:'VP of Engineering',           department:'Engineering',        level:1, parentTitle:null },
  { title:'Engineering Manager',         department:'Engineering',        level:2, parentTitle:'VP of Engineering' },
  { title:'Senior Software Engineer',    department:'Engineering',        level:3, parentTitle:'Engineering Manager' },
  { title:'Software Engineer II',        department:'Engineering',        level:4, parentTitle:'Senior Software Engineer' },
  { title:'Software Engineer I',         department:'Engineering',        level:5, parentTitle:'Software Engineer II' },
  { title:'Head of Data Science',        department:'Data Science',       level:1, parentTitle:null },
  { title:'Senior Data Scientist',       department:'Data Science',       level:2, parentTitle:'Head of Data Science' },
  { title:'Data Analyst',                department:'Data Science',       level:3, parentTitle:'Senior Data Scientist' },
  { title:'DevOps Lead',                 department:'DevOps',             level:1, parentTitle:null },
  { title:'Senior DevOps Engineer',      department:'DevOps',             level:2, parentTitle:'DevOps Lead' },
  { title:'DevOps Engineer',             department:'DevOps',             level:3, parentTitle:'Senior DevOps Engineer' },
  { title:'VP of Product',               department:'Product Management', level:1, parentTitle:null },
  { title:'Senior Product Manager',      department:'Product Management', level:2, parentTitle:'VP of Product' },
  { title:'Product Manager',             department:'Product Management', level:3, parentTitle:'Senior Product Manager' },
  { title:'Associate PM',                department:'Product Management', level:4, parentTitle:'Product Manager' },
  { title:'CFO',                         department:'Finance',            level:1, parentTitle:null },
  { title:'Finance Manager',             department:'Finance',            level:2, parentTitle:'CFO' },
  { title:'Senior Finance Analyst',      department:'Finance',            level:3, parentTitle:'Finance Manager' },
  { title:'Finance Analyst',             department:'Finance',            level:4, parentTitle:'Senior Finance Analyst' },
  { title:'CMO',                         department:'Marketing',          level:1, parentTitle:null },
  { title:'Marketing Manager',           department:'Marketing',          level:2, parentTitle:'CMO' },
  { title:'Senior Marketing Specialist', department:'Marketing',          level:3, parentTitle:'Marketing Manager' },
  { title:'VP of Sales',                 department:'Sales',              level:1, parentTitle:null },
  { title:'Sales Manager',               department:'Sales',              level:2, parentTitle:'VP of Sales' },
  { title:'Senior Account Executive',    department:'Sales',              level:3, parentTitle:'Sales Manager' },
  { title:'Account Executive',           department:'Sales',              level:4, parentTitle:'Senior Account Executive' },
  { title:'Head of Customer Success',    department:'Customer Success',   level:1, parentTitle:null },
  { title:'Customer Success Manager',    department:'Customer Success',   level:2, parentTitle:'Head of Customer Success' },
  { title:'Customer Success Associate',  department:'Customer Success',   level:3, parentTitle:'Customer Success Manager' },
  { title:'HR Director',                 department:'Human Resources',    level:1, parentTitle:null },
  { title:'HR Manager',                  department:'Human Resources',    level:2, parentTitle:'HR Director' },
  { title:'HR Business Partner',         department:'Human Resources',    level:3, parentTitle:'HR Manager' },
  { title:'COO',                         department:'Operations',         level:1, parentTitle:null },
  { title:'Operations Manager',          department:'Operations',         level:2, parentTitle:'COO' },
  { title:'Operations Analyst',          department:'Operations',         level:3, parentTitle:'Operations Manager' },
];

const SAMPLE_JOBS = [
  {
    title: 'Senior React Developer', department: 'Engineering',
    description: 'Build and maintain our core product frontend using React 18+. Work with a talented team of engineers on enterprise-scale applications. Own features end-to-end from design review to deployment.',
    requiredSkills: ['React', 'TypeScript', 'GraphQL', 'Node.js', 'AWS'], minExperience: 4, isOpen: true,
  },
  {
    title: 'Machine Learning Engineer', department: 'Data Science',
    description: 'Design and deploy production ML models for our recommendation and fraud detection systems. Work with petabyte-scale datasets and cutting-edge infrastructure.',
    requiredSkills: ['Python', 'Machine Learning', 'TensorFlow', 'SQL', 'MLOps'], minExperience: 3, isOpen: true,
  },
  {
    title: 'DevOps Engineer', department: 'DevOps',
    description: 'Own our infrastructure reliability and developer experience. Design and maintain CI/CD pipelines, Kubernetes clusters, and observability stack across multi-cloud environments.',
    requiredSkills: ['Kubernetes', 'Terraform', 'AWS', 'CI/CD', 'Python'], minExperience: 4, isOpen: true,
  },
  {
    title: 'Product Manager – Growth', department: 'Product Management',
    description: 'Drive product-led growth strategy for our B2B SaaS platform. Own the activation and retention funnel. Work cross-functionally with Engineering, Design, and Marketing.',
    requiredSkills: ['Product Strategy', 'Data Analysis', 'Agile', 'User Research', 'Roadmapping'], minExperience: 5, isOpen: true,
  },
  {
    title: 'Finance Business Partner', department: 'Finance',
    description: 'Strategic finance partner to business unit leaders. Drive FP&A processes, monthly business reviews, and long-term planning. Build financial models to support M&A and strategic decisions.',
    requiredSkills: ['Financial Modeling', 'Excel', 'Power BI', 'SAP FICO', 'GAAP'], minExperience: 6, isOpen: true,
  },
  {
    title: 'Digital Marketing Manager', department: 'Marketing',
    description: 'Lead integrated digital marketing campaigns across paid, organic, and social channels. Own the demand generation function.',
    requiredSkills: ['Digital Marketing', 'SEO/SEM', 'Google Analytics', 'HubSpot', 'Content Strategy'], minExperience: 4, isOpen: true,
  },
  {
    title: 'Enterprise Account Executive', department: 'Sales',
    description: 'Manage and expand a portfolio of enterprise accounts. Drive new logo acquisition and expansion revenue.',
    requiredSkills: ['B2B Sales', 'CRM (Salesforce)', 'Solution Selling', 'Negotiation', 'Account Management'], minExperience: 5, isOpen: true,
  },
  {
    title: 'Customer Success Manager', department: 'Customer Success',
    description: 'Own a portfolio of 50+ mid-market customers. Drive adoption, retention, and NPS.',
    requiredSkills: ['Customer Onboarding', 'SaaS Metrics', 'NPS Analysis', 'Churn Prevention', 'Training'], minExperience: 3, isOpen: false,
  },
  {
    title: 'Senior Java Backend Engineer', department: 'Engineering',
    description: 'Design high-throughput microservices powering our core transaction platform handling 10M+ events/day.',
    requiredSkills: ['Java', 'Spring Boot', 'Microservices', 'Kafka', 'PostgreSQL'], minExperience: 5, isOpen: true,
  },
  {
    title: 'HR Business Partner', department: 'Human Resources',
    description: 'Strategic HR partner to 3 business units. Drive talent management, performance cycles, and culture initiatives.',
    requiredSkills: ['Talent Acquisition', 'HRIS Management', 'HR Analytics', 'Labor Law', 'Compensation & Benefits'], minExperience: 5, isOpen: true,
  },
];

// ══════════════════════════════════════════════════════════════════════
// SEED FUNCTION
// ══════════════════════════════════════════════════════════════════════

async function seed() {
  try {
    console.log('\nVactrix Enterprise — Seed Script\n');
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/vactrix';
    await mongoose.connect(uri);
    console.log('MongoDB connected →', uri);

    // ── STEP 1: Drop ALL collections for a clean slate ────────────────
    console.log('\n── Dropping all collections ──');
    const collections = await mongoose.connection.db.listCollections().toArray();
    for (const col of collections) {
      await mongoose.connection.db.dropCollection(col.name);
      console.log(`   Dropped: ${col.name}`);
    }
    if (!collections.length) console.log('   (database was already empty)');

    // ── STEP 2: Create users ──────────────────────────────────────────
    console.log('\n── Seeding 12 professional users ──');
    const createdUsers = [];
    for (const u of SEED_USERS) {
      const { plainPassword, ...rest } = u;
      const password = await bcrypt.hash(plainPassword, 10);
      const user = await User.create({ ...rest, password });
      createdUsers.push(user);
      console.log(`   [${u.role.padEnd(8)}] ${u.email}`);
    }

    // ── STEP 3: Org hierarchy ─────────────────────────────────────────
    console.log('\n── Seeding org hierarchy ──');
    const titleToId = {};
    for (const n of ORG_STRUCTURE) {
      const node = await OrgNode.create({
        title: n.title, department: n.department, level: n.level,
        parentId: null, isVacant: Math.random() > 0.65, occupiedBy: null,
      });
      titleToId[n.title] = node._id;
    }
    for (const n of ORG_STRUCTURE) {
      if (n.parentTitle && titleToId[n.parentTitle]) {
        await OrgNode.updateOne({ _id: titleToId[n.title] }, { parentId: titleToId[n.parentTitle] });
      }
    }
    // Assign employees to nodes
    const assignments = [
      ['Rohan Kapoor',    'Software Engineer II'],
      ['Sneha Patel',     'Data Analyst'],
      ['Vikram Singh',    'Senior DevOps Engineer'],
      ['Ananya Krishnan', 'Senior Product Manager'],
      ['Rahul Gupta',     'Senior Finance Analyst'],
      ['Meera Nair',      'Senior Marketing Specialist'],
      ['Aditya Reddy',    'Senior Account Executive'],
      ['Kavya Iyer',      'Customer Success Manager'],
      ['Siddharth Joshi', 'Software Engineer II'],
      ['Divya Menon',     'Operations Manager'],
    ];
    for (const [name, nodeTitle] of assignments) {
      const emp = createdUsers.find(u => u.name === name);
      if (emp && titleToId[nodeTitle]) {
        await OrgNode.updateOne({ _id: titleToId[nodeTitle] }, { occupiedBy: emp._id, isVacant: false });
      }
    }
    console.log(`   ${ORG_STRUCTURE.length} nodes + employee assignments done`);

    // ── STEP 4: Jobs ──────────────────────────────────────────────────
    console.log('\n── Seeding 10 job postings ──');
    const hrUser = createdUsers.find(u => u.role === 'hr');
    const createdJobs = [];
    for (const j of SAMPLE_JOBS) {
      const job = await Job.create({ ...j, postedBy: hrUser._id });
      createdJobs.push(job);
      console.log(`   ${j.title} (${j.isOpen ? 'OPEN' : 'CLOSED'})`);
    }

    // ── STEP 5: Applications ──────────────────────────────────────────
    console.log('\n── Seeding applications ──');
    const employees = createdUsers.filter(u => u.role === 'employee');
    const statuses = ['pending','shortlisted','approved','rejected'];
    const weights  = [0.3, 0.25, 0.25, 0.2];
    function weightedStatus() {
      const r = Math.random(); let sum = 0;
      for (let i = 0; i < weights.length; i++) { sum += weights[i]; if (r < sum) return statuses[i]; }
      return 'pending';
    }
    let appCount = 0;
    for (const job of createdJobs) {
      const numApplicants = Math.floor(Math.random() * 4) + 2;
      const shuffled = [...employees].sort(() => 0.5 - Math.random()).slice(0, numApplicants);
      for (const emp of shuffled) {
        const skillScore = Math.floor(Math.random() * 40) + 50;
        const expScore   = Math.floor(Math.random() * 30) + 55;
        const perfScore  = emp.performanceRating * 20;
        const finalScore = Math.round((skillScore * 0.4) + (expScore * 0.35) + (perfScore * 0.25));
        const createdAt  = new Date(Date.now() - Math.floor(Math.random() * 90) * 86400000);
        await Application.create({
          userId: emp._id, jobId: job._id, status: weightedStatus(),
          skillScore, expScore, perfScore,
          certScore: Math.floor(Math.random() * 20) + 10,
          finalScore, createdAt, updatedAt: createdAt,
        });
        appCount++;
      }
    }
    console.log(`   ${appCount} applications`);

    // ── STEP 6: Notifications ─────────────────────────────────────────
    console.log('\n── Seeding notifications ──');
    const notifTemplates = [
      { title: 'New job posted: Senior React Developer', message: 'A new Engineering position is open. Check your eligibility.', type: 'new_job_posted', link: '/jobs' },
      { title: 'Application shortlisted!', message: 'Your application for Machine Learning Engineer has been shortlisted.', type: 'application_shortlisted', link: '/my-applications' },
      { title: 'System maintenance scheduled', message: 'Vactrix will undergo maintenance on Sunday 2–4 AM IST.', type: 'system', link: null },
      { title: 'Profile updated successfully', message: 'Your skills and certifications have been saved.', type: 'system', link: '/profile' },
    ];
    for (let i = 0; i < employees.length && i < 4; i++) {
      const tmpl = notifTemplates[i % notifTemplates.length];
      await Notification.create({ recipientId: employees[i]._id, recipientRole: 'employee', ...tmpl, isRead: Math.random() > 0.5 });
    }
    await Notification.create({
      recipientId: hrUser._id, recipientRole: 'hr',
      title: '12 new applications this week',
      message: 'Engineering team has 5 high-score applications. Review recommended.',
      type: 'system', isRead: false, link: '/hr/analytics',
    });
    console.log('   Notifications created');

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Vactrix Seed Complete!\n');
    console.log('  Login credentials:');
    console.log('  Admin    → admin@vactrix.com          / admin123');
    console.log('  HR       → hr@vactrix.com             / hr123456');
    console.log('  Employee → rohan.kapoor@vactrix.com   / emp12345');
    console.log('\n  Seeded:');
    console.log(`  • ${SEED_USERS.length} users across 10 departments`);
    console.log(`  • ${ORG_STRUCTURE.length} org nodes`);
    console.log(`  • ${SAMPLE_JOBS.length} jobs | ${appCount} applications`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    process.exit(0);
  } catch (err) {
    console.error('\nSeed failed:', err.message);
    console.error(err.stack);
    process.exit(1);
  }
}

seed();

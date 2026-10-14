/**
 * Section 4: Seed Data and Invariant selfTest()
 */

import {
  CitizenRecord,
  StudentProfile,
  EducationAccount,
  EaLedgerEntry,
  ParentProfile,
  Invoice,
  Transaction,
  SyncLog,
  AuditLog,
  SecurityLog,
} from '../types';
import { parseIsoDate, anniversary, cmp } from '../services/clock';

export function createInitialSeed() {
  const citizenRecords: CitizenRecord[] = [
    {
      nric: 'S1234567A',
      fullName: 'Tan Jun Hao',
      dob: { y: 2016, m: 8, d: 20 },
      citizenship: 'Citizen',
      gender: 'Male',
      race: 'Chinese',
      residentialAddress: 'Blk 123 Ang Mo Kio Ave 4 #08-12, Singapore 560123',
      fatherNric: 'S7890123A',
      motherNric: 'S7890124B',
    },
    {
      nric: 'S1234568B',
      fullName: 'Tan Jia Yi',
      dob: { y: 2012, m: 5, d: 6 },
      citizenship: 'Citizen',
      gender: 'Female',
      race: 'Chinese',
      residentialAddress: 'Blk 123 Ang Mo Kio Ave 4 #08-12, Singapore 560123',
      fatherNric: 'S7890123A',
      motherNric: 'S7890124B',
    },
    {
      nric: 'S2345678C',
      fullName: 'Rahman Irfan',
      dob: { y: 2010, m: 10, d: 14 }, // Exactly 16 today on 14/10/2026!
      citizenship: 'Citizen',
      gender: 'Male',
      race: 'Malay',
      residentialAddress: 'Blk 456 Tampines St 42 #04-102, Singapore 520456',
      fatherNric: 'S7901234C',
    },
    {
      nric: 'S2345679D',
      fullName: 'Rahman Aisyah',
      dob: { y: 2012, m: 3, d: 10 },
      citizenship: 'Citizen',
      gender: 'Female',
      race: 'Malay',
      residentialAddress: 'Blk 456 Tampines St 42 #04-102, Singapore 520456',
      fatherNric: 'S7901234C',
    },
    {
      nric: 'S3456789E',
      fullName: 'Siti Nur Hana',
      dob: { y: 2010, m: 6, d: 2 }, // 16 with $112.40 balance
      citizenship: 'Citizen',
      gender: 'Female',
      race: 'Malay',
      residentialAddress: 'Blk 789 Woodlands Ave 6 #11-54, Singapore 730789',
      motherNric: 'S8012345D',
    },
    {
      nric: 'S3456790F',
      fullName: 'Ahmad Danish',
      dob: { y: 2013, m: 2, d: 11 },
      citizenship: 'Citizen',
      gender: 'Male',
      race: 'Malay',
      residentialAddress: 'Blk 789 Woodlands Ave 6 #11-54, Singapore 730789',
      motherNric: 'S8012345D',
    },
    {
      nric: 'S4567890G',
      fullName: 'Faizal Aryan',
      dob: { y: 2017, m: 4, d: 12 },
      citizenship: 'PR',
      gender: 'Male',
      race: 'Indian',
      residentialAddress: 'Blk 321 Jurong West St 51 #09-88, Singapore 640321',
      motherNric: 'S8123456E',
    },
    {
      nric: 'G5678901H',
      fullName: 'Chen Yu',
      dob: { y: 2011, m: 6, d: 25 },
      citizenship: 'Foreigner',
      gender: 'Male',
      race: 'Chinese',
      residentialAddress: '15 Meyer Road #14-02, Singapore 437874',
      motherNric: 'S8123456E',
    },
    {
      nric: 'T1234561A',
      fullName: 'Wong Zi Hao',
      dob: { y: 2019, m: 10, d: 20 }, // 6yo (Not yet 7, birthday 20/10/2026)
      citizenship: 'Citizen',
      gender: 'Male',
      race: 'Chinese',
      residentialAddress: 'Blk 654 Bedok Reservoir Rd #05-32, Singapore 470654',
      fatherNric: 'S8234567F',
    },
    {
      nric: 'T1234562B',
      fullName: 'Wong Rachel',
      dob: { y: 2019, m: 10, d: 14 }, // Exactly 7 today on 14/10/2026!
      citizenship: 'Citizen',
      gender: 'Female',
      race: 'Chinese',
      residentialAddress: 'Blk 654 Bedok Reservoir Rd #05-32, Singapore 470654',
      fatherNric: 'S8234567F',
    },
    {
      nric: 'T1234563C',
      fullName: 'Wong Ethan',
      dob: { y: 2019, m: 10, d: 14 }, // 7 today, missing gender
      citizenship: 'Citizen',
      gender: undefined, // Missing gender test case
      race: 'Chinese',
      residentialAddress: 'Blk 654 Bedok Reservoir Rd #05-32, Singapore 470654',
      fatherNric: 'S8234567F',
    },
    {
      nric: 'S5678902I',
      fullName: 'Chen Xin Yi',
      dob: { y: 2016, m: 2, d: 11 },
      citizenship: 'Citizen',
      gender: 'Female',
      race: 'Chinese',
      residentialAddress: 'Blk 987 Toa Payoh Lor 4 #12-210, Singapore 310987',
      motherNric: 'S8345678G',
    },
    {
      nric: 'S2345670J',
      fullName: 'Ong Wei Ling',
      dob: { y: 2010, m: 1, d: 10 }, // 16, Closed on 10/01/2026
      citizenship: 'Citizen',
      gender: 'Female',
      race: 'Chinese',
      residentialAddress: 'Blk 147 Bishan St 13 #07-15, Singapore 570147',
      motherNric: 'S8456789H',
    },
    // Citizen record with no children linked (for P9)
    {
      nric: 'S8567890I',
      fullName: 'Wong Mei Ling',
      dob: { y: 1988, m: 9, d: 15 },
      citizenship: 'Citizen',
      gender: 'Female',
      race: 'Chinese',
      residentialAddress: 'Blk 258 Pasir Ris Dr 21 #03-44, Singapore 510258',
    },
  ];

  const students: StudentProfile[] = [
    {
      id: 'ST-A1-7K2Q',
      nric: 'S****567A',
      fullName: 'Tan Jun Hao',
      dob: { y: 2016, m: 8, d: 20 },
      citizenship: 'Citizen',
      gender: 'Male',
      school: 'Bukit View Primary School',
      level: 'Primary 4',
      class: '4 Charity',
      fatherNric: 'S7890123A',
      motherNric: 'S7890124B',
      fasGranted: 'MOEFAS Tier 2',
    },
    {
      id: 'ST-A2-9M4L',
      nric: 'S****568B',
      fullName: 'Tan Jia Yi',
      dob: { y: 2012, m: 5, d: 6 },
      citizenship: 'Citizen',
      gender: 'Female',
      school: 'Methodist Girls\' School (Secondary)',
      level: 'Secondary 2',
      class: '2 Hope',
      fatherNric: 'S7890123A',
      motherNric: 'S7890124B',
    },
    {
      id: 'ST-B1-3P8X',
      nric: 'S****678C',
      fullName: 'Rahman Irfan',
      dob: { y: 2010, m: 10, d: 14 },
      citizenship: 'Citizen',
      gender: 'Male',
      school: 'Montfort Secondary School',
      level: 'Secondary 4',
      class: '4 Integrity',
      fatherNric: 'S7901234C',
    },
    {
      id: 'ST-B2-5W2K',
      nric: 'S****679D',
      fullName: 'Rahman Aisyah',
      dob: { y: 2012, m: 3, d: 10 },
      citizenship: 'Citizen',
      gender: 'Female',
      school: 'Montfort Secondary School',
      level: 'Secondary 2',
      class: '2 Faith',
      fatherNric: 'S7901234C',
    },
    {
      id: 'ST-C1-8R6Y',
      nric: 'S****789E',
      fullName: 'Siti Nur Hana',
      dob: { y: 2010, m: 6, d: 2 },
      citizenship: 'Citizen',
      gender: 'Female',
      school: 'Marsiling Secondary School',
      level: 'Secondary 4',
      class: '4 Diligence',
      motherNric: 'S8012345D',
    },
    {
      id: 'ST-C2-2N9Z',
      nric: 'S****790F',
      fullName: 'Ahmad Danish',
      dob: { y: 2013, m: 2, d: 11 },
      citizenship: 'Citizen',
      gender: 'Male',
      school: 'Marsiling Secondary School',
      level: 'Secondary 1',
      class: '1 Graciousness',
      motherNric: 'S8012345D',
    },
    {
      id: 'ST-D1-4H1J',
      nric: 'S****890G',
      fullName: 'Faizal Aryan',
      dob: { y: 2017, m: 4, d: 12 },
      citizenship: 'PR',
      gender: 'Male',
      school: 'Lakeside Primary School',
      level: 'Primary 3',
      class: '3 Empathy',
      motherNric: 'S8123456E',
    },
    {
      id: 'ST-D2-6V3B',
      nric: 'G****901H',
      fullName: 'Chen Yu',
      dob: { y: 2011, m: 6, d: 25 },
      citizenship: 'Foreigner',
      gender: 'Male',
      school: 'Mayflower Secondary School',
      level: 'Secondary 3',
      class: '3 Unity',
      motherNric: 'S8123456E',
    },
    {
      id: 'ST-E1-1Q5C',
      nric: 'T****561A',
      fullName: 'Wong Zi Hao',
      dob: { y: 2019, m: 10, d: 20 },
      citizenship: 'Citizen',
      gender: 'Male',
      school: 'Lianhua Primary School',
      level: 'Primary 1',
      class: '1 Joy',
      fatherNric: 'S8234567F',
    },
    {
      id: 'ST-E2-9T7D',
      nric: 'T****562B',
      fullName: 'Wong Rachel',
      dob: { y: 2019, m: 10, d: 14 },
      citizenship: 'Citizen',
      gender: 'Female',
      school: 'Bukit View Primary School',
      level: 'Primary 1',
      class: '1 Kindness',
      fatherNric: 'S8234567F',
    },
    {
      id: 'ST-E3-8U4E',
      nric: 'T****563C',
      fullName: 'Wong Ethan',
      dob: { y: 2019, m: 10, d: 14 },
      citizenship: 'Citizen',
      school: 'Bukit View Primary School',
      level: 'Primary 1',
      class: '1 Kindness',
      fatherNric: 'S8234567F',
    },
    {
      id: 'ST-F1-7S2M',
      nric: 'S****902I',
      fullName: 'Chen Xin Yi',
      dob: { y: 2016, m: 2, d: 11 },
      citizenship: 'Citizen',
      gender: 'Female',
      school: 'Bukit View Primary School',
      level: 'Primary 4',
      class: '4 Respect',
      motherNric: 'S8345678G',
    },
    {
      id: 'ST-G1-5K8L',
      nric: 'S****670J',
      fullName: 'Ong Wei Ling',
      dob: { y: 2010, m: 1, d: 10 },
      citizenship: 'Citizen',
      gender: 'Female',
      school: 'Methodist Girls\' School (Secondary)',
      level: 'Secondary 4',
      class: '4 Wisdom',
      motherNric: 'S8456789H',
    },
  ];

  const parents: ParentProfile[] = [
    {
      id: 'P1',
      code: 'PRNT-P1-001',
      userId: '', // Populated upon first SingPass login (AC 1)
      nric: 'S****123A',
      fullName: 'Tan Wei Ming',
      phoneNumber: '91234567',
      email: 'tan.weiming@example.com',
      residentialAddress: 'Blk 123 Ang Mo Kio Ave 4 #08-12, Singapore 560123',
      mailingBlock: '123',
      mailingUnit: '#08-12',
      mailingStreet: 'Ang Mo Kio Ave 4',
      mailingPostalCode: '560123',
      mailingCountry: 'Singapore',
      isActivate: false, // First-time login: creates account & links A1, A2
      createdAt: '2026-10-14T08:00:00Z',
      updatedAt: '2026-10-14T08:00:00Z',
      createdBy: 'SYSTEM_SYNC',
      updatedBy: 'SYSTEM_SYNC',
    },
    {
      id: 'P2',
      code: 'PRNT-P2-002',
      userId: 'USR-LM-9921',
      nric: 'S****124B',
      fullName: 'Lim Mei Ling',
      phoneNumber: '82345678',
      email: 'lim.meiling@example.com',
      residentialAddress: 'Blk 123 Ang Mo Kio Ave 4 #08-12, Singapore 560123',
      mailingBlock: '123',
      mailingUnit: '#08-12',
      mailingStreet: 'Ang Mo Kio Ave 4',
      mailingPostalCode: '560123',
      mailingCountry: 'Singapore',
      isActivate: true, // Already registered: second login doesn't duplicate (AC 2, 4)
      createdAt: '2026-09-01T08:00:00Z',
      updatedAt: '2026-09-01T08:00:00Z',
      createdBy: 'SINGPASS_AUTH',
      updatedBy: 'SINGPASS_AUTH',
    },
    {
      id: 'P3',
      code: 'PRNT-P3-003',
      userId: '',
      nric: 'S****234C',
      fullName: 'Rahman Yusof',
      phoneNumber: '93456789',
      email: 'rahman.yusof@example.com',
      residentialAddress: 'Blk 456 Tampines St 42 #04-102, Singapore 520456',
      mailingBlock: '456',
      mailingUnit: '#04-102',
      mailingStreet: 'Tampines St 42',
      mailingPostalCode: '520456',
      mailingCountry: 'Singapore',
      isActivate: false,
      createdAt: '2026-10-14T08:00:00Z',
      updatedAt: '2026-10-14T08:00:00Z',
      createdBy: 'SYSTEM_SYNC',
      updatedBy: 'SYSTEM_SYNC',
    },
    {
      id: 'P4',
      code: 'PRNT-P4-004',
      userId: '',
      nric: 'S****345D',
      fullName: 'Siti Aminah',
      phoneNumber: '94567890',
      email: 'siti.aminah@example.com',
      residentialAddress: 'Blk 789 Woodlands Ave 6 #11-54, Singapore 730789',
      mailingBlock: '789',
      mailingUnit: '#11-54',
      mailingStreet: 'Woodlands Ave 6',
      mailingPostalCode: '730789',
      mailingCountry: 'Singapore',
      isActivate: false,
      createdAt: '2026-10-14T08:00:00Z',
      updatedAt: '2026-10-14T08:00:00Z',
      createdBy: 'SYSTEM_SYNC',
      updatedBy: 'SYSTEM_SYNC',
    },
    {
      id: 'P5',
      code: 'PRNT-P5-005',
      userId: '',
      nric: 'S****456E',
      fullName: 'Priya Nair',
      phoneNumber: '85678901',
      email: 'priya.nair@example.com',
      residentialAddress: 'Blk 321 Jurong West St 51 #09-88, Singapore 640321',
      mailingBlock: '321',
      mailingUnit: '#09-88',
      mailingStreet: 'Jurong West St 51',
      mailingPostalCode: '640321',
      mailingCountry: 'Singapore',
      isActivate: false,
      createdAt: '2026-10-14T08:00:00Z',
      updatedAt: '2026-10-14T08:00:00Z',
      createdBy: 'SYSTEM_SYNC',
      updatedBy: 'SYSTEM_SYNC',
    },
    {
      id: 'P6',
      code: 'PRNT-P6-006',
      userId: '',
      nric: 'S****567F',
      fullName: 'Daniel Wong',
      phoneNumber: '96789012',
      email: 'daniel.wong@example.com',
      residentialAddress: 'Blk 654 Bedok Reservoir Rd #05-32, Singapore 470654',
      mailingBlock: '654',
      mailingUnit: '#05-32',
      mailingStreet: 'Bedok Reservoir Rd',
      mailingPostalCode: '470654',
      mailingCountry: 'Singapore',
      isActivate: false,
      createdAt: '2026-10-14T08:00:00Z',
      updatedAt: '2026-10-14T08:00:00Z',
      createdBy: 'SYSTEM_SYNC',
      updatedBy: 'SYSTEM_SYNC',
    },
    {
      id: 'P7',
      code: 'PRNT-P7-007',
      userId: '',
      nric: 'S****678G',
      fullName: 'Chen Li Hua',
      phoneNumber: '97890123',
      email: 'chen.lihua@example.com',
      residentialAddress: 'Blk 987 Toa Payoh Lor 4 #12-210, Singapore 310987',
      mailingBlock: '987',
      mailingUnit: '#12-210',
      mailingStreet: 'Toa Payoh Lor 4',
      mailingPostalCode: '310987',
      mailingCountry: 'Singapore',
      isActivate: false,
      createdAt: '2026-10-14T08:00:00Z',
      updatedAt: '2026-10-14T08:00:00Z',
      createdBy: 'SYSTEM_SYNC',
      updatedBy: 'SYSTEM_SYNC',
    },
    {
      id: 'P8',
      code: 'PRNT-P8-008',
      userId: '',
      nric: 'S****789H',
      fullName: 'Grace Ong',
      phoneNumber: '98901234',
      email: 'grace.ong@example.com',
      residentialAddress: 'Blk 147 Bishan St 13 #07-15, Singapore 570147',
      mailingBlock: '147',
      mailingUnit: '#07-15',
      mailingStreet: 'Bishan St 13',
      mailingPostalCode: '570147',
      mailingCountry: 'Singapore',
      isActivate: false,
      createdAt: '2026-10-14T08:00:00Z',
      updatedAt: '2026-10-14T08:00:00Z',
      createdBy: 'SYSTEM_SYNC',
      updatedBy: 'SYSTEM_SYNC',
    },
    {
      id: 'P9',
      code: 'PRNT-P9-009',
      userId: '',
      nric: 'S****890I',
      fullName: 'Wong Mei Ling',
      phoneNumber: '99012345',
      email: 'wong.meiling@example.com',
      residentialAddress: 'Blk 258 Pasir Ris Dr 21 #03-44, Singapore 510258',
      mailingBlock: '258',
      mailingUnit: '#03-44',
      mailingStreet: 'Pasir Ris Dr 21',
      mailingPostalCode: '510258',
      mailingCountry: 'Singapore',
      isActivate: false,
      createdAt: '2026-10-14T08:00:00Z',
      updatedAt: '2026-10-14T08:00:00Z',
      createdBy: 'SYSTEM_SYNC',
      updatedBy: 'SYSTEM_SYNC',
    },
  ];

  // Education Accounts
  const educationAccounts: EducationAccount[] = [
    {
      accountNumber: 'EA-2016-100820-A1',
      studentId: 'ST-A1-7K2Q',
      balanceCents: 45507, // SGD 455.07
      status: 'Active',
      currency: 'SGD',
      createdAt: '2023-08-20T00:00:00Z',
      lastUpdatedAt: '2026-10-01T08:00:00Z',
    },
    {
      accountNumber: 'EA-2012-050614-A2',
      studentId: 'ST-A2-9M4L',
      balanceCents: 2000, // SGD 20.00
      status: 'Active',
      currency: 'SGD',
      createdAt: '2019-05-06T00:00:00Z',
      lastUpdatedAt: '2026-10-01T08:00:00Z',
    },
    {
      // B1: 16 today on 14/10/2026, balance 0. Closes on first access!
      accountNumber: 'EA-2010-101416-B1',
      studentId: 'ST-B1-3P8X',
      balanceCents: 0,
      status: 'Active', // Becomes 'Closed' as soon as ensureClosureCheck runs
      currency: 'SGD',
      createdAt: '2017-10-14T00:00:00Z',
      lastUpdatedAt: '2026-10-01T08:00:00Z',
    },
    {
      accountNumber: 'EA-2012-031014-B2',
      studentId: 'ST-B2-5W2K',
      balanceCents: 31000, // SGD 310.00
      status: 'Active',
      currency: 'SGD',
      createdAt: '2019-03-10T00:00:00Z',
      lastUpdatedAt: '2026-10-01T08:00:00Z',
    },
    {
      // C1: 16 years old with remaining balance SGD 112.40 (Closure deferred)
      accountNumber: 'EA-2010-060216-C1',
      studentId: 'ST-C1-8R6Y',
      balanceCents: 11240, // SGD 112.40
      status: 'Active', // Closure check will set closureDeferred = true
      currency: 'SGD',
      createdAt: '2017-06-02T00:00:00Z',
      lastUpdatedAt: '2026-06-02T08:00:00Z',
    },
    {
      accountNumber: 'EA-2013-021113-C2',
      studentId: 'ST-C2-2N9Z',
      balanceCents: 8500, // SGD 85.00
      status: 'Active',
      currency: 'SGD',
      createdAt: '2020-02-11T00:00:00Z',
      lastUpdatedAt: '2026-10-01T08:00:00Z',
    },
    {
      accountNumber: 'EA-2016-021110-F1',
      studentId: 'ST-F1-7S2M',
      balanceCents: 20000, // SGD 200.00
      status: 'Active',
      currency: 'SGD',
      createdAt: '2023-02-11T00:00:00Z',
      lastUpdatedAt: '2026-10-01T08:00:00Z',
    },
    {
      accountNumber: 'EA-2010-011016-G1',
      studentId: 'ST-G1-5K8L',
      balanceCents: 0,
      status: 'Closed',
      currency: 'SGD',
      createdAt: '2017-01-10T00:00:00Z',
      lastUpdatedAt: '2026-01-10T08:00:00Z',
      closedAt: '2026-01-10T08:00:00Z',
    },
  ];

  // Invoices (Section 4.4 and 4.5)
  const invoices: Invoice[] = [
    // A1 Invoices
    {
      id: 'INV-A1-1001',
      invoiceNumber: 'INV-2026-1001',
      studentId: 'ST-A1-7K2Q',
      schoolId: 'SCH-BVP',
      schoolName: 'Bukit View Primary School',
      grossCents: 1500,
      subsidyCents: 0,
      netCents: 1500, // SGD 15.00
      status: 'Issued',
      issuedAt: '2026-09-15T08:00:00Z',
      dueDate: '2026-10-05', // Overdue
      rowVersion: 1,
      items: [
        {
          id: 'ITEM-1001-1',
          invoiceId: 'INV-A1-1001',
          lineNumber: 1,
          studentChargeId: 'CHG-1001-1',
          feeType: 'Ad hoc',
          description: 'Library book replacement',
          components: [{ name: 'Replacement fee', amountCents: 1500 }],
          grossCents: 1500,
          subsidyCents: 0,
          netCents: 1500,
          dueDate: '2026-10-05',
        },
      ],
    },
    {
      id: 'INV-A1-1002',
      invoiceNumber: 'INV-2026-1002',
      studentId: 'ST-A1-7K2Q',
      schoolId: 'SCH-BVP',
      schoolName: 'Bukit View Primary School',
      grossCents: 6198,
      subsidyCents: 0,
      netCents: 6198, // SGD 61.98
      status: 'Issued',
      issuedAt: '2026-10-01T08:00:00Z',
      dueDate: '2026-10-30', // Due soon
      rowVersion: 1,
      items: [
        {
          id: 'ITEM-1002-1',
          invoiceId: 'INV-A1-1002',
          lineNumber: 1,
          studentChargeId: 'CHG-1002-1',
          feeType: 'School fee',
          description: 'School Fee Term 4',
          components: [{ name: 'Standard school fee', amountCents: 3800 }],
          grossCents: 3800,
          subsidyCents: 0,
          netCents: 3800,
          dueDate: '2026-10-30',
        },
        {
          id: 'ITEM-1002-2',
          invoiceId: 'INV-A1-1002',
          lineNumber: 2,
          studentChargeId: 'CHG-1002-2',
          feeType: 'Extracurricular',
          description: 'Learning Journey, Science Centre',
          components: [
            { name: 'Admission & Transport', amountCents: 2200 },
            { name: 'GST (9%)', amountCents: 198 },
          ],
          grossCents: 2398,
          subsidyCents: 0,
          netCents: 2398,
          dueDate: '2026-10-30',
        },
      ],
    },
    {
      id: 'INV-A1-1003',
      invoiceNumber: 'INV-2026-1003',
      studentId: 'ST-A1-7K2Q',
      schoolId: 'SCH-BVP',
      schoolName: 'Bukit View Primary School',
      grossCents: 7031,
      subsidyCents: 0,
      netCents: 7031, // SGD 70.31
      status: 'Issued',
      issuedAt: '2026-10-05T08:00:00Z',
      dueDate: '2026-11-15', // Not due yet
      rowVersion: 1,
      items: [
        {
          id: 'ITEM-1003-1',
          invoiceId: 'INV-A1-1003',
          lineNumber: 1,
          studentChargeId: 'CHG-1003-1',
          feeType: 'Miscellaneous',
          description: 'Textbooks (Standard Curriculum)',
          components: [
            { name: 'Base price', amountCents: 4500 },
            { name: 'GST (9%)', amountCents: 405 },
          ],
          grossCents: 4905,
          subsidyCents: 0,
          netCents: 4905,
          dueDate: '2026-11-15',
        },
        {
          id: 'ITEM-1003-2',
          invoiceId: 'INV-A1-1003',
          lineNumber: 2,
          studentChargeId: 'CHG-1003-2',
          feeType: 'Miscellaneous',
          description: 'Workbooks & Activity Sheets',
          components: [
            { name: 'Base price', amountCents: 1950 },
            { name: 'GST (9%)', amountCents: 176 },
          ],
          grossCents: 2126,
          subsidyCents: 0,
          netCents: 2126,
          dueDate: '2026-11-15',
        },
      ],
    },
    {
      id: 'INV-A1-1004',
      invoiceNumber: 'INV-2026-1004',
      studentId: 'ST-A1-7K2Q',
      schoolId: 'SCH-BVP',
      schoolName: 'Bukit View Primary School',
      grossCents: 3052,
      subsidyCents: 0,
      netCents: 3052, // SGD 30.52
      status: 'Issued',
      issuedAt: '2026-10-10T08:00:00Z',
      dueDate: '2026-11-30', // Not due yet
      rowVersion: 1,
      items: [
        {
          id: 'ITEM-1004-1',
          invoiceId: 'INV-A1-1004',
          lineNumber: 1,
          studentChargeId: 'CHG-1004-1',
          feeType: 'Miscellaneous',
          description: 'CCA Uniform (Choir)',
          components: [
            { name: 'Attire Set', amountCents: 2800 },
            { name: 'GST (9%)', amountCents: 252 },
          ],
          grossCents: 3052,
          subsidyCents: 0,
          netCents: 3052,
          dueDate: '2026-11-30',
        },
      ],
    },

    // A2 Invoices
    {
      id: 'INV-A2-2001',
      invoiceNumber: 'INV-2026-2001',
      studentId: 'ST-A2-9M4L',
      schoolId: 'SCH-MCS',
      schoolName: 'Methodist Girls\' School (Secondary)',
      grossCents: 5000,
      subsidyCents: 0,
      netCents: 5000, // SGD 50.00
      status: 'Issued',
      issuedAt: '2026-10-01T08:00:00Z',
      dueDate: '2026-11-20',
      rowVersion: 1,
      items: [
        {
          id: 'ITEM-2001-1',
          invoiceId: 'INV-A2-2001',
          lineNumber: 1,
          studentChargeId: 'CHG-2001-1',
          feeType: 'Miscellaneous',
          description: 'Art Materials & Portfolio Kit',
          components: [{ name: 'Kit package', amountCents: 5000 }],
          grossCents: 5000,
          subsidyCents: 0,
          netCents: 5000,
          dueDate: '2026-11-20',
        },
      ],
    },
    {
      id: 'INV-A2-2002',
      invoiceNumber: 'INV-2026-2002',
      studentId: 'ST-A2-9M4L',
      schoolId: 'SCH-MCS',
      schoolName: 'Methodist Girls\' School (Secondary)',
      grossCents: 5400,
      subsidyCents: 0,
      netCents: 5400, // SGD 54.00
      status: 'Issued',
      issuedAt: '2026-10-01T08:00:00Z',
      dueDate: '2026-10-31',
      rowVersion: 1,
      items: [
        {
          id: 'ITEM-2002-1',
          invoiceId: 'INV-A2-2002',
          lineNumber: 1,
          studentChargeId: 'CHG-2002-1',
          feeType: 'School fee',
          description: 'School Fee Term 4 (Secondary)',
          components: [{ name: 'Standard tuition', amountCents: 5400 }],
          grossCents: 5400,
          subsidyCents: 0,
          netCents: 5400,
          dueDate: '2026-10-31',
        },
      ],
    },
    {
      id: 'INV-A2-2000',
      invoiceNumber: 'INV-2026-2000',
      studentId: 'ST-A2-9M4L',
      schoolId: 'SCH-MCS',
      schoolName: 'Methodist Girls\' School (Secondary)',
      grossCents: 5400,
      subsidyCents: 0,
      netCents: 5400,
      status: 'Paid',
      issuedAt: '2026-07-01T08:00:00Z',
      dueDate: '2026-07-31',
      paidAt: '2026-07-20T10:15:00Z',
      rowVersion: 2,
      items: [
        {
          id: 'ITEM-2000-1',
          invoiceId: 'INV-A2-2000',
          lineNumber: 1,
          studentChargeId: 'CHG-2000-1',
          feeType: 'School fee',
          description: 'School Fee Term 3 (Secondary)',
          components: [{ name: 'Standard tuition', amountCents: 5400 }],
          grossCents: 5400,
          subsidyCents: 0,
          netCents: 5400,
          dueDate: '2026-07-31',
        },
      ],
    },

    // B1 Invoice
    {
      id: 'INV-B1-3001',
      invoiceNumber: 'INV-2026-3001',
      studentId: 'ST-B1-3P8X',
      schoolId: 'SCH-MCS-SEC',
      schoolName: 'Montfort Secondary School',
      grossCents: 5400,
      subsidyCents: 0,
      netCents: 5400,
      status: 'Issued',
      issuedAt: '2026-10-01T08:00:00Z',
      dueDate: '2026-10-31',
      rowVersion: 1,
      items: [
        {
          id: 'ITEM-3001-1',
          invoiceId: 'INV-B1-3001',
          lineNumber: 1,
          studentChargeId: 'CHG-3001-1',
          feeType: 'School fee',
          description: 'School Fee Term 4 (Secondary 4)',
          components: [{ name: 'Standard tuition', amountCents: 5400 }],
          grossCents: 5400,
          subsidyCents: 0,
          netCents: 5400,
          dueDate: '2026-10-31',
        },
      ],
    },

    // C1 Invoice
    {
      id: 'INV-C1-4001',
      invoiceNumber: 'INV-2026-4001',
      studentId: 'ST-C1-8R6Y',
      schoolId: 'SCH-MSS',
      schoolName: 'Marsiling Secondary School',
      grossCents: 5400,
      subsidyCents: 0,
      netCents: 5400,
      status: 'Issued',
      issuedAt: '2026-10-01T08:00:00Z',
      dueDate: '2026-10-31',
      rowVersion: 1,
      items: [
        {
          id: 'ITEM-4001-1',
          invoiceId: 'INV-C1-4001',
          lineNumber: 1,
          studentChargeId: 'CHG-4001-1',
          feeType: 'School fee',
          description: 'School Fee Term 4 (Secondary 4)',
          components: [{ name: 'Standard tuition', amountCents: 5400 }],
          grossCents: 5400,
          subsidyCents: 0,
          netCents: 5400,
          dueDate: '2026-10-31',
        },
      ],
    },

    // C2 Invoices (4101 Issued, 4102 PaymentPending with pending online transaction)
    {
      id: 'INV-C2-4101',
      invoiceNumber: 'INV-2026-4101',
      studentId: 'ST-C2-2N9Z',
      schoolId: 'SCH-MSS',
      schoolName: 'Marsiling Secondary School',
      grossCents: 5400,
      subsidyCents: 0,
      netCents: 5400,
      status: 'Issued',
      issuedAt: '2026-10-01T08:00:00Z',
      dueDate: '2026-10-31',
      rowVersion: 1,
      items: [
        {
          id: 'ITEM-4101-1',
          invoiceId: 'INV-C2-4101',
          lineNumber: 1,
          studentChargeId: 'CHG-4101-1',
          feeType: 'School fee',
          description: 'School Fee Term 4 (Secondary 1)',
          components: [{ name: 'Standard tuition', amountCents: 5400 }],
          grossCents: 5400,
          subsidyCents: 0,
          netCents: 5400,
          dueDate: '2026-10-31',
        },
      ],
    },
    {
      id: 'INV-C2-4102',
      invoiceNumber: 'INV-2026-4102',
      studentId: 'ST-C2-2N9Z',
      schoolId: 'SCH-MSS',
      schoolName: 'Marsiling Secondary School',
      grossCents: 4500,
      subsidyCents: 0,
      netCents: 4500, // SGD 45.00
      status: 'PaymentPending',
      issuedAt: '2026-10-02T08:00:00Z',
      dueDate: '2026-11-10',
      rowVersion: 2,
      items: [
        {
          id: 'ITEM-4102-1',
          invoiceId: 'INV-C2-4102',
          lineNumber: 1,
          studentChargeId: 'CHG-4102-1',
          feeType: 'Extracurricular',
          description: 'Swimming Programme Term 4',
          components: [{ name: 'Pool access & coaching', amountCents: 4500 }],
          grossCents: 4500,
          subsidyCents: 0,
          netCents: 4500,
          dueDate: '2026-11-10',
        },
      ],
    },

    // D1 Invoices (PR - no EA, online only)
    {
      id: 'INV-D1-5001',
      invoiceNumber: 'INV-2026-5001',
      studentId: 'ST-D1-4H1J',
      schoolId: 'SCH-LKP',
      schoolName: 'Lakeside Primary School',
      grossCents: 3800,
      subsidyCents: 0,
      netCents: 3800,
      status: 'Issued',
      issuedAt: '2026-10-01T08:00:00Z',
      dueDate: '2026-10-31',
      rowVersion: 1,
      items: [
        {
          id: 'ITEM-5001-1',
          invoiceId: 'INV-D1-5001',
          lineNumber: 1,
          studentChargeId: 'CHG-5001-1',
          feeType: 'School fee',
          description: 'School Fee Term 4 (Primary 3)',
          components: [{ name: 'Standard tuition', amountCents: 3800 }],
          grossCents: 3800,
          subsidyCents: 0,
          netCents: 3800,
          dueDate: '2026-10-31',
        },
      ],
    },
    {
      id: 'INV-D1-5002',
      invoiceNumber: 'INV-2026-5002',
      studentId: 'ST-D1-4H1J',
      schoolId: 'SCH-LKP',
      schoolName: 'Lakeside Primary School',
      grossCents: 7031,
      subsidyCents: 0,
      netCents: 7031,
      status: 'Issued',
      issuedAt: '2026-10-05T08:00:00Z',
      dueDate: '2026-11-15',
      rowVersion: 1,
      items: [
        {
          id: 'ITEM-5002-1',
          invoiceId: 'INV-D1-5002',
          lineNumber: 1,
          studentChargeId: 'CHG-5002-1',
          feeType: 'Miscellaneous',
          description: 'Textbooks (Primary 3)',
          components: [
            { name: 'Base materials', amountCents: 6450 },
            { name: 'GST (9%)', amountCents: 581 },
          ],
          grossCents: 7031,
          subsidyCents: 0,
          netCents: 7031,
          dueDate: '2026-11-15',
        },
      ],
    },

    // D2 Invoice (Foreigner)
    {
      id: 'INV-D2-5101',
      invoiceNumber: 'INV-2026-5101',
      studentId: 'ST-D2-6V3B',
      schoolId: 'SCH-MFS',
      schoolName: 'Mayflower Secondary School',
      grossCents: 5400,
      subsidyCents: 0,
      netCents: 5400,
      status: 'Issued',
      issuedAt: '2026-10-01T08:00:00Z',
      dueDate: '2026-10-31',
      rowVersion: 1,
      items: [
        {
          id: 'ITEM-5101-1',
          invoiceId: 'INV-D2-5101',
          lineNumber: 1,
          studentChargeId: 'CHG-5101-1',
          feeType: 'School fee',
          description: 'School Fee Term 4 (Secondary 3)',
          components: [{ name: 'Standard tuition', amountCents: 5400 }],
          grossCents: 5400,
          subsidyCents: 0,
          netCents: 5400,
          dueDate: '2026-10-31',
        },
      ],
    },

    // E1 Invoice (6yo)
    {
      id: 'INV-E1-6001',
      invoiceNumber: 'INV-2026-6001',
      studentId: 'ST-E1-1Q5C',
      schoolId: 'SCH-LPS',
      schoolName: 'Lianhua Primary School',
      grossCents: 3800,
      subsidyCents: 0,
      netCents: 3800,
      status: 'Issued',
      issuedAt: '2026-10-01T08:00:00Z',
      dueDate: '2026-10-31',
      rowVersion: 1,
      items: [
        {
          id: 'ITEM-6001-1',
          invoiceId: 'INV-E1-6001',
          lineNumber: 1,
          studentChargeId: 'CHG-6001-1',
          feeType: 'School fee',
          description: 'School Fee Term 4 (Primary 1)',
          components: [{ name: 'Standard tuition', amountCents: 3800 }],
          grossCents: 3800,
          subsidyCents: 0,
          netCents: 3800,
          dueDate: '2026-10-31',
        },
      ],
    },

    // E2 Invoice (7yo today)
    {
      id: 'INV-E2-6101',
      invoiceNumber: 'INV-2026-6101',
      studentId: 'ST-E2-9T7D',
      schoolId: 'SCH-BVP',
      schoolName: 'Bukit View Primary School',
      grossCents: 3800,
      subsidyCents: 0,
      netCents: 3800,
      status: 'Issued',
      issuedAt: '2026-10-01T08:00:00Z',
      dueDate: '2026-10-31',
      rowVersion: 1,
      items: [
        {
          id: 'ITEM-6101-1',
          invoiceId: 'INV-E2-6101',
          lineNumber: 1,
          studentChargeId: 'CHG-6101-1',
          feeType: 'School fee',
          description: 'School Fee Term 4 (Primary 1)',
          components: [{ name: 'Standard tuition', amountCents: 3800 }],
          grossCents: 3800,
          subsidyCents: 0,
          netCents: 3800,
          dueDate: '2026-10-31',
        },
      ],
    },

    // E3 Invoice (7yo today, missing gender)
    {
      id: 'INV-E3-6102',
      invoiceNumber: 'INV-2026-6102',
      studentId: 'ST-E3-8U4E',
      schoolId: 'SCH-BVP',
      schoolName: 'Bukit View Primary School',
      grossCents: 3800,
      subsidyCents: 0,
      netCents: 3800,
      status: 'Issued',
      issuedAt: '2026-10-01T08:00:00Z',
      dueDate: '2026-10-31',
      rowVersion: 1,
      items: [
        {
          id: 'ITEM-6102-1',
          invoiceId: 'INV-E3-6102',
          lineNumber: 1,
          studentChargeId: 'CHG-6102-1',
          feeType: 'School fee',
          description: 'School Fee Term 4 (Primary 1)',
          components: [{ name: 'Standard tuition', amountCents: 3800 }],
          grossCents: 3800,
          subsidyCents: 0,
          netCents: 3800,
          dueDate: '2026-10-31',
        },
      ],
    },

    // F1 Invoice (Single child shortcut test)
    {
      id: 'INV-F1-7001',
      invoiceNumber: 'INV-2026-7001',
      studentId: 'ST-F1-7S2M',
      schoolId: 'SCH-BVP',
      schoolName: 'Bukit View Primary School',
      grossCents: 3800,
      subsidyCents: 0,
      netCents: 3800, // SGD 38.00
      status: 'Issued',
      issuedAt: '2026-10-01T08:00:00Z',
      dueDate: '2026-10-31',
      rowVersion: 1,
      items: [
        {
          id: 'ITEM-7001-1',
          invoiceId: 'INV-F1-7001',
          lineNumber: 1,
          studentChargeId: 'CHG-7001-1',
          feeType: 'School fee',
          description: 'School Fee Term 4 (Primary 4)',
          components: [{ name: 'Standard tuition', amountCents: 3800 }],
          grossCents: 3800,
          subsidyCents: 0,
          netCents: 3800,
          dueDate: '2026-10-31',
        },
      ],
    },
  ];

  // Transactions (Seed with pending transaction on C2, and paid on A2)
  const transactions: Transaction[] = [
    {
      id: 'TXN-A2-2000',
      invoiceId: 'INV-A2-2000',
      studentId: 'ST-A2-9M4L',
      initiatedByUserId: 'USR-LM-9921',
      transactionReference: 'PAY-20260720-001928',
      idempotencyKey: 'IDEMP-A2-2000-SEED',
      requestedCents: 5400,
      settledCents: 5400,
      status: 'Succeeded',
      createdAt: '2026-07-20T10:14:30Z',
      completedAt: '2026-07-20T10:15:00Z',
      legs: [
        {
          id: 'LEG-A2-2000-EA',
          transactionId: 'TXN-A2-2000',
          sequence: 1,
          fundingReference: 'FUND-20260720-EA01',
          method: 'EducationAccount',
          requestedCents: 5400,
          settledCents: 5400,
          status: 'Succeeded',
          walletId: 'EA-2012-050614-A2',
        },
      ],
    },
    {
      id: 'TXN-C2-4102',
      invoiceId: 'INV-C2-4102',
      studentId: 'ST-C2-2N9Z',
      initiatedByUserId: 'USR-SA-4411',
      transactionReference: 'PAY-20261012-004102',
      idempotencyKey: 'IDEMP-C2-4102-SEED',
      requestedCents: 4500,
      settledCents: 0,
      status: 'Pending',
      createdAt: '2026-10-12T14:30:00Z',
      legs: [
        {
          id: 'LEG-C2-4102-ONL',
          transactionId: 'TXN-C2-4102',
          sequence: 1,
          fundingReference: 'FUND-20261012-ONL01',
          method: 'OnlineGateway',
          requestedCents: 4500,
          settledCents: 0,
          status: 'Pending',
          providerCode: 'SANDBOX_PAY',
          providerTransactionId: 'PRV-TXN-4102',
        },
      ],
    },
  ];

  // Helper to generate realistic ledger history
  const generateLedgers = (): EaLedgerEntry[] => {
    const list: EaLedgerEntry[] = [];

    // Helper for generating student entries
    const populateStudent = (
      accNum: string,
      targetCents: number,
      startYear: number,
      isSecondaryAtStart: boolean,
      extraFailedEntry: boolean = false
    ) => {
      let accumulated = 0;
      let count = 0;

      // Seed yearly top-ups and quarterly deductions from startYear up to 2026
      for (let y = startYear; y <= 2026; y++) {
        // Top-up in January
        const topUpAmt = y < 2024 ? 29000 : 34000;
        accumulated += topUpAmt;
        count++;
        list.push({
          id: `LED-${accNum}-${count}`,
          accountNumber: accNum,
          direction: 'in',
          amountCents: topUpAmt,
          type: 'Top-up',
          status: 'Completed',
          channel: 'ea',
          description: `Edusave / Education Account Annual Top-up ${y}`,
          date: `${y}-01-15`,
          fundingReference: `FND-TOPUP-${y}-${accNum.slice(-2)}`,
        });

        // 4 Quarterly school fees
        const schoolFee = isSecondaryAtStart || y >= 2024 ? 5400 : 3800;
        for (let q = 1; q <= 4; q++) {
          if (y === 2026 && q === 4) break; // Q4 2026 is currently unpaid
          accumulated -= schoolFee;
          count++;
          const month = String(q * 3).padStart(2, '0');
          list.push({
            id: `LED-${accNum}-${count}`,
            accountNumber: accNum,
            direction: 'out',
            amountCents: schoolFee,
            type: 'Fee payment',
            status: 'Completed',
            channel: 'ea',
            description: `School Fee Term ${q} (${schoolFee === 5400 ? 'Secondary' : 'Primary'})`,
            date: `${y}-${month}-25`,
            fundingReference: `FND-FEE-${y}Q${q}-${accNum.slice(-2)}`,
          });
        }

        // Yearly books
        if (y <= 2025) {
          const bookFee = 4500;
          accumulated -= bookFee;
          count++;
          list.push({
            id: `LED-${accNum}-${count}`,
            accountNumber: accNum,
            direction: 'out',
            amountCents: bookFee,
            type: 'Fee payment',
            status: 'Completed',
            channel: 'ea',
            description: `Curriculum Textbooks & Materials ${y}`,
            date: `${y}-11-20`,
            fundingReference: `FND-BOOK-${y}-${accNum.slice(-2)}`,
          });
        }
      }

      // If extra failed entry requested (e.g. for A1)
      if (extraFailedEntry) {
        count++;
        list.push({
          id: `LED-${accNum}-${count}-FAIL`,
          accountNumber: accNum,
          direction: 'out',
          amountCents: 12000,
          type: 'Fee payment',
          status: 'Failed',
          channel: 'ea',
          description: 'Special Overseas Immersion Trip (Declined: Exceeds Limit)',
          date: '2026-03-12',
          fundingReference: `FND-FAIL-${accNum.slice(-2)}`,
        });
      }

      // Plug entry to exactly match the target balance
      const difference = targetCents - accumulated;
      if (difference !== 0) {
        count++;
        list.push({
          id: `LED-${accNum}-${count}-PLUG`,
          accountNumber: accNum,
          direction: difference > 0 ? 'in' : 'out',
          amountCents: Math.abs(difference),
          type: difference > 0 ? 'Top-up' : 'Fee payment',
          status: 'Completed',
          channel: 'ea',
          description: difference > 0 ? 'Government Educational Grant Top-up' : 'Co-curricular Programme Enrichment Fee',
          date: '2026-09-01',
          fundingReference: `FND-PLUG-${accNum.slice(-2)}`,
        });
      }
    };

    // A1: Target 455.07 SGD (45507 cents), start 2023, has Failed entry
    populateStudent('EA-2016-100820-A1', 45507, 2023, false, true);

    // A2: Target 20.00 SGD (2000 cents), start 2019, Secondary
    populateStudent('EA-2012-050614-A2', 2000, 2019, true);

    // B1: Target 0.00 SGD, start 2017
    populateStudent('EA-2010-101416-B1', 0, 2017, true);

    // B2: Target 310.00 SGD (31000 cents), start 2019
    populateStudent('EA-2012-031014-B2', 31000, 2019, false);

    // C1: Target 112.40 SGD (11240 cents), start 2017
    populateStudent('EA-2010-060216-C1', 11240, 2017, true);

    // C2: Target 85.00 SGD (8500 cents), start 2020
    populateStudent('EA-2013-021113-C2', 8500, 2020, false);

    // Add pending online transaction ledger entry for C2 (doesn't alter EA balance, labeled 'online')
    list.push({
      id: 'LED-C2-PENDING-ONL',
      accountNumber: 'EA-2013-021113-C2',
      direction: 'out',
      amountCents: 4500,
      type: 'Fee payment',
      status: 'Pending',
      channel: 'online',
      description: 'Swimming Programme Term 4 (Online Gateway)',
      date: '2026-10-12',
      fundingReference: 'FUND-20261012-ONL01',
    });

    // F1: Target 200.00 SGD (20000 cents), start 2023
    populateStudent('EA-2016-021110-F1', 20000, 2023, false);

    // G1: Closed, balance 0
    populateStudent('EA-2010-011016-G1', 0, 2017, true);

    return list;
  };

  const ledgerEntries = generateLedgers();

  // Initial SyncLog from Initial Sync (seed)
  const syncLogs: SyncLog[] = [
    {
      id: 'SYNC-INIT-001',
      processingRef: 'SYNC-REF-20261013-INITIAL',
      jobName: 'Initial',
      triggerType: 'System',
      status: 'Completed',
      startedAt: '2026-10-13T02:00:00Z',
      completedAt: '2026-10-13T02:05:22Z',
      totalRecords: 12,
      successful: 8,
      failed: 0,
      skipped: 4,
      failureReasons: [],
      lastCoveredDate: '2026-10-13',
    },
  ];

  const auditLogs: AuditLog[] = [
    {
      id: 'AUD-001',
      actor: 'SYSTEM',
      action: 'INITIAL_SEED',
      entity: 'ALL',
      entityId: 'SYSTEM',
      oldValue: '',
      newValue: 'SEED_INITIALIZED',
      timestamp: '2026-10-14T00:00:00Z',
    },
  ];

  const securityLogs: SecurityLog[] = [];

  return {
    citizenRecords,
    students,
    parents,
    educationAccounts,
    invoices,
    transactions,
    ledgerEntries,
    syncLogs,
    auditLogs,
    securityLogs,
    webhookReceipts: [] as any[],
  };
}

/**
 * Section 4.2: selfTest() invariant checking function.
 * Verifies all financial, ledger, and state machine constraints.
 */
export function selfTest(data: ReturnType<typeof createInitialSeed>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // 1. EA Ledger sum matches balanceCents and is non-negative
  for (const ea of data.educationAccounts) {
    if (ea.balanceCents < 0) {
      errors.push(`EA ${ea.accountNumber} has negative balance: ${ea.balanceCents}`);
    }
    const completedEaLegs = data.ledgerEntries.filter(
      (e) => e.accountNumber === ea.accountNumber && e.channel === 'ea' && e.status === 'Completed'
    );
    const sumCents = completedEaLegs.reduce((acc, curr) => {
      return curr.direction === 'in' ? acc + curr.amountCents : acc - curr.amountCents;
    }, 0);
    if (sumCents !== ea.balanceCents) {
      errors.push(
        `EA ${ea.accountNumber} ledger sum (${sumCents}) does not equal balance (${ea.balanceCents})`
      );
    }
  }

  // 2. Invoice invariants
  for (const inv of data.invoices) {
    if (inv.netCents !== inv.grossCents - inv.subsidyCents) {
      errors.push(`Invoice ${inv.invoiceNumber} net (${inv.netCents}) != gross - subsidy`);
    }
    if (inv.status === 'Issued' && inv.netCents <= 0) {
      errors.push(`Invoice ${inv.invoiceNumber} is Issued but net <= 0`);
    }
    const itemsSum = inv.items.reduce((acc, it) => acc + it.netCents, 0);
    if (itemsSum !== inv.netCents) {
      errors.push(`Invoice ${inv.invoiceNumber} items net sum (${itemsSum}) != invoice net (${inv.netCents})`);
    }
    for (const item of inv.items) {
      const compSum = item.components.reduce((acc, c) => acc + c.amountCents, 0);
      if (compSum !== item.grossCents) {
        errors.push(`Item ${item.description} components sum (${compSum}) != gross (${item.grossCents})`);
      }
    }
  }

  // 3. Transactions invariants
  for (const tx of data.transactions) {
    const legSum = tx.legs.reduce((acc, leg) => acc + leg.requestedCents, 0);
    if (legSum !== tx.requestedCents) {
      errors.push(`Txn ${tx.transactionReference} leg sum (${legSum}) != requested (${tx.requestedCents})`);
    }
    for (const leg of tx.legs) {
      if (leg.requestedCents <= 0) {
        errors.push(`Leg ${leg.id} requested <= 0`);
      }
    }
    if (tx.status === 'Succeeded' && tx.settledCents !== tx.requestedCents) {
      errors.push(`Txn ${tx.transactionReference} Succeeded but settled != requested`);
    }
  }

  // 4. One EA per student, only Singapore Citizen
  const studentEaMap = new Map<string, string>();
  for (const ea of data.educationAccounts) {
    if (studentEaMap.has(ea.studentId)) {
      errors.push(`Duplicate EA for student ${ea.studentId}`);
    }
    studentEaMap.set(ea.studentId, ea.accountNumber);

    const student = data.students.find((s) => s.id === ea.studentId);
    if (student && student.citizenship !== 'Citizen') {
      errors.push(`Student ${student.id} (${student.fullName}) is ${student.citizenship} but has EA!`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

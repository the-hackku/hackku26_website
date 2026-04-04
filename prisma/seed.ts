import { PrismaClient, ROLE } from '@prisma/client'
import * as readline from 'readline'
import constants from '../constants'

const prisma = new PrismaClient()

async function confirmDatabaseUrl(): Promise<void> {
  const url = process.env.POSTGRES_PRISMA_URL ?? '(not set)'
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  await new Promise<void>((resolve, reject) => {
    rl.question(`\nAbout to seed database:\n  ${url}\n\nProceed? (yes/no): `, (answer) => {
      rl.close()
      if (answer.toLowerCase() === 'yes') {
        resolve()
      } else {
        console.log('Aborted.')
        reject(new Error('User aborted seed'))
      }
    })
  })
}

const firstNames = [
  'Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey',
  'Riley', 'Avery', 'Quinn', 'Drew', 'Blake',
  'Sam', 'Skylar', 'Reese', 'Parker', 'Jamie',
  'Peyton', 'Logan', 'Harper', 'Finley', 'Rowan',
  'Emma', 'Liam', 'Olivia', 'Noah', 'Ava',
  'William', 'Sophia', 'James', 'Isabella', 'Oliver',
]

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones',
  'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
  'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
  'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
  'Lee', 'Perez', 'Thompson', 'White', 'Harris',
  'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson',
]

const schools = [
  'University of Kansas',
  'Kansas State University',
  'University of Missouri',
  'Iowa State University',
  'University of Nebraska',
  'Wichita State University',
  'Emporia State University',
]

const majors = [
  'Computer Science',
  'Software Engineering',
  'Electrical Engineering',
  'Mathematics',
  'Data Science',
  'Cybersecurity',
  'Information Technology',
]

const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
const genders = ['Man', 'Woman', 'Non-binary', 'Prefer not to say']
const races = [
  'White',
  'Black or African American',
  'Asian',
  'Hispanic or Latino',
  'Multiracial',
  'Prefer not to say',
]

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function fakePhone(i: number): string {
  return `555-${String(i + 1000).padStart(4, '0')}`
}

async function main() {
  await confirmDatabaseUrl()
  console.log('Clearing existing seed data...')
  try {
    await prisma.participantInfo.deleteMany()
    await prisma.themedRoomReservation.deleteMany()
    await prisma.reservationRequest.deleteMany()
    await prisma.checkin.deleteMany()
    await prisma.scan.deleteMany()
    await prisma.reimbursementInvite.deleteMany()
    await prisma.travelReimbursement.deleteMany()
    await prisma.session.deleteMany()
    await prisma.account.deleteMany()
    await prisma.user.deleteMany()
    await prisma.themedRoom.deleteMany()
    await prisma.event.deleteMany()
  } catch {
    console.log('Nothing to clear, continuing...')
  }

  // --- Themed Rooms ---
  const rooms = await Promise.all([
    prisma.themedRoom.create({ data: { name: 'Dungeon Hall', location: 'Engineering Hall Room 1450' } }),
    prisma.themedRoom.create({ data: { name: 'Dragon Den', location: 'Learned Hall Room 212' } }),
    prisma.themedRoom.create({ data: { name: 'Fairy Forest', location: 'Eaton Hall Room 2001B' } }),
    prisma.themedRoom.create({ data: { name: 'Shadow Spire', location: 'Nichols Hall Room 246' } }),
    prisma.themedRoom.create({ data: { name: 'Arcane Library', location: 'Watson Library Room 320' } }),
  ])
  console.log(`Created ${rooms.length} themed rooms`)

  // --- Users ---
  type UserDef = { role: ROLE; email: string; firstName: string; lastName: string }
  const userDefs: UserDef[] = []

  for (let i = 0; i < 3; i++) {
    userDefs.push({ role: 'ADMIN', email: `admin${i + 1}@hackku.test`, firstName: firstNames[i], lastName: lastNames[i] })
  }
  for (let i = 0; i < 7; i++) {
    userDefs.push({ role: 'VOLUNTEER', email: `volunteer${i + 1}@hackku.test`, firstName: firstNames[i + 3], lastName: lastNames[i + 3] })
  }
  for (let i = 0; i < 20; i++) {
    userDefs.push({ role: 'HACKER', email: `hacker${i + 1}@hackku.test`, firstName: firstNames[i + 10], lastName: lastNames[i + 10] })
  }

  let created = 0
  for (const [idx, def] of userDefs.entries()) {
    const user = await prisma.user.create({
      data: {
        name: `${def.firstName} ${def.lastName}`,
        email: def.email,
        role: def.role,
        emailVerified: new Date(),
      },
    })

    await prisma.participantInfo.create({
      data: {
        userId: user.id,
        firstName: def.firstName,
        lastName: def.lastName,
        phoneNumber: fakePhone(idx),
        age: Math.floor(Math.random() * 6) + 18,
        genderIdentity: pick(genders),
        race: pick(races),
        hispanicOrLatino: Math.random() > 0.8 ? 'Yes' : 'No',
        countryOfResidence: 'United States',
        isHighSchoolStudent: false,
        currentSchool: pick(schools),
        levelOfStudy: 'Undergraduate',
        major: pick(majors),
        previousHackathons: Math.floor(Math.random() * 5),
        tShirtSize: pick(sizes),
        agreeHackKUCode: true,
        agreeMLHCode: true,
        shareWithMLH: Math.random() > 0.3,
        receiveEmails: Math.random() > 0.2,
      },
    })

    created++
  }

  console.log(`Created ${created} users with ParticipantInfo (3 admin, 7 volunteer, 20 hacker)`)

  // --- Events ---
  // dt(dayOffset, cdtHour, cdtMinute?) → UTC Date
  // dayOffset: 0 = Friday, 1 = Saturday, 2 = Sunday
  // CDT = UTC−5, so cdtHour + 5 = utcHour
  const friday = new Date(constants.startDate)
  friday.setUTCHours(0, 0, 0, 0)
  const DAY = 86_400_000
  const HOUR = 3_600_000
  const MIN = 60_000
  const CDT_OFFSET = 5 // hours behind UTC
  function dt(dayOffset: number, cdtHour: number, cdtMinute = 0): Date {
    return new Date(friday.getTime() + dayOffset * DAY + (cdtHour + CDT_OFFSET) * HOUR + cdtMinute * MIN)
  }

  const events = await Promise.all([
    // Friday evening (day 0)
    prisma.event.create({ data: { name: 'Check-In',          startDate: dt(0, 17),     endDate: dt(0, 19),     location: 'Engineering Hall Atrium',    description: 'Pick up your badge, swag bag, and get settled in.',          eventType: 'REQUIRED'   } }),
    prisma.event.create({ data: { name: 'Opening Ceremony',  startDate: dt(0, 19),     endDate: dt(0, 20),     location: 'Eaton Hall Auditorium',       description: 'Welcome to HackKU 2026! Hear from organizers and sponsors.', eventType: 'REQUIRED'   } }),
    prisma.event.create({ data: { name: 'Hacking Begins',    startDate: dt(0, 20),     endDate: dt(0, 20, 30), location: 'Engineering Hall',            description: 'Submissions open — start building!',                        eventType: 'REQUIRED'   } }),
    prisma.event.create({ data: { name: 'Dinner',            startDate: dt(0, 20, 30), endDate: dt(0, 21, 30), location: 'Engineering Hall Lobby',      description: 'Fuel up for the first night of hacking.',                   eventType: 'FOOD'       } }),

    // Friday night / early Saturday (day 1)
    prisma.event.create({ data: { name: 'Midnight Snack',    startDate: dt(1, 0, 30),  endDate: dt(1, 1),      location: 'Engineering Hall Lobby',      description: 'Late-night snacks to keep you going.',                      eventType: 'FOOD'       } }),

    // Saturday (day 1)
    prisma.event.create({ data: { name: 'Breakfast',         startDate: dt(1, 8),      endDate: dt(1, 9),      location: 'Engineering Hall Lobby',      description: 'Start your morning right.',                                 eventType: 'FOOD'       } }),
    prisma.event.create({ data: { name: 'Intro to ML Workshop', startDate: dt(1, 10), endDate: dt(1, 11),      location: 'Nichols Hall Room 246',       description: 'Hands-on introduction to machine learning with scikit-learn.', eventType: 'WORKSHOPS' } }),
    prisma.event.create({ data: { name: 'Sponsor Tech Talk', startDate: dt(1, 11, 30), endDate: dt(1, 12, 30), location: 'Eaton Hall Room 2001B',       description: 'Learn about cutting-edge tech from our sponsors.',           eventType: 'SPONSOR'   } }),
    prisma.event.create({ data: { name: 'Lunch',             startDate: dt(1, 12),     endDate: dt(1, 13),     location: 'Engineering Hall Lobby',      description: 'Midday refuel.',                                            eventType: 'FOOD'       } }),
    prisma.event.create({ data: { name: 'Web Dev Workshop',  startDate: dt(1, 14),     endDate: dt(1, 15),     location: 'Nichols Hall Room 246',       description: 'Build modern web apps with Next.js and Tailwind CSS.',       eventType: 'WORKSHOPS' } }),
    prisma.event.create({ data: { name: 'Cup Stacking Tournament', startDate: dt(1, 15, 30), endDate: dt(1, 16, 30), location: 'Engineering Hall Atrium', description: 'Take a break and compete in the legendary cup stacking contest.', eventType: 'ACTIVITIES' } }),
    prisma.event.create({ data: { name: 'Dinner',            startDate: dt(1, 17),     endDate: dt(1, 18),     location: 'Engineering Hall Lobby',      description: 'Evening dinner — keep the energy up!',                      eventType: 'FOOD'       } }),

    // Saturday night / early Sunday (day 2)
    prisma.event.create({ data: { name: 'Midnight Snack',    startDate: dt(2, 0),      endDate: dt(2, 0, 30),  location: 'Engineering Hall Lobby',      description: 'Second night snacks.',                                      eventType: 'FOOD'       } }),

    // Sunday (day 2)
    prisma.event.create({ data: { name: 'Breakfast',         startDate: dt(2, 8),      endDate: dt(2, 9),      location: 'Engineering Hall Lobby',      description: 'Final morning breakfast before submissions close.',          eventType: 'FOOD'       } }),
    prisma.event.create({ data: { name: 'Submissions Due',   startDate: dt(2, 10),     endDate: dt(2, 10, 30), location: 'Devpost',                     description: 'All projects must be submitted by this time.',              eventType: 'REQUIRED'   } }),
    prisma.event.create({ data: { name: 'Project Expo',      startDate: dt(2, 11),     endDate: dt(2, 13),     location: 'Engineering Hall Atrium',     description: 'Demo your project to judges and other hackers.',            eventType: 'REQUIRED'   } }),
    prisma.event.create({ data: { name: 'Closing Ceremony',  startDate: dt(2, 13, 30), endDate: dt(2, 15),     location: 'Eaton Hall Auditorium',       description: 'Awards, prizes, and farewell.',                             eventType: 'REQUIRED'   } }),
  ])
  console.log(`Created ${events.length} events`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())

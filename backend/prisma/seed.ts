import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clean existing data
  await prisma.leaderboard.deleteMany();
  await prisma.awarenessArticle.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.certificate.deleteMany();
  await prisma.donation.deleteMany();
  await prisma.campRegistration.deleteMany();
  await prisma.bloodCamp.deleteMany();
  await prisma.bloodBuddy.deleteMany();
  await prisma.eligibilityCheck.deleteMany();
  await prisma.user.deleteMany();

  // Create hashed passwords
  const adminPasswordHash = bcrypt.hashSync('admin123', 10);
  const donorPasswordHash = bcrypt.hashSync('donor123', 10);

  // Seed Users
  const admin = await prisma.user.create({
    data: {
      name: 'NSS Coordinator',
      email: 'admin@rudhiraconnect.org',
      password: adminPasswordHash,
      phone: '9876543210',
      college: 'National Engineering College',
      district: 'Thiruvananthapuram',
      role: 'ADMIN',
    },
  });

  const donor = await prisma.user.create({
    data: {
      name: 'Sajan Mathew',
      email: 'donor@gmail.com',
      password: donorPasswordHash,
      phone: '9447123456',
      college: 'Government Engineering College',
      district: 'Ernakulam',
      bloodGroup: 'O+NEGETIVE', // Optional
      role: 'USER',
    },
  });

  const referralDonor = await prisma.user.create({
    data: {
      name: 'John Doe',
      email: 'john@gmail.com',
      password: donorPasswordHash,
      phone: '9447111222',
      college: 'Government Engineering College',
      district: 'Ernakulam',
      bloodGroup: 'A+',
      role: 'USER',
    },
  });

  console.log('Users seeded:', { admin: admin.email, donor: donor.email, ref: referralDonor.email });

  // Seed BloodBuddy referral
  await prisma.bloodBuddy.create({
    data: {
      inviterId: donor.id,
      inviteeId: referralDonor.id,
      status: 'JOINED',
      joinedDate: new Date(),
    },
  });

  // Seed Blood Camps
  const camp1 = await prisma.bloodCamp.create({
    data: {
      title: 'Mega NSS Blood Donation Camp',
      description: 'Annual Mega camp organized by NSS Unit 42. Refreshments, certificates, and badges will be provided.',
      location: 'Main Auditorium, GEC Ernakulam',
      district: 'Ernakulam',
      date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      time: '09:00 AM - 04:00 PM',
      organizer: 'NSS Unit 42',
      latitude: 9.9312,
      longitude: 76.2673,
    },
  });

  const camp2 = await prisma.bloodCamp.create({
    data: {
      title: 'City Youth Club Donation Camp',
      description: 'Blood donation drive focusing on working professionals and youth. Supported by Regional Blood Bank.',
      location: 'Town Hall, Aluva',
      district: 'Ernakulam',
      date: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000), // 12 days from now
      time: '08:30 AM - 01:30 PM',
      organizer: 'Aluva Youth Club',
      latitude: 10.1076,
      longitude: 76.3480,
    },
  });

  const camp3 = await prisma.bloodCamp.create({
    data: {
      title: 'Capital City NSS Drive',
      description: 'NSS District coordination blood camp. Open for college students across the district.',
      location: 'University College Campus, MG Road',
      district: 'Thiruvananthapuram',
      date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      time: '09:00 AM - 03:00 PM',
      organizer: 'NSS District Cell',
      latitude: 8.5061,
      longitude: 76.9515,
    },
  });

  console.log('Camps seeded:', [camp1.title, camp2.title, camp3.title]);

  // Seed Camp Registration for Referral Donor
  await prisma.campRegistration.create({
    data: {
      userId: referralDonor.id,
      campId: camp1.id,
      status: 'REGISTERED',
    },
  });

  // Seed Completed Donation for Referral Donor (so admin can verify it)
  await prisma.donation.create({
    data: {
      userId: referralDonor.id,
      campId: camp1.id,
      donationDate: new Date(),
      bloodBank: 'IMA Blood Bank Ernakulam',
      status: 'PENDING',
    },
  });

  // Seed Awareness Articles
  await prisma.awarenessArticle.createMany({
    data: [
      {
        title: 'The Lifesaving Benefits of Donating Blood',
        content: `Donating blood doesn't just save the lives of the recipients. It also has key health benefits for the donors themselves. Regular blood donation is linked to lower blood pressure and a lower risk for heart attacks. 
        
        When you donate, your body works to replenish the blood loss. This stimulates the production of new red blood cells, which helps keep your system running smoothly and efficiently. Furthermore, before you donate, you receive a free mini-health screening which checks your pulse, blood pressure, body temperature, and hemoglobin levels. This can sometimes detect unknown underlying conditions early.`,
        category: 'STORY',
        image: 'https://images.unsplash.com/photo-1615461066841-6116e61058f4?q=80&w=600&auto=format&fit=crop',
      },
      {
        title: 'Debunking Common Myths About Blood Donation',
        content: `**Myth 1: Donating blood is extremely painful.**
        *Fact:* You will feel a quick, brief pinch when the needle is inserted, but the actual donation process is relatively painless. The discomfort is minor compared to the life-saving impact.

        **Myth 2: I am too old or weak to donate blood.**
        *Fact:* Anyone between the ages of 18 and 65, weighing over 45-50 kg and in good health, can donate blood. Your body starts replenishing fluids within 24 to 48 hours.

        **Myth 3: You can contract diseases, like HIV, from donating blood.**
        *Fact:* A sterile, brand-new needle is used for every single donor and is discarded immediately after. It is physically impossible to contract blood-borne diseases from donating blood.`,
        category: 'GUIDELINE',
        image: 'https://images.unsplash.com/photo-1579154204601-01588f351167?q=80&w=600&auto=format&fit=crop',
      },
      {
        title: 'NSS Volunteer Success Story: 15 Donations and Counting',
        content: `Rahul Dev, a lead NSS volunteer at GEC, shares his experience: "I gave blood for the first time during my first-year NSS camp. I was terrified of needles. But when I saw my fellow volunteers signing up, I joined. The coordinator walked me through it, and in 10 minutes it was over. Knowing that my single donation could save up to three lives changed my perspective. I have made it a habit to donate every 3 months since. It makes me feel connected to my community."`,
        category: 'STORY',
        image: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?q=80&w=600&auto=format&fit=crop',
      },
    ],
  });

  console.log('Awareness articles seeded.');

  // Seed Leaderboard
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  await prisma.leaderboard.createMany({
    data: [
      {
        college: 'Government Engineering College, Ernakulam',
        totalDonations: 45,
        bloodBuddyPoints: 120,
        month: currentMonth,
        year: currentYear,
      },
      {
        college: 'National Engineering College, Thiruvananthapuram',
        totalDonations: 38,
        bloodBuddyPoints: 95,
        month: currentMonth,
        year: currentYear,
      },
      {
        college: 'Model Engineering College, Ernakulam',
        totalDonations: 30,
        bloodBuddyPoints: 70,
        month: currentMonth,
        year: currentYear,
      },
      {
        college: 'University College, Thiruvananthapuram',
        totalDonations: 25,
        bloodBuddyPoints: 60,
        month: currentMonth,
        year: currentYear,
      },
    ],
  });

  console.log('Leaderboard seeded.');
  console.log('Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import mongoose from 'mongoose';
import { faker } from '@faker-js/faker';
import bcrypt from 'bcryptjs';

import { env } from '../config/env';
import { User } from '../modules/auth/auth.model';
import { Workspace } from '../modules/workspace/workspace.model';
import { Board } from '../modules/board/board.model';
import { logger } from '../utils/logger';

const NUM_USERS = 5;
const WORKSPACES_PER_USER = 2;
const BOARDS_PER_WORKSPACE = 3;

const seedDB = async () => {
  try {
    logger.info('Connecting to MongoDB...');
    await mongoose.connect(env.MONGODB_URI);
    logger.info('Connected.');

    logger.info('Clearing existing data...');
    await User.deleteMany({});
    await Workspace.deleteMany({});
    await Board.deleteMany({});
    logger.info('Data cleared.');

    logger.info('Generating users...');
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);

    const users = [];
    for (let i = 0; i < NUM_USERS; i++) {
      const user = await User.create({
        name: faker.person.fullName(),
        email: faker.internet.email().toLowerCase(),
        password: passwordHash,
        verified: true,
      });
      users.push(user);
    }
    
    // Add one static test user for easier login
    const testUser = await User.create({
      name: 'Test User',
      email: 'test@opas.com',
      password: passwordHash,
      verified: true,
    });
    users.push(testUser);

    logger.info(`Generated ${users.length} users.`);

    logger.info('Generating workspaces and boards...');
    for (const user of users) {
      for (let w = 0; w < WORKSPACES_PER_USER; w++) {
        const workspace = await Workspace.create({
          name: `${user.name.split(' ')[0]}'s Workspace ${w + 1}`,
          owner: user._id,
          inviteCode: faker.string.alphanumeric(8),
          members: [
            {
              user: user._id,
              role: 'owner',
            },
          ],
        });

        for (let b = 0; b < BOARDS_PER_WORKSPACE; b++) {
          await Board.create({
            title: faker.company.catchPhrase(),
            workspaceId: workspace._id,
            createdBy: user._id,
          });
        }
      }
    }
    
    logger.info('Database seeded successfully!');
    logger.info('---');
    logger.info('Test User Login:');
    logger.info('Email: test@opas.com');
    logger.info('Password: password123');
    logger.info('---');

    process.exit(0);
  } catch (error) {
    logger.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDB();

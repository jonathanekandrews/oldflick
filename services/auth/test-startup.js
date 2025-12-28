import dotenv from 'dotenv';
dotenv.config();

console.log('Loading logger...');
import { createLogger } from '../shared/utils/logger.js';
const logger = createLogger('test');
console.log('Logger loaded');

console.log('Importing routes...');
import routes from './routes.js';
console.log('Routes loaded');

console.log('All imports successful!');

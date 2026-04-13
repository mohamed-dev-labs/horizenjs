/**
 * Horizen.js - High Performance API Library
 * (c) 2026 Manus AI & User
 */

export * from './core/HorizenClient';
export * from './middleware/HorizenMiddleware';

import { HorizenClient } from './core/HorizenClient';
import { HorizenMiddleware } from './middleware/HorizenMiddleware';

export default {
  Client: HorizenClient,
  Middleware: HorizenMiddleware
};

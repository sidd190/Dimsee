<<<<<<< HEAD
import frontend from './frontend';

// ES Module entry point
export {frontend};
export {backend} from './backend';
=======
// ES Module entry point
export { createAuthBackend, authMiddleware } from './backend/index.js';
export { default as AuthStatus } from './frontend/src/components/AuthStatus';
export { default as useAuth } from './frontend/src/hooks/useAuth';
export { default as AuthForm } from './frontend/src/components/AuthForm'; 
>>>>>>> 36e4d2f10472aaa87b7d60a021de779f61fbb3e9

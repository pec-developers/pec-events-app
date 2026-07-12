import * as mockAuth from './auth.mock';
import * as realAuth from './auth.real';

// Toggle this flag to easily switch between local frontend-only mock and live backend connectivity.
// We force USE_MOCK to false during test environments to allow Vitest/MSW to run.
const USE_MOCK = import.meta.env.MODE !== 'test';

export const registerUser = USE_MOCK ? mockAuth.registerUser : realAuth.registerUser;
export const loginUser = USE_MOCK ? mockAuth.loginUser : realAuth.loginUser;
export const logoutUser = USE_MOCK ? mockAuth.logoutUser : realAuth.logoutUser;
export const forgotPassword = USE_MOCK ? mockAuth.forgotPassword : realAuth.forgotPassword;
export const resetPassword = USE_MOCK ? mockAuth.resetPassword : realAuth.resetPassword;
export const getCurrentUser = USE_MOCK ? mockAuth.getCurrentUser : realAuth.getCurrentUser;

// Admin SPOC CRUD
export const getSPOCs = USE_MOCK ? mockAuth.getSPOCs : realAuth.getSPOCs;
export const createSPOC = USE_MOCK ? mockAuth.createSPOC : realAuth.createSPOC;
export const updateSPOC = USE_MOCK ? mockAuth.updateSPOC : realAuth.updateSPOC;
export const deleteSPOC = USE_MOCK ? mockAuth.deleteSPOC : realAuth.deleteSPOC;

// SPOC Coordinator CRUD
export const getCoordinators = USE_MOCK ? mockAuth.getCoordinators : realAuth.getCoordinators;
export const createCoordinator = USE_MOCK ? mockAuth.createCoordinator : realAuth.createCoordinator;
export const updateCoordinator = USE_MOCK ? mockAuth.updateCoordinator : realAuth.updateCoordinator;
export const deleteCoordinator = USE_MOCK ? mockAuth.deleteCoordinator : realAuth.deleteCoordinator;

// SPOC Student/Faculty CRUD
export const getDeptUsers = USE_MOCK ? mockAuth.getDeptUsers : realAuth.getDeptUsers;
export const createDeptUser = USE_MOCK ? mockAuth.createDeptUser : realAuth.createDeptUser;
export const updateDeptUser = USE_MOCK ? mockAuth.updateDeptUser : realAuth.updateDeptUser;
export const deleteDeptUser = USE_MOCK ? mockAuth.deleteDeptUser : realAuth.deleteDeptUser;

export type {
  RegisterRequest,
  LoginRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  AuthResponse,
  UserResponse,
  SPOCResponse
} from './auth.types';

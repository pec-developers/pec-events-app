import type {
  RegisterRequest,
  LoginRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  AuthResponse,
  UserResponse
} from './auth.types';

interface MockUserEntry {
  userId: string;
  name: string;
  email: string;
  role: string;
  department: string | null;
  registrationNumber: string | null;
  password?: string;
}

// Seed initial mock users if not present
const initializeMockUsers = (): MockUserEntry[] => {
  const defaultUsers: MockUserEntry[] = [
    {
      userId: 'usr_admin_001',
      name: 'System Admin',
      email: 'admin@pec.edu',
      role: 'ADMIN',
      department: null,
      registrationNumber: null,
      password: 'admin123'
    },
    {
      userId: 'usr_spoc_cse',
      name: 'CSE Department SPOC',
      email: 'cse_spoc@pec.edu',
      role: 'SPOC',
      department: 'CSE',
      registrationNumber: null,
      password: 'password123'
    },
    {
      userId: 'usr_spoc_ece',
      name: 'ECE Department SPOC',
      email: 'ece_spoc@pec.edu',
      role: 'SPOC',
      department: 'ECE',
      registrationNumber: null,
      password: 'password123'
    },
    {
      userId: 'usr_student_123',
      name: 'Student Test',
      email: 'student@pec.edu',
      role: 'STUDENT',
      department: 'CSE',
      registrationNumber: 'PEC-100234',
      password: 'password123'
    },
    {
      userId: 'usr_faculty_888',
      name: 'Faculty Test',
      email: 'faculty@pec.edu',
      role: 'FACULTY',
      department: 'CSE',
      registrationNumber: 'PEC-900888',
      password: 'password123'
    },
    {
      userId: 'usr_coord_456',
      name: 'Faculty Coordinator Test',
      email: 'coordinator@pec.edu',
      role: 'FACULTY_COORDINATOR',
      department: 'CSE',
      registrationNumber: 'PEC-100001',
      password: 'password123'
    },
    {
      userId: 'usr_student_coord_789',
      name: 'Student Coordinator Test',
      email: 'student_coord@pec.edu',
      role: 'STUDENT_COORDINATOR',
      department: 'CSE',
      registrationNumber: 'PEC-100002',
      password: 'password123'
    }
  ];

  try {
    const data = localStorage.getItem('pec_mock_users');
    if (!data) {
      localStorage.setItem('pec_mock_users', JSON.stringify(defaultUsers));
      return defaultUsers;
    }
    return JSON.parse(data);
  } catch (e) {
    return defaultUsers;
  }
};

const getMockUsers = (): MockUserEntry[] => {
  try {
    const data = localStorage.getItem('pec_mock_users');
    return data ? JSON.parse(data) : initializeMockUsers();
  } catch (e) {
    return initializeMockUsers();
  }
};

const saveMockUsers = (users: MockUserEntry[]) => {
  localStorage.setItem('pec_mock_users', JSON.stringify(users));
};

const getActiveSession = (): MockUserEntry | null => {
  try {
    const data = sessionStorage.getItem('pec_mock_session');
    return data ? JSON.parse(data) : null;
  } catch (e) {
    return null;
  }
};

const saveActiveSession = (user: MockUserEntry | null) => {
  if (user) {
    sessionStorage.setItem('pec_mock_session', JSON.stringify(user));
  } else {
    sessionStorage.removeItem('pec_mock_session');
  }
};

export const registerUser = async (payload: RegisterRequest): Promise<AuthResponse> => {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const users = getMockUsers();
  const existing = users.find((u) => u.email.toLowerCase() === payload.email.toLowerCase());
  if (existing) {
    throw new Error('Email address is already registered.');
  }

  let role = payload.role || 'STUDENT';
  if (!payload.role) {
    const emailLower = payload.email.toLowerCase();
    if (emailLower.includes('admin')) {
      role = 'ADMIN';
    } else if (emailLower.includes('faculty') || emailLower.includes('prof')) {
      role = 'FACULTY';
    } else if (emailLower.includes('coord') || emailLower.includes('lead')) {
      role = 'STUDENT_COORDINATOR';
    }
  }

  const newUser: MockUserEntry = {
    userId: `usr_${Math.random().toString(36).substring(2, 11)}`,
    name: payload.name,
    email: payload.email,
    role,
    department: payload.department || 'CSE',
    registrationNumber: payload.registrationNumber,
    password: payload.password || 'password123'
  };

  users.push(newUser);
  saveMockUsers(users);

  return {
    userId: newUser.userId,
    name: newUser.name,
    email: newUser.email,
    role: newUser.role,
    department: newUser.department,
    registrationNumber: newUser.registrationNumber
  };
};

export const loginUser = async (payload: LoginRequest): Promise<AuthResponse> => {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const users = getMockUsers();
  const user = users.find(
    (u) =>
      u.email.toLowerCase() === payload.email.toLowerCase() &&
      u.password === payload.password
  );

  if (!user) {
    throw new Error('Invalid email or password.');
  }

  // Check expected role group matching
  if (payload.expectedRoleGroup) {
    const role = user.role.toUpperCase();
    if (payload.expectedRoleGroup === 'student' && role !== 'STUDENT') {
      throw new Error('This account is not registered as a Student.');
    }
    if (payload.expectedRoleGroup === 'faculty' && role !== 'FACULTY') {
      throw new Error('This account is not registered as a general Faculty.');
    }
    if (payload.expectedRoleGroup === 'coordinator' && role !== 'STUDENT_COORDINATOR' && role !== 'FACULTY_COORDINATOR') {
      throw new Error('This account is not registered as an Event Coordinator.');
    }
    if (payload.expectedRoleGroup === 'spoc' && role !== 'SPOC') {
      throw new Error('This account is not registered as a Department SPOC.');
    }
    if (payload.expectedRoleGroup === 'admin' && role !== 'ADMIN') {
      throw new Error('This account is not registered as a System Administrator.');
    }
  }

  saveActiveSession(user);

  return {
    userId: user.userId,
    name: user.name,
    email: user.email,
    role: user.role,
    department: user.department,
    registrationNumber: user.registrationNumber,
    accessToken: 'mock-access-token'
  };
};

export const logoutUser = async (): Promise<void> => {
  saveActiveSession(null);
};

export const forgotPassword = async (_payload: ForgotPasswordRequest): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 100));
};

export const resetPassword = async (_payload: ResetPasswordRequest): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 100));
};

export const getCurrentUser = async (): Promise<UserResponse> => {
  const session = getActiveSession();
  if (!session) {
    throw new Error('No active session');
  }
  return {
    userId: session.userId,
    name: session.name,
    email: session.email,
    role: session.role,
    department: session.department,
    registrationNumber: session.registrationNumber
  };
};

// ==========================================
// ADMIN WORKFLOWS - SPOC CRUD
// ==========================================

export const getSPOCs = async (): Promise<UserResponse[]> => {
  await new Promise((resolve) => setTimeout(resolve, 200));
  const users = getMockUsers();
  return users
    .filter((u) => u.role === 'SPOC')
    .map((u) => ({
      userId: u.userId,
      name: u.name,
      email: u.email,
      role: u.role,
      department: u.department,
      registrationNumber: u.registrationNumber
    }));
};

export const createSPOC = async (payload: {
  name: string;
  email: string;
  department: string;
  password?: string;
}): Promise<UserResponse> => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const users = getMockUsers();

  // Validate duplicate department SPOC
  const existingSPOC = users.find(
    (u) => u.role === 'SPOC' && u.department?.toUpperCase() === payload.department.toUpperCase()
  );
  if (existingSPOC) {
    throw new Error(`A SPOC already exists for the ${payload.department} department.`);
  }

  // Validate duplicate email
  const existingEmail = users.find((u) => u.email.toLowerCase() === payload.email.toLowerCase());
  if (existingEmail) {
    throw new Error('This email address is already in use.');
  }

  const newSPOC: MockUserEntry = {
    userId: `usr_spoc_${Math.random().toString(36).substring(2, 9)}`,
    name: payload.name,
    email: payload.email,
    role: 'SPOC',
    department: payload.department.toUpperCase(),
    registrationNumber: null,
    password: payload.password || 'password123'
  };

  users.push(newSPOC);
  saveMockUsers(users);

  return {
    userId: newSPOC.userId,
    name: newSPOC.name,
    email: newSPOC.email,
    role: newSPOC.role,
    department: newSPOC.department,
    registrationNumber: null
  };
};

export const updateSPOC = async (
  userId: string,
  payload: {
    name: string;
    email: string;
    department: string;
    password?: string;
  }
): Promise<UserResponse> => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const users = getMockUsers();
  const userIdx = users.findIndex((u) => u.userId === userId && u.role === 'SPOC');
  if (userIdx === -1) {
    throw new Error('SPOC not found.');
  }

  // Validate duplicate department SPOC
  const dupDept = users.find(
    (u) =>
      u.role === 'SPOC' &&
      u.userId !== userId &&
      u.department?.toUpperCase() === payload.department.toUpperCase()
  );
  if (dupDept) {
    throw new Error(`A SPOC already exists for the ${payload.department} department.`);
  }

  // Validate duplicate email
  const dupEmail = users.find(
    (u) => u.userId !== userId && u.email.toLowerCase() === payload.email.toLowerCase()
  );
  if (dupEmail) {
    throw new Error('This email address is already in use.');
  }

  users[userIdx].name = payload.name;
  users[userIdx].email = payload.email;
  users[userIdx].department = payload.department.toUpperCase();
  if (payload.password) {
    users[userIdx].password = payload.password;
  }

  saveMockUsers(users);

  return {
    userId: users[userIdx].userId,
    name: users[userIdx].name,
    email: users[userIdx].email,
    role: users[userIdx].role,
    department: users[userIdx].department,
    registrationNumber: null
  };
};

export const deleteSPOC = async (userId: string): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 200));
  let users = getMockUsers();
  const exist = users.some((u) => u.userId === userId && u.role === 'SPOC');
  if (!exist) {
    throw new Error('SPOC not found.');
  }

  users = users.filter((u) => u.userId !== userId);
  saveMockUsers(users);
};

// ==========================================
// SPOC WORKFLOWS - COORDINATORS CRUD
// ==========================================

export const getCoordinators = async (department: string): Promise<UserResponse[]> => {
  await new Promise((resolve) => setTimeout(resolve, 200));
  const users = getMockUsers();
  return users
    .filter(
      (u) =>
        (u.role === 'STUDENT_COORDINATOR' || u.role === 'FACULTY_COORDINATOR') &&
        u.department?.toUpperCase() === department.toUpperCase()
    )
    .map((u) => ({
      userId: u.userId,
      name: u.name,
      email: u.email,
      role: u.role,
      department: u.department,
      registrationNumber: u.registrationNumber
    }));
};

export const createCoordinator = async (payload: {
  name: string;
  email: string;
  department: string;
  role: 'STUDENT_COORDINATOR' | 'FACULTY_COORDINATOR';
  registrationNumber: string;
  password?: string;
}): Promise<UserResponse> => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const users = getMockUsers();

  // Enforce Max 3 of each role group in the department
  const existingCoordsOfRole = users.filter(
    (u) =>
      u.role === payload.role &&
      u.department?.toUpperCase() === payload.department.toUpperCase()
  );
  if (existingCoordsOfRole.length >= 3) {
    const roleLabel = payload.role === 'STUDENT_COORDINATOR' ? 'Student Coordinators' : 'Faculty Coordinators';
    throw new Error(`Max limit of 3 ${roleLabel} exceeded for the ${payload.department} department.`);
  }

  // Validate email
  const emailEx = users.find((u) => u.email.toLowerCase() === payload.email.toLowerCase());
  if (emailEx) {
    throw new Error('This email address is already in use.');
  }

  // Validate registration number
  const regEx = users.find(
    (u) =>
      u.registrationNumber?.toUpperCase() === payload.registrationNumber.toUpperCase()
  );
  if (regEx) {
    throw new Error('This registration number is already assigned.');
  }

  const newCoordinator: MockUserEntry = {
    userId: `usr_coord_${Math.random().toString(36).substring(2, 9)}`,
    name: payload.name,
    email: payload.email,
    role: payload.role,
    department: payload.department.toUpperCase(),
    registrationNumber: payload.registrationNumber.toUpperCase(),
    password: payload.password || 'password123'
  };

  users.push(newCoordinator);
  saveMockUsers(users);

  return {
    userId: newCoordinator.userId,
    name: newCoordinator.name,
    email: newCoordinator.email,
    role: newCoordinator.role,
    department: newCoordinator.department,
    registrationNumber: newCoordinator.registrationNumber
  };
};

export const updateCoordinator = async (
  userId: string,
  payload: {
    name: string;
    email: string;
    role: 'STUDENT_COORDINATOR' | 'FACULTY_COORDINATOR';
    registrationNumber: string;
    password?: string;
  }
): Promise<UserResponse> => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const users = getMockUsers();
  const userIdx = users.findIndex((u) => u.userId === userId);
  if (userIdx === -1) {
    throw new Error('User not found.');
  }

  const currentDept = users[userIdx].department || 'CSE';

  // Check role capacity limits if role is changing
  if (users[userIdx].role !== payload.role) {
    const existingCoordsOfRole = users.filter(
      (u) =>
        u.role === payload.role &&
        u.department?.toUpperCase() === currentDept.toUpperCase()
    );
    if (existingCoordsOfRole.length >= 3) {
      const roleLabel = payload.role === 'STUDENT_COORDINATOR' ? 'Student Coordinators' : 'Faculty Coordinators';
      throw new Error(`Max limit of 3 ${roleLabel} exceeded for the ${currentDept} department.`);
    }
  }

  // Validate duplicate email
  const dupEmail = users.find(
    (u) => u.userId !== userId && u.email.toLowerCase() === payload.email.toLowerCase()
  );
  if (dupEmail) {
    throw new Error('This email address is already in use.');
  }

  // Validate duplicate registration number
  const dupReg = users.find(
    (u) =>
      u.userId !== userId &&
      u.registrationNumber?.toUpperCase() === payload.registrationNumber.toUpperCase()
  );
  if (dupReg) {
    throw new Error('This registration number is already assigned.');
  }

  users[userIdx].name = payload.name;
  users[userIdx].email = payload.email;
  users[userIdx].role = payload.role;
  users[userIdx].registrationNumber = payload.registrationNumber.toUpperCase();
  if (payload.password) {
    users[userIdx].password = payload.password;
  }

  saveMockUsers(users);

  return {
    userId: users[userIdx].userId,
    name: users[userIdx].name,
    email: users[userIdx].email,
    role: users[userIdx].role,
    department: users[userIdx].department,
    registrationNumber: users[userIdx].registrationNumber
  };
};

export const deleteCoordinator = async (userId: string): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 200));
  let users = getMockUsers();
  const idx = users.findIndex(
    (u) => u.userId === userId && (u.role === 'STUDENT_COORDINATOR' || u.role === 'FACULTY_COORDINATOR')
  );
  if (idx === -1) {
    throw new Error('Coordinator not found.');
  }

  users.splice(idx, 1);
  saveMockUsers(users);
};

// ==========================================
// SPOC WORKFLOWS - STUDENTS & FACULTY CRUD
// ==========================================

export const getDeptUsers = async (department: string): Promise<UserResponse[]> => {
  await new Promise((resolve) => setTimeout(resolve, 200));
  const users = getMockUsers();
  return users
    .filter(
      (u) =>
        (u.role === 'STUDENT' || u.role === 'FACULTY') &&
        u.department?.toUpperCase() === department.toUpperCase()
    )
    .map((u) => ({
      userId: u.userId,
      name: u.name,
      email: u.email,
      role: u.role,
      department: u.department,
      registrationNumber: u.registrationNumber
    }));
};

export const createDeptUser = async (payload: {
  name: string;
  email: string;
  department: string;
  role: 'STUDENT' | 'FACULTY';
  registrationNumber: string;
  password?: string;
}): Promise<UserResponse> => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const users = getMockUsers();

  // Validate duplicate email
  const dupEmail = users.find((u) => u.email.toLowerCase() === payload.email.toLowerCase());
  if (dupEmail) {
    throw new Error('This email address is already in use.');
  }

  // Validate duplicate registration number
  const dupReg = users.find(
    (u) =>
      u.registrationNumber?.toUpperCase() === payload.registrationNumber.toUpperCase()
  );
  if (dupReg) {
    throw new Error('This registration number is already assigned.');
  }

  const newUser: MockUserEntry = {
    userId: `usr_dept_${Math.random().toString(36).substring(2, 9)}`,
    name: payload.name,
    email: payload.email,
    role: payload.role,
    department: payload.department.toUpperCase(),
    registrationNumber: payload.registrationNumber.toUpperCase(),
    password: payload.password || 'password123'
  };

  users.push(newUser);
  saveMockUsers(users);

  return {
    userId: newUser.userId,
    name: newUser.name,
    email: newUser.email,
    role: newUser.role,
    department: newUser.department,
    registrationNumber: newUser.registrationNumber
  };
};

export const updateDeptUser = async (
  userId: string,
  payload: {
    name: string;
    email: string;
    role: 'STUDENT' | 'FACULTY';
    registrationNumber: string;
    password?: string;
  }
): Promise<UserResponse> => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const users = getMockUsers();
  const userIdx = users.findIndex((u) => u.userId === userId);
  if (userIdx === -1) {
    throw new Error('User not found.');
  }

  // Validate email
  const dupEmail = users.find(
    (u) => u.userId !== userId && u.email.toLowerCase() === payload.email.toLowerCase()
  );
  if (dupEmail) {
    throw new Error('This email address is already in use.');
  }

  // Validate registration number
  const dupReg = users.find(
    (u) =>
      u.userId !== userId &&
      u.registrationNumber?.toUpperCase() === payload.registrationNumber.toUpperCase()
  );
  if (dupReg) {
    throw new Error('This registration number is already assigned.');
  }

  users[userIdx].name = payload.name;
  users[userIdx].email = payload.email;
  users[userIdx].role = payload.role;
  users[userIdx].registrationNumber = payload.registrationNumber.toUpperCase();
  if (payload.password) {
    users[userIdx].password = payload.password;
  }

  saveMockUsers(users);

  return {
    userId: users[userIdx].userId,
    name: users[userIdx].name,
    email: users[userIdx].email,
    role: users[userIdx].role,
    department: users[userIdx].department,
    registrationNumber: users[userIdx].registrationNumber
  };
};

export const deleteDeptUser = async (userId: string): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 200));
  let users = getMockUsers();
  const idx = users.findIndex(
    (u) => u.userId === userId && (u.role === 'STUDENT' || u.role === 'FACULTY')
  );
  if (idx === -1) {
    throw new Error('User not found.');
  }

  users.splice(idx, 1);
  saveMockUsers(users);
};

import { NextFunction, Request, Response } from 'express';
import { authService } from '../services/auth';

function validateSignup(body: any) {
  const { email, password, fname, lname, role } = body;
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    throw { status: 400, message: 'Invalid or missing email' };
  }
  if (!password || typeof password !== 'string' || password.length < 8) {
    throw { status: 400, message: 'Password must be at least 8 characters' };
  }
  if (!fname || typeof fname !== 'string') {
    throw { status: 400, message: 'First name is required' };
  }
  if (!lname || typeof lname !== 'string') {
    throw { status: 400, message: 'Last name is required' };
  }
  const roles = ['COACH', 'PLAYER', 'PARENT', 'FAN'];
  if (!role || !roles.includes(role)) {
    throw { status: 400, message: 'Invalid or missing role' };
  }
  return { email, password, fname, lname, role };
}

function validateLogin(body: any) {
  const { email, password } = body;
  if (!email || typeof email !== 'string') {
    throw { status: 400, message: 'Email is required' };
  }
  if (!password || typeof password !== 'string') {
    throw { status: 400, message: 'Password is required' };
  }
  return { email, password };
}

function validateRefresh(body: any) {
  const { token } = body;
  if (!token || typeof token !== 'string') {
    throw { status: 400, message: 'Refresh token is required' };
  }
  return { token };
}

export const getMockLogins = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  try {
    const user = await authService.getMockLogin();
    if (!user) {
      return res.status(404).json({ message: 'Mock user not found' });
    }
    res.json(user);
    console.log(user);
  } catch (error) {
    console.error('Error fetching mock user:', error);
    res.status(500).json({ error: 'Failed to fetch mock user' });
  }
};

export async function signupBase(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const input = validateSignup(req.body);
    const user = await authService.signUpBase(input);
    return res.status(201).json(user);
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const input = validateLogin(req.body);
    const data = await authService.login(input);
    return res.json(data);
  } catch (err) {
    next(err);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const { token } = validateRefresh(req.body);
    const data = await authService.refreshToken(token);
    return res.json(data);
  } catch (err) {
    next(err);
  }
}

export async function logout(_req: Request, res: Response) {
  // Optionally revoke refresh here
  return res.sendStatus(204);
}

import * as usersService from '../services/users.service.js';

export async function list(req, res) {
  const users = await usersService.listUsers();
  res.status(200).json({ data: users });
}

export async function changeRole(req, res) {
  const user = await usersService.changeUserRole(req.params.id, req.body.role, req.user);
  res.status(200).json({ data: user });
}
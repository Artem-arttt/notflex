import * as directorsService from '../services/directors.service.js';

export async function list(req, res) {
  res.status(200).json({ data: await directorsService.listDirectors() });
}

export async function getById(req, res) {
  res.status(200).json({ data: await directorsService.getDirectorById(req.params.id) });
}

export async function create(req, res) {
  res.status(201).json({ data: await directorsService.createDirector(req.body) });
}

export async function update(req, res) {
  res.status(200).json({ data: await directorsService.updateDirector(req.params.id, req.body) });
}

export async function remove(req, res) {
  await directorsService.deleteDirector(req.params.id);
  res.status(200).json({ message: 'Режиссёр удалён', id: req.params.id });
}
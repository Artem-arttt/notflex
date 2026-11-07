import * as genresService from '../services/genres.service.js';

export async function list(req, res) {
  res.status(200).json({ data: await genresService.listGenres() });
}

export async function getById(req, res) {
  res.status(200).json({ data: await genresService.getGenreById(req.params.id) });
}

export async function create(req, res) {
  res.status(201).json({ data: await genresService.createGenre(req.body) });
}

export async function update(req, res) {
  res.status(200).json({ data: await genresService.updateGenre(req.params.id, req.body) });
}

export async function remove(req, res) {
  await genresService.deleteGenre(req.params.id);
  res.status(200).json({ message: 'Жанр удалён', id: req.params.id });
}
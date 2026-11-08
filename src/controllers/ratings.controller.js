import * as ratingsService from '../services/ratings.service.js';

export async function listForTitle(req, res) {
  const result = await ratingsService.listTitleRatings(req.params.id, req.validatedQuery);
  res.status(200).json(result);
}

export async function listMine(req, res) {
  const ratings = await ratingsService.listMyRatings(req.user.id);
  res.status(200).json({ data: ratings });
}

export async function create(req, res) {
  const rating = await ratingsService.createRating(req.user.id, req.params.id, req.body);
  res.status(201).json({ data: rating });
}

export async function update(req, res) {
  const rating = await ratingsService.updateRating(req.params.id, req.user, req.body);
  res.status(200).json({ data: rating });
}

export async function remove(req, res) {
  await ratingsService.deleteRating(req.params.id, req.user);
  res.status(200).json({ message: 'Оценка удалена', id: req.params.id });
}
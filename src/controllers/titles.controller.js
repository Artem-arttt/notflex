import * as titlesService from '../services/titles.service.js';

export async function list(req, res) {
  const result = await titlesService.listTitles(req.validatedQuery);
  res.status(200).json(result);
}

export async function getById(req, res) {
  const title = await titlesService.getTitleById(req.params.id);
  res.status(200).json({ data: title });
}

export async function create(req, res) {
  const title = await titlesService.createTitle(req.body);
  res.status(201).json({ data: title });
}

export async function update(req, res) {
  const title = await titlesService.updateTitle(req.params.id, req.body);
  res.status(200).json({ data: title });
}

export async function remove(req, res) {
  await titlesService.deleteTitle(req.params.id);
  res.status(200).json({ message: 'Тайтл удалён', id: req.params.id });
}
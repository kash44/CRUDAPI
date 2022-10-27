import { Response, Request, NextFunction } from 'express';
import { TodoWithId, Todos, Todo } from './todos.model';
import { ObjectId } from 'mongodb';
import { ZodError } from 'zod';
import { ParamsWithId } from '../../interfaces/ParamsWithId';

export async function findAll(
  req: Request,
  res: Response<TodoWithId[]>,
  next: NextFunction,
) {
  try {
    const todos = await Todos.find().toArray();
    res.json(todos);
  } catch (error) {
    next(error);
  }
}

export async function createOne(
  req: Request<{}, TodoWithId, Todo>,
  res: Response<TodoWithId>,
  next: NextFunction,
) {
  try {
    // const validateResult = await Todo.parseAsync(req.body);
    const insertResult = await Todos.insertOne(req.body);
    // The insertOne driver doesn't return what we inserted, it just returns whether or not it worked and the Id.
    // We can respond with an Object with has the Id.
    if (!insertResult.acknowledged) throw new Error('Error inserting Todo');
    res.status(201);
    res.json({
      _id: insertResult.insertedId,
      ...req.body,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(422);
    }
    next(error);
  }
}

export async function findOne(
  req: Request<ParamsWithId, TodoWithId, {}>,
  res: Response<TodoWithId>,
  next: NextFunction,
) {
  try {
    const result = await Todos.findOne({
      _id: new ObjectId(req.params.id),
    });
    if (!result) {
      res.status(404);
      throw new Error(`Todo with id "${req.params.id}" not found`);
    }
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function updateOne(
  req: Request<ParamsWithId, TodoWithId, Todo>,
  res: Response<TodoWithId>,
  next: NextFunction,
) {
  try {
    const result = await Todos.findOneAndUpdate(
      {
        _id: new ObjectId(req.params.id),
      },
      {
        $set: req.body,
      },
      {
        returnDocument: 'after',
      },
    );
    if (!result.value) {
      res.status(404);
      throw new Error(`Todo with id "${req.params.id}" not found.`);
    }
    res.json(result.value);
  } catch (error) {
    next(error);
  }
}

export async function deleteOne(
  req: Request<ParamsWithId, {}, {}>,
  res: Response<{}>,
  next: NextFunction,
) {
  try {
    const result = await Todos.findOneAndDelete({
      _id: new ObjectId(req.params.id),
    });
    if (!result.value) {
      res.status(404);
      throw new Error(`Todo with id "${req.params.id}" not found.`);
    }
    res.status(204).end();
  } catch (error) {
    next(error);
  }
}
// The controller and service(db stuff) architecture is good as the application scales.

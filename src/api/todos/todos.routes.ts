import { Router } from 'express';
import * as TodoControllers from './todos.controllers';
import { validateRequest } from '../../middlewares';
import { Todo } from './todos.model';
import { ParamsWithId } from '../../interfaces/ParamsWithId';

const router = Router();

// router.get<{}, Todo[]>('/', (req, res) => {
//     res.json([{ content: 'Learn TypeScript', done: false }]);
//   });

router.get('/', TodoControllers.findAll);
router.get(
  '/:id',
  validateRequest({
    params: ParamsWithId,
  }),
  TodoControllers.findOne,
);
router.post('/', validateRequest({ body: Todo }), TodoControllers.createOne);
router.put(
  '/:id',
  validateRequest({
    params: ParamsWithId,
    body: Todo,
  }),
  TodoControllers.updateOne,
);
router.delete(
  '/:id',
  validateRequest({
    params: ParamsWithId,
  }),
  TodoControllers.deleteOne,
);

export default router;

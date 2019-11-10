const todoList = require('../controllers/todoListController');
const userController = require('../controllers/userController');

const routes = app => {
  app.route('/').get(userController.index);

  app
    .route('/tasks')
    .get(todoList.list_all_tasks)
    .post(userController.loginRequired, todoList.create_a_task);

  app
    .route('/tasks/:taskId')
    .get(todoList.read_a_task)
    .put(todoList.update_a_task)
    .delete(todoList.delete_a_task);

  app.route('/api/users').get(userController.getAll);

  app.route('/auth/register').post(userController.register);

  app.route('/auth/sign-in').post(userController.signIn);

  app
    .route('/auth/forgot-password')
    .get(userController.renderForgotPasswordTemplate)
    .post(userController.forgotPassword);

  app
    .route('/auth/reset-password')
    .get(userController.renderResetPasswordTemplate)
    .post(userController.resetPassword);
};

module.exports = routes;

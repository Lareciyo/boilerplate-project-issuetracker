'use strict';

const { v4: uuidv4 } = require('uuid');

module.exports = function (app) {

  // In-memory storage (FCC allows this)
  let issues = [];

  app.route('/api/issues/:project')

    // =======================
    // GET
    // =======================
    .get((req, res) => {
      const project = req.params.project;
      const filters = req.query;

      let result = issues.filter(issue => issue.project === project);

      Object.keys(filters).forEach(key => {
        result = result.filter(issue => {
          if (issue[key] === undefined) return false;
          return issue[key].toString() === filters[key].toString();
        });
      });

      res.json(result);
    })

    // =======================
    // POST
    // =======================
    .post((req, res) => {
      const project = req.params.project;
      const {
        issue_title,
        issue_text,
        created_by,
        assigned_to = '',
        status_text = ''
      } = req.body;

      if (!issue_title || !issue_text || !created_by) {
        return res.json({ error: 'required field(s) missing' });
      }

      const newIssue = {
        _id: uuidv4(),
        project,
        issue_title,
        issue_text,
        created_by,
        assigned_to,
        status_text,
        created_on: new Date(),
        updated_on: new Date(),
        open: true
      };

      issues.push(newIssue);
      res.json(newIssue);
    })

    // =======================
    // PUT
    // =======================
    .put((req, res) => {
      const project = req.params.project;
      const { _id, ...updates } = req.body;

      // Missing _id
      if (!_id) {
        return res.json({ error: 'missing _id' });
      }

      // Remove empty update fields
      Object.keys(updates).forEach(key => {
        if (
          updates[key] === '' ||
          updates[key] === null ||
          updates[key] === undefined
        ) {
          delete updates[key];
        }
      });

      // 🚨 FCC TEST #9 REQUIREMENT
      if (Object.keys(updates).length === 0) {
        return res.json({
          error: 'no update field(s) sent',
          _id: _id
        });
      }

      const issue = issues.find(
        issue => issue._id === _id && issue.project === project
      );

      if (!issue) {
        return res.json({
          error: 'could not update',
          _id: _id
        });
      }

      Object.assign(issue, updates);
      issue.updated_on = new Date();

      res.json({
        result: 'successfully updated',
        _id: _id
      });
    })

    // =======================
    // DELETE
    // =======================
    .delete((req, res) => {
      const project = req.params.project;
      const { _id } = req.body;

      if (!_id) {
        return res.json({ error: 'missing _id' });
      }

      const index = issues.findIndex(
        issue => issue._id === _id && issue.project === project
      );

      if (index === -1) {
        return res.json({
          error: 'could not delete',
          _id: _id
        });
      }

      issues.splice(index, 1);

      res.json({
        result: 'successfully deleted',
        _id: _id
      });
    });
};

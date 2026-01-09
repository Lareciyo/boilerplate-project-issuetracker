'use strict';

const { v4: uuidv4 } = require('uuid');

let issues = [];

module.exports = function (app) {

  app.route('/api/issues/:project')

    // =========================
    // GET
    // =========================
    .get(function (req, res){
      let project = req.params.project;
      let filters = req.query;

      let filtered = issues.filter(issue => {
        if (issue.project !== project) return false;
        for (let key in filters) {
          if (issue[key] != filters[key]) return false;
        }
        return true;
      });

      res.json(filtered);
    })

    // =========================
    // POST
    // =========================
    .post(function (req, res){
      let project = req.params.project;
      const { issue_title, issue_text, created_by, assigned_to, status_text } = req.body;

      if (!issue_title || !issue_text || !created_by) {
        return res.json({ error: 'required field(s) missing' });
      }

      let now = new Date().toISOString();

      let newIssue = {
        _id: uuidv4(),
        project,
        issue_title,
        issue_text,
        created_by,
        assigned_to: assigned_to || '',
        status_text: status_text || '',
        created_on: now,
        updated_on: now,
        open: true
      };

      issues.push(newIssue);
      res.json(newIssue);
    })

    // =========================
    // PUT
    // =========================
    .put(function (req, res){
      let project = req.params.project;
      let { _id, ...updates } = req.body;

      if (!_id) {
        return res.json({ error: 'missing _id' });
      }

      let issue = issues.find(i => i._id === _id && i.project === project);
      if (!issue) {
        return res.json({ error: 'could not update', _id });
      }

      let updateKeys = Object.keys(updates).filter(k => updates[k] !== undefined && updates[k] !== '');

      if (updateKeys.length === 0) {
        return res.json({ error: 'no update field(s) sent', _id });
      }

      updateKeys.forEach(key => {
        issue[key] = updates[key];
      });

      issue.updated_on = new Date().toISOString();

      res.json({ result: 'successfully updated', _id });
    })

    // =========================
    // DELETE
    // =========================
    .delete(function (req, res){
      let project = req.params.project;
      let { _id } = req.body;

      if (!_id) {
        return res.json({ error: 'missing _id' });
      }

      let index = issues.findIndex(i => i._id === _id && i.project === project);

      if (index === -1) {
        return res.json({ error: 'could not delete', _id });
      }

      issues.splice(index, 1);
      res.json({ result: 'successfully deleted', _id });
    });
};

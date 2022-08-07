var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const Project = mongoose.model(
  'project',      // model name - usable for later retrieval
  new Schema({    // modelled schema
    Ep_project_id: String,
    Ep_projectName: String,
    Ep_priority: String,
    Ep_status: String,
    Ep_scheduledStartDate: Date,
    Ep_scheduledEndDate: Date,
    Ep_scheduledDuration: String,
    Ep_customers: String,
    Ep_managers: String, // Should be an array (comma delimited).
    Ep_tasks: [{
      Ep_TaskId: String,
      taskDescription: String,
      Ep_isMilestone: String,
      Ep_task_id: String,
      Ep_taskDescription: String,
      Ep_status: String,
      Ep_scheduledStartDate: Date,
      Ep_scheduledEndDate: Date,
      Ep_scheduledDuration: String,
      Ep_actualEndDate: Date,
      Ep_activityActualCompletionDate: Date,
      Ep_dependency: String,
      Ep_assignees: String,
      Ep_taskNum: Number,
      jobs: []
    }],
    Ep_projectId: Number,
    Ep_manager: String,
    Ep_actualEndDate: Date // seems to always be null or empty (i.e. "")
  }),
  'projects'      // collection name - infereable, but here anyways
);

module.exports = Project;

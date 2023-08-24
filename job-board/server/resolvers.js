import { GraphQLError } from "graphql";
import { createJob, deleteJob, getJob, getJobs, getJobsByCompany, updateJob } from "./db/jobs.js"
import { getCompany } from "./db/companies.js"

export const resolvers = {
  Query: {
    company: async (_root, { id }) => {
     const company = await getCompany(id);
     if(!company){
      throw notFoundError('No company found with id ' + id)
     }
     return company;
    },
    job: async (_root, { id }) => {
      const job = await getJob(id)
      if(!job){
        throw notFoundError('No job found with id ' + id)
      }
      return job;
    },
    jobs: () => getJobs(),
  },

  Mutation: {
    createJob: (_root, { input: { title, description } }) => {
       const companyId = "FjcJCHJALA4i"
       return createJob({ companyId, title, description})
    },
    updateJob: (_root, { input: { id, title, description } }) =>  updateJob({ id, title, description}),
    deleteJob: (_root, { input: { id } }) => deleteJob(id)
  },

  Company: {
    jobs: (company) => getJobsByCompany(company.id)
  },

  Job: {
    company: (job) =>   getCompany(job.companyId),
    date: (job) => toIsoDate(job.createdAt)
  }
}

function notFoundError(message){
  return new GraphQLError(message, {
    extensions: { code: 'NOT_FOUND' },
  })
}

function toIsoDate(value){
  return value.slice(0, 'yyyy-mm-dd'.length)
}
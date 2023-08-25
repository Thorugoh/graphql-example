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
    createJob: (_root, { input: { title, description } }, { user }) => {
      if(user){
        return createJob({ companyId: user.companyId, title, description})
      }
      throw unauthorizedError("User not authorized");
    },
    updateJob: async (_root, { input: { id, title, description } }, { user }) =>  {
      if(!user){
        throw unauthorizedError("User not authorized")
      }
      const job = await updateJob({ id, title, description, companyId: user.companyId})
      if(!job){
        throw notFoundError(`Job ${id} not found`);
      }
      return job;
    },
    deleteJob: async (_root, { input: { id } }, { user }) => {
      if(!user){
        throw unauthorizedError("User not authorized")
      }
      const job = await deleteJob({ id, companyId: user.companyId });
      if(!job){
        throw notFoundError(`Job ${id} not found`);
      }
      return job;
    }
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


function unauthorizedError(message){
  return new GraphQLError(message, {
    extensions: { code: 'UNAUTHORIZED' },
  })
}

function toIsoDate(value){
  return value.slice(0, 'yyyy-mm-dd'.length)
}
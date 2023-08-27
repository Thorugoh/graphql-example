import { useMutation, useQuery } from "@apollo/client";
import { companyByIdquery, createJobMutation, jobByIdQuery, jobsquery } from "./queries";

export function useCompany(id){
  const { data, loading, error } = useQuery(companyByIdquery, {
    variables: {id}
  });

  return {company: data?.company, loading, error: Boolean(error)}
}


export function useJob(id){
  const { data, loading, error } = useQuery(jobByIdQuery, {
    variables: {id}
  });

  return {job: data?.job, loading, error: Boolean(error)}
}


export function useJobs(limit, offset){
  const { data, loading, error } = useQuery(jobsquery, {
    variables: { limit, offset },
    fetchPolicy: 'network-only'
  });

  return {jobs: data?.jobs, loading, error: Boolean(error)}
}


export function useCreateJob(){
  const [mutation, result] = useMutation(createJobMutation);

  async function createJob({title, description}){
    const result = await mutation({
      variables: {input: { title, description }},
      update: (cache, { data }) => {
        cache.writeQuery({
          query: jobByIdQuery,
          variables: { id: data.job.id },
          data,
        })
      }
    })
    const { job } = result.data;
    return { job, ...result };
  }

  return { createJob, ...result }
}

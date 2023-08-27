import { ApolloClient, ApolloLink, InMemoryCache, concat, createHttpLink, gql } from "@apollo/client"
import { getAccessToken } from '../auth';

const httpLink = createHttpLink({ uri: 'http://localhost:9000/graphql' });

const customLink = new ApolloLink((operation, forward) => {
  const accessToken = getAccessToken();
  if(accessToken){
    operation.setContext({
      headers: { 'Authorization': `Bearer ${accessToken}` },
    });
  }
  return forward(operation);
});

export const apolloClient = new ApolloClient({
  link: concat(customLink, httpLink),
  cache: new InMemoryCache(),
})

export const companyByIdquery = gql`
    query CompanyById($id: ID!) {
      company(id: $id){
        id
        name
        description
        jobs {
          id
          title
          date
        }
      }
    }
  `
 export const createJobMutation = gql`
  mutation CreateJob($input: CreateJobInput!) {
    job: createJob(input: $input){
      id,
      date
      title
      company {
        id
        name
      }
      description
    }
  }
`

  
export async function createJob({title, description}){
  const query = gql`
    mutation CreateJob($input: CreateJobInput!) {
      job: createJob(input: $input){
        id,
        date
        title
        company {
          id
          name
        }
        description
      }
    }
  `

  const { data } = await apolloClient.mutate({
    mutation: query, 
    variables: {input: { title, description }},
    update: (cache, { data }) => {
      cache.writeQuery({
        query: jobByIdQuery,
        variables: { id: data.job.id },
        data,
      })
    }
  });
  return data.job;
}

export const jobByIdQuery = gql`
  query JobById($id: ID!) {
    job(id: $id){
      id
      date
      title
      company {
        id
        name
      }
      description
    }
  }
`;

export const jobsquery = gql`
  query Jobs($limit: Int, $offset: Int){
    jobs(limit: $limit, offset: $offset){
      items{
        id
        date
        title
        company {
          id
          name
        }
      }
      totalCount
    }
  }
`;
